/**
 * Main Test Runner
 * 
 * This file serves as the entry point for the test suite,
 * executing all test files organized by module.
 * 
 * Run using: npm test
 */

import { spawn } from 'child_process';
import { readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the test directory
const TEST_DIR = __dirname;

// Define directories to test
const testDirs = [
  join(TEST_DIR, 'lib'),
  join(TEST_DIR, 'components'),
  join(TEST_DIR, 'pages'),
  join(TEST_DIR, 'api'),
  join(TEST_DIR, 'models')
];

// Function to find all test files recursively
function findTestFiles(dir) {
  const files = [];
  
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        files.push(...findTestFiles(fullPath));
      } else if (
        entry.name.endsWith('.test.js') || 
        entry.name.endsWith('.spec.js') || 
        (entry.name.includes('test') && !entry.name.includes('util') && !entry.name.includes('helper'))
      ) {
        // Only include proper test files (skip utility files)
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory may not exist yet, that's okay
    console.log(`Note: Directory ${dir} does not exist or cannot be read.`);
  }
  
  return files;
}

// Main function to run tests
async function runTests() {
  console.log('=== RIDE WITH VIC Test Suite ===');
  console.log('Running all tests...\n');
  
  let allTestFiles = [];
  
  // Collect all test files from specified directories
  for (const dir of testDirs) {
    try {
      if (statSync(dir).isDirectory()) {
        const testFiles = findTestFiles(dir);
        allTestFiles = [...allTestFiles, ...testFiles];
      }
    } catch (error) {
      // Directory might not exist, that's fine
    }
  }
  
  if (allTestFiles.length === 0) {
    console.log('No test files found.');
    return;
  }
  
  console.log(`Found ${allTestFiles.length} test files to run.\n`);
  
  // Use Jest to run the tests
  const jestProcess = spawn('npx', ['jest', '--verbose', '--runInBand'], { 
    stdio: 'inherit',
    shell: true
  });
  
  return new Promise((resolve, reject) => {
    jestProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ All tests completed successfully!');
        resolve();
      } else {
        console.error(`\n❌ Tests failed with exit code ${code}`);
        reject(new Error(`Tests failed with exit code ${code}`));
      }
    });
    
    jestProcess.on('error', (error) => {
      console.error('Failed to run tests:', error);
      reject(error);
    });
  });
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch((error) => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

export default runTests; 