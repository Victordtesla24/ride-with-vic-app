#!/usr/bin/env node

/**
 * Duplicate File Detection Utility
 * 
 * This script scans the codebase for duplicate files, both by name and by content.
 * It helps ensure the codebase is free from duplicated code that could lead to
 * maintenance issues.
 */

import { readFileSync, readdirSync, statSync, createHash } from 'fs';
import { join, extname, relative } from 'path';
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
  'dist',
  'build',
  '.husky/_'
];

// File types to include in the scan
const FILE_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx', '.vue', '.css', '.scss', '.less',
  '.html', '.json', '.md', '.txt'
];

// Allowed index files (these can be duplicated by name)
const ALLOWED_INDEX_FILES = [
  'index.js', 'index.jsx', 'index.ts', 'index.tsx'
];

// Files that are allowed to be duplicated (by name)
const ALLOWED_DUPLICATE_NAMES = [
  'README.md',
  'LICENSE',
  '.gitignore',
  '.npmignore',
  'package.json',
  'tsconfig.json',
  'jest.config.js'
];

// Calculate a hash for a file to check for duplicate content
function hashFile(filePath) {
  try {
    const content = readFileSync(filePath);
    return createHash('sha256').update(content).digest('hex');
  } catch (error) {
    console.error(`Error hashing file ${filePath}:`, error.message);
    return null;
  }
}

// Function to scan for duplicate files
function scanForDuplicates() {
  const filesByName = {}; // For name-based duplicates
  const filesByHash = {}; // For content-based duplicates
  const allFiles = [];
  
  // Function to recursively scan directories
  function scanDirectory(dir) {
    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        const relativePath = relative(ROOT_DIR, fullPath);
        
        // Skip excluded directories
        if (entry.isDirectory()) {
          if (!EXCLUDED_DIRS.includes(entry.name) && !EXCLUDED_DIRS.some(excluded => relativePath.startsWith(excluded))) {
            scanDirectory(fullPath);
          }
          continue;
        }
        
        // Check if it's a file we want to scan
        const ext = extname(entry.name).toLowerCase();
        if (FILE_EXTENSIONS.includes(ext)) {
          // Skip allowed duplicates
          if (
            !ALLOWED_DUPLICATE_NAMES.includes(entry.name) && 
            !(ALLOWED_INDEX_FILES.includes(entry.name))
          ) {
            // Track by name
            if (!filesByName[entry.name]) {
              filesByName[entry.name] = [];
            }
            filesByName[entry.name].push(fullPath);
          }
          
          // Always track all files for hash comparison
          allFiles.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dir}:`, error.message);
    }
  }
  
  // Start the scan from the root directory
  scanDirectory(ROOT_DIR);
  
  // Find duplicates by name
  const nameDuplicates = Object.entries(filesByName)
    .filter(([name, paths]) => paths.length > 1)
    .map(([name, paths]) => ({ name, paths }));
  
  // Find duplicates by content
  console.log(chalk.white('Calculating file hashes to detect duplicate content...'));
  
  allFiles.forEach(file => {
    const hash = hashFile(file);
    if (hash) {
      if (!filesByHash[hash]) {
        filesByHash[hash] = [];
      }
      filesByHash[hash].push(file);
    }
  });
  
  const contentDuplicates = Object.entries(filesByHash)
    .filter(([hash, paths]) => paths.length > 1)
    .map(([hash, paths]) => ({ hash, paths }));
  
  return { nameDuplicates, contentDuplicates };
}

// Main function to run the scan
function runScan() {
  console.log(chalk.white.bold('\n=== Duplicate File Detection ==='));
  console.log(chalk.white(`Scanning directory: ${ROOT_DIR}`));
  console.log(chalk.white('Looking for potential duplicate files...\n'));
  
  const startTime = Date.now();
  const { nameDuplicates, contentDuplicates } = scanForDuplicates();
  const endTime = Date.now();
  
  console.log(chalk.white(`\nScan completed in ${((endTime - startTime) / 1000).toFixed(2)} seconds.`));
  
  // Report duplicates by name
  console.log(chalk.white.bold(`\nFound ${nameDuplicates.length} duplicate file names:`));
  
  if (nameDuplicates.length > 0) {
    nameDuplicates.forEach(duplicate => {
      console.log(chalk.yellow.bold(`\n  "${duplicate.name}" found in multiple locations:`));
      duplicate.paths.forEach(path => {
        console.log(`    - ${chalk.gray(relative(ROOT_DIR, path))}`);
      });
    });
  } else {
    console.log(chalk.green('  No duplicate file names found.'));
  }
  
  // Report duplicates by content
  console.log(chalk.white.bold(`\nFound ${contentDuplicates.length} duplicate file contents:`));
  
  if (contentDuplicates.length > 0) {
    contentDuplicates.forEach(duplicate => {
      console.log(chalk.red.bold(`\n  Files with identical content (hash: ${duplicate.hash.substring(0, 8)}...):`));
      duplicate.paths.forEach(path => {
        console.log(`    - ${chalk.gray(relative(ROOT_DIR, path))}`);
      });
    });
  } else {
    console.log(chalk.green('  No duplicate file contents found.'));
  }
  
  // Summary
  console.log(chalk.white.bold('\nSummary:'));
  console.log(`  Duplicate file names: ${nameDuplicates.length}`);
  console.log(`  Duplicate file contents: ${contentDuplicates.length}`);
  console.log(`  ${chalk.white.bold('Total issues:')} ${nameDuplicates.length + contentDuplicates.length}`);
  
  return nameDuplicates.length > 0 || contentDuplicates.length > 0;
}

// Run directly if this script is executed
if (import.meta.url === `file://${process.argv[1]}`) {
  const foundDuplicates = runScan();
  
  // Return non-zero exit code if duplicates were found
  if (foundDuplicates) {
    console.log(chalk.yellow('\nDuplicate files detected. Please review and refactor as needed.'));
    process.exit(1);
  } else {
    console.log(chalk.green('\nNo duplicate files found.'));
  }
}

export default runScan; 