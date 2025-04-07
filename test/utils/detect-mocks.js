#!/usr/bin/env node

/**
 * Mock Detection Utility
 * 
 * This script scans the codebase for potential mock implementations,
 * test stubs, or simulation fallbacks that should not be in production code.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import chalk from 'chalk';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..', '..');

// Directories to exclude from scanning
const EXCLUDED_DIRS = [
  'node_modules',
  '.git',
  '.next',
  '.vercel',
  'test',
  'dist',
  'build'
];

// Define patterns that might indicate mock implementations
const MOCK_PATTERNS = [
  {
    name: 'mock data variable',
    regex: /const\s+mock|let\s+mock|var\s+mock|const\s+fake|let\s+fake|var\s+fake/i,
    severity: 'high'
  },
  {
    name: 'mock function',
    regex: /function\s+mock|function\s+fake|function\s+stub|function\s+simulate/i, 
    severity: 'high'
  },
  {
    name: 'mock generator',
    regex: /generate(Random|Mock|Fake|Dummy|Test)/i,
    severity: 'high'
  },
  {
    name: 'development fallback check',
    regex: /(process\.env\.NODE_ENV\s*===?\s*('|")development('|")|\(process\.env\.NODE_ENV\s*===?\s*('|")development('|")\))/,
    severity: 'medium'
  },
  {
    name: 'test environment check',
    regex: /(process\.env\.NODE_ENV\s*===?\s*('|")test('|")|\(process\.env\.NODE_ENV\s*===?\s*('|")test('|")\))/,
    severity: 'medium'
  },
  {
    name: 'test data object',
    regex: /test(Data|Users|Items|Products|Values)/i,
    severity: 'medium'
  },
  {
    name: 'console warning suppression',
    regex: /\/\/\s*eslint-disable-next-line\s+no-console|\/\*\s*eslint-disable\s+no-console/,
    severity: 'low'
  },
  {
    name: 'deprecated API comment',
    regex: /\/\/\s*@deprecated|\/\*\*\s*@deprecated|\*\s*@deprecated|\s*\*\s+@deprecated/,
    severity: 'low'
  },
  {
    name: 'hardcoded credentials',
    regex: /(api|access|secret)[-_]?(key|token|id|password)(\s*=\s*|\s*:\s*)(['"`])[^\4]+\4/i,
    severity: 'high'
  },
  {
    name: 'todo comment',
    regex: /\/\/\s*TODO|\/\*\s*TODO|\*\s*TODO/i,
    severity: 'low'
  },
  {
    name: 'mockdata module import',
    regex: /import\s+.*\s+from\s+(['"]).*mock.*\1|require\s*\(\s*(['"]).*mock.*\2\s*\)/i,
    severity: 'high'
  },
  {
    name: 'fixed random seed',
    regex: /Math\.random\s*=\s*function|seedrandom|const\s+random\s*=\s*function/i,
    severity: 'medium'
  }
];

// File types to scan
const FILE_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx', '.vue', '.mjs', '.cjs'
];

// Function to scan a file for mock patterns
function scanFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const fileMatches = [];
    const fileExt = extname(filePath);
    
    // Skip minified files
    if (content.length > 0 && content.split(/\r?\n/).length === 1) {
      return fileMatches; // Likely minified
    }
    
    // Process file line by line for better reporting
    const lines = content.split(/\r?\n/);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;
      
      for (const pattern of MOCK_PATTERNS) {
        if (pattern.regex.test(line)) {
          fileMatches.push({
            file: filePath,
            line: lineNumber,
            text: line.trim(),
            pattern: pattern.name,
            severity: pattern.severity
          });
        }
      }
    }
    
    return fileMatches;
  } catch (error) {
    console.error(`Error scanning file ${filePath}:`, error.message);
    return [];
  }
}

// Function to scan directory recursively
function scanDirectory(dir, results = []) {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      // Skip excluded directories
      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRS.includes(entry.name)) {
          scanDirectory(fullPath, results);
        }
        continue;
      }
      
      // Check if it's a file we want to scan
      const ext = extname(entry.name).toLowerCase();
      if (FILE_EXTENSIONS.includes(ext)) {
        const fileMatches = scanFile(fullPath);
        results.push(...fileMatches);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error.message);
  }
  
  return results;
}

// Format the severity with color
function formatSeverity(severity) {
  switch (severity) {
    case 'high':
      return chalk.red.bold('HIGH');
    case 'medium':
      return chalk.yellow.bold('MEDIUM');
    case 'low':
      return chalk.blue('LOW');
    default:
      return severity;
  }
}

// Main function to run the scan
function runScan() {
  console.log(chalk.white.bold('\n=== Mock Implementation Detection ==='));
  console.log(chalk.white(`Scanning directory: ${ROOT_DIR}`));
  console.log(chalk.white('Looking for potential mock or test implementations that should not be in production...\n'));
  
  const startTime = Date.now();
  const results = scanDirectory(ROOT_DIR);
  const endTime = Date.now();
  
  console.log(chalk.white(`\nScan completed in ${((endTime - startTime) / 1000).toFixed(2)} seconds.`));
  console.log(chalk.white(`Found ${results.length} potential issues:\n`));
  
  // Group results by file for better readability
  const groupedResults = {};
  results.forEach(result => {
    // Convert the absolute path to relative path from project root
    const relPath = result.file.replace(ROOT_DIR + '/', '');
    
    if (!groupedResults[relPath]) {
      groupedResults[relPath] = [];
    }
    groupedResults[relPath].push(result);
  });
  
  // Print the findings
  for (const [file, issues] of Object.entries(groupedResults)) {
    console.log(chalk.white.bold(`File: ${file}`));
    
    for (const issue of issues) {
      console.log(`  Line ${issue.line} [${formatSeverity(issue.severity)}] - ${issue.pattern}`);
      console.log(`    ${chalk.grey(issue.text)}`);
    }
    
    console.log(''); // Empty line between files
  }
  
  // Summary by severity
  const highCount = results.filter(r => r.severity === 'high').length;
  const mediumCount = results.filter(r => r.severity === 'medium').length;
  const lowCount = results.filter(r => r.severity === 'low').length;
  
  console.log(chalk.white.bold('\nSummary:'));
  console.log(`  ${formatSeverity('high')} severity issues: ${highCount}`);
  console.log(`  ${formatSeverity('medium')} severity issues: ${mediumCount}`);
  console.log(`  ${formatSeverity('low')} severity issues: ${lowCount}`);
  console.log(`  ${chalk.white.bold('Total issues:')} ${results.length}`);
  
  return results.length > 0;
}

// Run directly if this script is executed
if (import.meta.url === `file://${process.argv[1]}`) {
  const foundIssues = runScan();
  
  // Return non-zero exit code if high or medium severity issues were found
  if (foundIssues) {
    process.exit(1);
  }
}

export default runScan; 