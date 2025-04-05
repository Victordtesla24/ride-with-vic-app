#!/usr/bin/env node

/**
 * Directory Structure Enforcement Script
 * 
 * This script checks that files are in their appropriate directories
 * and prevents creation of files in incorrect locations.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check for command line arguments
const REPORT_ONLY = process.argv.includes('--report-only');
const SHOW_HELP = process.argv.includes('--help') || process.argv.includes('-h');

if (SHOW_HELP) {
  console.log(`
Directory Structure Enforcement Script

Usage:
  node scripts/enforce-structure.js [options]

Options:
  --report-only     Generate a report without failing on errors
  --help, -h        Show this help message

Description:
  This script checks that files are in their appropriate directories
  and prevents creation of files in incorrect locations.
  `);
  process.exit(0);
}

// Define directory structure rules
const DIRECTORY_RULES = {
  // React components
  'components/': {
    allowedExtensions: ['.js', '.jsx', '.ts', '.tsx'],
    subdirectories: ['layout', 'customer', 'trip', 'vehicle', 'receipt', 'profile', 'theme'],
    validators: [
      (filePath) => {
        const basename = path.basename(filePath);
        // Component files should be PascalCase, except for index.js
        if (basename === 'index.js' || basename === 'index.ts' || 
            basename === 'index.jsx' || basename === 'index.tsx') {
          return null;
        }
        return /^[A-Z][a-zA-Z0-9]*\.(js|jsx|ts|tsx)$/.test(basename) ? null :
          `Component file ${basename} should be PascalCase`;
      }
    ]
  },
  // API routes
  'api/': {
    allowedExtensions: ['.js', '.ts'],
    subdirectories: ['auth', 'vehicle', 'trip', 'test'],
    validators: []
  },
  // Shared utilities
  'lib/': {
    allowedExtensions: ['.js', '.ts'],
    validators: []
  },
  // Data models
  'models/': {
    allowedExtensions: ['.js', '.ts'],
    validators: []
  },
  // Pages
  'pages/': {
    allowedExtensions: ['.js', '.jsx', '.ts', '.tsx', '.html'],
    validators: []
  },
  // Static assets
  'public/': {
    allowedExtensions: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.json', '.js'],
    subdirectories: ['icons'],
    validators: [],
    // Allow specific files at the root level
    rootAllowedFiles: ['manifest.json', 'sw.js']
  },
  // CSS styles
  'styles/': {
    allowedExtensions: ['.css', '.scss', '.sass', '.less'],
    validators: []
  },
  // Tests
  'test/': {
    allowedExtensions: ['.js', '.ts', '.jsx', '.tsx'],
    validators: []
  },
  // Deployment files including Docker
  'deployment/': {
    allowedExtensions: ['.yml', '.yaml', '.js', '.json', '.md', ''],
    subdirectories: ['docker', 'cloud', 'scripts'],
    validators: []
  },
  // Scripts
  'scripts/': {
    allowedExtensions: ['.js', '.ts', '.sh', '.py'],
    validators: []
  },
  // Husky directory
  '.husky/': {
    allowedExtensions: ['', '.sh'], // No extension or .sh
    validators: []
  }
};

// Root-level allowed files
const ROOT_ALLOWED_FILES = [
  '.gitignore',
  '.env',
  '.env.local',
  '.env.example',
  'package.json',
  'package-lock.json',
  'README.md',
  'next.config.js',
  'next.config.cjs',
  'vercel.json',
  'server.js',
  'server.cjs',
  'ride-with-vic-app-requirements.md',
  '.eslintrc.js',
  '.eslintrc.cjs',
  'eslint.config.js',
  'eslint.config.cjs',
  '.babelrc',
  '.babelrc.js',
  '.prettierrc',
  '.prettierignore',
  'tsconfig.json',
  'jsconfig.json',
  'jest.config.js',
  '.node-version',
  '.nvmrc',
  '.DS_Store',  // Mac system file
  'new-crontab.txt' // Temporary file for crontab updates
];

// Check if a file is in the correct directory
function isFileInCorrectDirectory(filePath) {
  // Normalize the path by removing leading ./ only if present, but preserve dotfiles
  const relativePath = filePath.replace(/^\.\//, '');
  
  // Skip checking node_modules
  if (relativePath.startsWith('node_modules/')) {
    return { valid: true };
  }
  
  // Skip checking .git
  if (relativePath.startsWith('.git/')) {
    return { valid: true };
  }
  
  // Special handling for .husky directory
  if (relativePath.startsWith('.husky/')) {
    return { valid: true };
  }
  
  // Check if it's at the root level
  if (!relativePath.includes('/')) {
    // Check if it's an allowed root file (exact match)
    if (ROOT_ALLOWED_FILES.includes(relativePath)) {
      return { valid: true };
    }
    
    // If it's not in the allowed list and not in a directory, it's invalid
    return {
      valid: false,
      reason: `File ${relativePath} is not allowed at the root level.`
    };
  }
  
  // Check against directory rules
  for (const [dirPrefix, rules] of Object.entries(DIRECTORY_RULES)) {
    if (relativePath.startsWith(dirPrefix)) {
      const extension = path.extname(relativePath).toLowerCase();
      const basename = path.basename(relativePath);
      
      // Check if this is an allowed file in the root of this directory
      if (rules.rootAllowedFiles && relativePath === dirPrefix + basename) {
        if (rules.rootAllowedFiles.includes(basename)) {
          return { valid: true };
        }
      }
      
      // Check extension
      if (!rules.allowedExtensions.includes(extension) && 
          !rules.allowedExtensions.includes('')) {
        return {
          valid: false,
          reason: `File ${relativePath} has an invalid extension for directory ${dirPrefix}. Allowed: ${rules.allowedExtensions.join(', ')}`
        };
      }
      
      // Check subdirectories if applicable
      if (rules.subdirectories) {
        const subPath = relativePath.substring(dirPrefix.length);
        const subDir = subPath.split('/')[0];
        
        if (subDir && !rules.subdirectories.includes(subDir) && 
            !rules.rootAllowedFiles?.includes(basename)) {
          return {
            valid: false,
            reason: `File ${relativePath} is in an invalid subdirectory. Allowed subdirectories for ${dirPrefix}: ${rules.subdirectories.join(', ')}`
          };
        }
      }
      
      // Run validators
      for (const validator of rules.validators) {
        const validationError = validator(relativePath);
        if (validationError) {
          return {
            valid: false,
            reason: validationError
          };
        }
      }
      
      return { valid: true };
    }
  }
  
  // If not in any valid directory
  return {
    valid: false,
    reason: `File ${relativePath} is not in a valid directory.`
  };
}

// Check for duplicate files (same name, different location)
function findDuplicateFiles() {
  const filesByBasename = {};
  
  // Get all files recursively
  function getAllFiles(directory) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules, .git, and .husky/_ directories
        if (entry.name !== 'node_modules' && entry.name !== '.git' && fullPath !== '.husky/_') {
          // Skip .husky/_ directory
          if (!(directory === '.husky' && entry.name === '_')) {
            getAllFiles(fullPath);
          }
        }
      } else {
        if (!filesByBasename[entry.name]) {
          filesByBasename[entry.name] = [];
        }
        
        filesByBasename[entry.name].push(fullPath);
      }
    }
  }
  
  getAllFiles('.');
  
  // Find duplicates
  const duplicates = [];
  for (const [basename, files] of Object.entries(filesByBasename)) {
    if (files.length > 1) {
      // Don't consider index.js files as duplicates (common in many directories)
      // Also don't consider .gitignore in .husky folder as a duplicate
      if (basename !== 'index.js' && basename !== 'index.ts' && 
          !(basename === '.gitignore' && files.some(f => f.includes('.husky/_'))) &&
          !(basename === 'pre-commit' && files.some(f => f.includes('.husky/_')))) {
        duplicates.push({
          name: basename,
          locations: files
        });
      }
    }
  }
  
  return duplicates;
}

/**
 * Get all files in the project
 * @returns {string[]} Array of file paths
 */
function getAllProjectFiles() {
  const allFiles = [];
  
  function traverse(directory) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules, .git, and .husky/_ directories
        if (entry.name !== 'node_modules' && entry.name !== '.git' && fullPath !== '.husky/_') {
          // Skip .husky/_ directory
          if (!(directory === '.husky' && entry.name === '_')) {
            traverse(fullPath);
          }
        }
      } else {
        allFiles.push(fullPath);
      }
    }
  }
  
  traverse('.');
  return allFiles;
}

/**
 * Generate a report of directory structure issues
 * @param {Array<string>} files - Array of file paths to check
 * @returns {Object} Report of issues
 */
function generateReport(files) {
  const report = {
    issueCount: 0,
    invalidFiles: [],
    duplicates: []
  };
  
  // Check each file
  for (const file of files) {
    const { valid, reason } = isFileInCorrectDirectory(file);
    
    if (!valid) {
      report.invalidFiles.push({
        path: file,
        reason
      });
      report.issueCount++;
    }
  }
  
  // Check for duplicates
  const duplicates = findDuplicateFiles();
  if (duplicates.length > 0) {
    report.duplicates = duplicates;
    report.issueCount += duplicates.length;
  }
  
  return report;
}

// Main function
function main() {
  try {
    let hasErrors = false;
    
    // If running in report mode, check all files
    if (REPORT_ONLY) {
      const allFiles = getAllProjectFiles();
      const report = generateReport(allFiles);
      
      console.log(`=== Directory Structure Check Report ===`);
      console.log(`Date: ${new Date().toLocaleString()}`);
      console.log(`Total files checked: ${allFiles.length}`);
      console.log(`Total issues found: ${report.issueCount}`);
      
      if (report.invalidFiles.length > 0) {
        console.log(`\n🔴 Invalid file locations: ${report.invalidFiles.length}`);
        for (const issue of report.invalidFiles) {
          console.log(`  - ${issue.path}: ${issue.reason}`);
        }
      }
      
      if (report.duplicates.length > 0) {
        console.log(`\n🔸 Duplicate files: ${report.duplicates.length}`);
        for (const dup of report.duplicates) {
          console.log(`  "${dup.name}" found in multiple locations:`);
          for (const location of dup.locations) {
            console.log(`    - ${location}`);
          }
        }
      }
      
      if (report.issueCount === 0) {
        console.log('\n✅ No directory structure issues found.');
      }
      
      return;
    }
    
    // If not in report mode, check staged files (for pre-commit)
    const stagedFiles = execSync('git diff --staged --name-only')
      .toString()
      .trim()
      .split('\n')
      .filter(file => file);
    
    for (const file of stagedFiles) {
      const { valid, reason } = isFileInCorrectDirectory(file);
      
      if (!valid) {
        console.error(`❌ ${reason}`);
        hasErrors = true;
      }
    }
    
    // Check for duplicates
    const duplicates = findDuplicateFiles();
    if (duplicates.length > 0) {
      console.error('\n⚠️ Duplicate files detected:');
      for (const dup of duplicates) {
        console.error(`  "${dup.name}" found in multiple locations:`);
        for (const location of dup.locations) {
          console.error(`    - ${location}`);
        }
      }
      hasErrors = true;
    }
    
    if (hasErrors) {
      console.error('\n🛑 Commit aborted. Please fix the directory structure issues.');
      process.exit(1);
    } else {
      console.log('✅ Directory structure check passed.');
    }
  } catch (error) {
    console.error('Error checking file structure:', error.message);
    process.exit(1);
  }
}

// Run when executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// Export functions
export {
  isFileInCorrectDirectory,
  findDuplicateFiles
}; 