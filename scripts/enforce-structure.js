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

// Allowed files at root level
const allowedRootLevelFiles = [
  'package.json',
  'package-lock.json',
  'next.config.js',
  'next.config.cjs',
  'README.md',
  '.env.local',
  '.env',
  '.env.example',
  '.env.development',
  '.env.production',
  '.env.test',
  '.gitignore',
  '.eslintrc.cjs',
  '.eslintrc.js',
  '.babelrc',
  '.babelrc.js',
  'eslint.config.js',
  'eslint.config.cjs',
  'babel.config.js',
  'jest.config.js',
  'jsconfig.json',
  'vercel.json',
  'postcss.config.js',
  'tailwind.config.js',
  'Dockerfile',
  '.dockerignore',
  'LICENSE',
  'CHANGELOG.md',
  '.DS_Store' // Allow Mac OS system file
];

// Valid subdirectories for different parent directories
const validSubdirectories = {
  'components': ['layout', 'customer', 'trip', 'vehicle', 'receipt', 'profile', 'theme', 'map', 'ui', 'common', 'auth'],
  'lib': ['auth', 'utils', 'api', 'tesla', 'data', 'maps', 'services', 'hooks'],
  'lib/api': ['auth', 'vehicle', 'trip', 'test', 'customer', 'destinations', 'trips'],
  'models': [],
  'styles': [],
  'public': ['images', 'icons', 'fonts'],
  'pages': ['api', 'trips', 'auth', 'vehicle', 'profile'],
  'test': ['api', 'components', 'pages', 'lib', 'tesla', 'uber'],
  'scripts': [],
  '.github': ['workflows', 'ISSUE_TEMPLATE', 'actions', 'workflows']
};

// Define directory structure rules
const DIRECTORY_RULES = {
  // React components
  'components/': {
    allowedExtensions: ['.js', '.jsx', '.ts', '.tsx'],
    subdirectories: validSubdirectories['components'],
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
  // Server configuration
  'server/': {
    allowedExtensions: ['.js', '.cjs', '.mjs', '.ts'],
    validators: []
  },
  // Shared utilities
  'lib/': {
    allowedExtensions: ['.js', '.ts', '.json', '.pem'],
    subdirectories: validSubdirectories['lib'],
    allowDirectFiles: true, // Allow files directly in the lib directory
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
    subdirectories: validSubdirectories['pages'],
    allowDirectFiles: true, // Allow files directly in the pages directory
    validators: []
  },
  // Static assets
  'public/': {
    allowedExtensions: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.json', '.js'],
    subdirectories: validSubdirectories['public'],
    allowDirectFiles: true, // Allow files directly in the public directory
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
    allowedExtensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
    subdirectories: validSubdirectories['test'],
    allowDirectFiles: true, // Allow files directly in the test directory
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
  },
  // GitHub directory
  '.github/': {
    allowedExtensions: ['.yml', '.yaml', '.md', '.js', ''],
    subdirectories: validSubdirectories['.github'],
    validators: []
  },
  // Docs directory
  'docs/': {
    allowedExtensions: ['.md', '.txt', '.pdf', '.docx'],
    validators: []
  }
};

// Root-level allowed files
const ROOT_ALLOWED_FILES = allowedRootLevelFiles;

// Check if file should be in a subdirectory
const shouldBeInSubdirectory = (rules, filePath) => {
  // If the directory allows direct files, then we don't need to check further
  if (rules.allowDirectFiles) {
    return false;
  }

  // If no subdirectories specified, any file is fine at the root level
  if (!rules.subdirectories || rules.subdirectories.length === 0) {
    return false;
  }

  // Allow specific files at the root level if defined
  if (rules.rootAllowedFiles && rules.rootAllowedFiles.includes(path.basename(filePath))) {
    return false;
  }

  // For all other cases, files should be in a subdirectory
  return true;
};

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
  
  // Skip checking .next (Next.js build directory)
  if (relativePath.startsWith('.next/')) {
    return { valid: true };
  }
  
  // Skip checking .vercel (Vercel deployment files)
  if (relativePath.startsWith('.vercel/')) {
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
        
        // Check if the file should be in a subdirectory
        if (shouldBeInSubdirectory(rules, relativePath) && 
            (subDir === '' || !rules.subdirectories.includes(subDir))) {
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
function findDuplicateFiles(files) {
  const fileNames = {};
  const duplicates = [];
  
  // Skip checking these files for duplicates
  const skipFiles = [
    'index.js', 'index.jsx', 'index.ts', 'index.tsx',
    'lib/data/addresses.js',  // Skip data service file that might have API counterpart
    'test/deprecated/script-patch.js'  // Skip deprecated test files
  ];
  
  // If files not provided, get all files recursively
  if (!files) {
    const filesByBasename = {};
    
    function getAllFiles(directory) {
      const entries = fs.readdirSync(directory, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);
        
        if (entry.isDirectory()) {
          // Skip node_modules, .git, build directories (.next, .vercel), and internal husky directories
          if (entry.name !== 'node_modules' && 
              entry.name !== '.git' && 
              entry.name !== '.next' && 
              entry.name !== '.vercel' && 
              fullPath !== '.husky/_') {
            getAllFiles(fullPath);
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
    for (const [basename, locations] of Object.entries(filesByBasename)) {
      if (locations.length > 1) {
        // Skip files that should be allowed to be duplicated
        if (skipFiles.some(skipFile => {
          return locations.some(loc => loc.endsWith(skipFile));
        })) {
          continue;
        }
        
        // Report all other duplicates
        duplicates.push({
          name: basename,
          locations: locations
        });
      }
    }
  } else {
    // Using provided files list
    files.forEach(file => {
      // Skip index files and specific data service files
      if (skipFiles.some(skipFile => file.endsWith(skipFile))) {
        return;
      }
      
      const fileName = path.basename(file);
      
      if (fileNames[fileName]) {
        let found = false;
        // Check if this duplicate is already recorded
        for (const dup of duplicates) {
          if (dup.name === fileName) {
            if (!dup.locations.includes(file)) {
              dup.locations.push(file);
            }
            found = true;
            break;
          }
        }
        
        // Add new duplicate entry if not found
        if (!found) {
          duplicates.push({
            name: fileName,
            locations: [fileNames[fileName], file]
          });
        }
      } else {
        fileNames[fileName] = file;
      }
    });
  }
  
  return duplicates;
}

/**
 * Get all files in the project
 * @returns {string[]} Array of file paths
 */
function getAllProjectFiles() {
  const allFiles = [];
  
  // Traverse the directory tree recursively
  function traverse(directory) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules, .git, build directories (.next, .vercel), and internal husky directories
        if (entry.name !== 'node_modules' && 
            entry.name !== '.git' && 
            entry.name !== '.next' && 
            entry.name !== '.vercel' && 
            fullPath !== '.husky/_') {
          traverse(fullPath);
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
  const duplicates = findDuplicateFiles(files);
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
    const duplicates = findDuplicateFiles(stagedFiles);
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