#!/usr/bin/env node

/**
 * Import Path Fix Script
 * 
 * This script fixes import paths in the codebase to follow the standardized patterns.
 * It converts relative imports to proper absolute imports for components, lib, models, etc.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Import path patterns to fix
const PATH_PATTERNS = [
  {
    regex: /from\s+['"]\.\.\/components\/(.+)['"]/g,
    replacement: 'from \'components/$1\''
  },
  {
    regex: /from\s+['"]\.\.\/\.\.\/components\/(.+)['"]/g,
    replacement: 'from \'components/$1\''
  },
  {
    regex: /from\s+['"]\.\.\/lib\/(.+)['"]/g,
    replacement: 'from \'lib/$1\''
  },
  {
    regex: /from\s+['"]\.\.\/\.\.\/lib\/(.+)['"]/g,
    replacement: 'from \'lib/$1\''
  },
  {
    regex: /from\s+['"]\.\.\/models\/(.+)['"]/g,
    replacement: 'from \'models/$1\''
  },
  {
    regex: /from\s+['"]\.\.\/\.\.\/models\/(.+)['"]/g,
    replacement: 'from \'models/$1\''
  },
  {
    regex: /from\s+['"]\.\.\/api\/(.+)['"]/g,
    replacement: 'from \'api/$1\''
  },
  {
    regex: /from\s+['"]\.\.\/\.\.\/api\/(.+)['"]/g,
    replacement: 'from \'api/$1\''
  }
];

// Directories to process
const DIRECTORIES_TO_PROCESS = [
  'pages',
  'components'
];

// Get all JavaScript/JSX files
async function getJsFiles(dir) {
  const files = [];
  
  async function traverse(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      if (entry.isDirectory()) {
        await traverse(fullPath);
      } else if (entry.isFile() && 
                (fullPath.endsWith('.js') || 
                 fullPath.endsWith('.jsx') ||
                 fullPath.endsWith('.ts') ||
                 fullPath.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }
  }
  
  await traverse(dir);
  return files;
}

// Fix imports in a file
async function fixImportsInFile(filePath) {
  try {
    // Read file
    const content = await fs.readFile(filePath, 'utf8');
    
    // Apply all patterns
    let updatedContent = content;
    let changesMade = false;
    
    for (const pattern of PATH_PATTERNS) {
      const newContent = updatedContent.replace(pattern.regex, pattern.replacement);
      if (newContent !== updatedContent) {
        changesMade = true;
        updatedContent = newContent;
      }
    }
    
    // Fix duplicate react imports
    const reactImportRegex = /import React.+from\s+['"]react['"];?\s*import\s+{\s*(.+)\s*}\s*from\s+['"]react['"];?/g;
    const fixedReactImport = updatedContent.replace(reactImportRegex, 'import React, { $1 } from "react";');
    
    if (fixedReactImport !== updatedContent) {
      changesMade = true;
      updatedContent = fixedReactImport;
    }
    
    // Write back to file if changes were made
    if (changesMade) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Fixed imports in ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Main function
async function main() {
  console.log('🔍 Fixing import paths...');
  
  let totalFilesFixed = 0;
  
  for (const directory of DIRECTORIES_TO_PROCESS) {
    const dirPath = path.join(rootDir, directory);
    
    console.log(`\nProcessing directory: ${directory}`);
    
    try {
      const files = await getJsFiles(dirPath);
      console.log(`Found ${files.length} JavaScript/TypeScript files.`);
      
      // Process each file
      for (const file of files) {
        const wasFixed = await fixImportsInFile(file);
        if (wasFixed) {
          totalFilesFixed++;
        }
      }
    } catch (error) {
      console.error(`Error processing ${directory}:`, error);
    }
  }
  
  console.log(`\n🚀 Done! Fixed imports in ${totalFilesFixed} files.`);
}

// Run the script
main().catch(error => {
  console.error('Error executing script:', error);
  process.exit(1);
}); 