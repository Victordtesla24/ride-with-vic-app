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
  // Fix component imports
  {
    regex: /from\s+['"](\.\.\/)+components\/(.+)['"]/g,
    replacement: 'from \'components/$2\''
  },
  {
    regex: /from\s+['"]\.\/components\/(.+)['"]/g,
    replacement: 'from \'components/$1\''
  },
  
  // Fix lib imports
  {
    regex: /from\s+['"](\.\.\/)+lib\/(.+)['"]/g,
    replacement: 'from \'lib/$2\''
  },
  {
    regex: /from\s+['"]\.\/lib\/(.+)['"]/g,
    replacement: 'from \'lib/$1\''
  },
  
  // Fix models imports
  {
    regex: /from\s+['"](\.\.\/)+models\/(.+)['"]/g,
    replacement: 'from \'models/$2\''
  },
  {
    regex: /from\s+['"]\.\/models\/(.+)['"]/g,
    replacement: 'from \'models/$1\''
  },
  
  // Fix API imports
  {
    regex: /from\s+['"](\.\.\/)+api\/(.+)['"]/g,
    replacement: 'from \'api/$2\''
  },
  {
    regex: /from\s+['"]\.\/api\/(.+)['"]/g,
    replacement: 'from \'api/$1\''
  },
  
  // Fix styles imports
  {
    regex: /from\s+['"](\.\.\/)+styles\/(.+)['"]/g,
    replacement: 'from \'styles/$2\''
  },
  {
    regex: /from\s+['"]\.\/styles\/(.+)['"]/g,
    replacement: 'from \'styles/$1\''
  },
  
  // Fix relative imports within the same directory (special case)
  {
    regex: /from\s+['"]\.\/(.+)['"]/g,
    test: (filePath) => {
      // Only replace if the file is in a subdirectory that matches our path alias structure
      const dirName = path.dirname(filePath);
      const relativeTo = path.relative(rootDir, dirName);
      const firstDir = relativeTo.split(path.sep)[0];
      
      return ['components', 'lib', 'models', 'api', 'styles'].includes(firstDir);
    },
    replacement: (match, group1, offset, string, groups, filePath) => {
      const dirName = path.dirname(filePath);
      const relativeTo = path.relative(rootDir, dirName);
      return `from '${relativeTo}/${group1}'`;
    }
  }
];

// Directories to process
const DIRECTORIES_TO_PROCESS = [
  'api',
  'components',
  'lib',
  'models',
  'pages',
  'styles'
];

// Get all JavaScript/JSX files
async function getJsFiles(dir) {
  const files = [];
  
  async function traverse(directory) {
    try {
      const entries = await fs.readdir(directory, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);
        
        if (entry.isDirectory()) {
          // Skip node_modules and .git directories
          if (entry.name !== 'node_modules' && entry.name !== '.git') {
            await traverse(fullPath);
          }
        } else if (entry.isFile() && 
                  (fullPath.endsWith('.js') || 
                   fullPath.endsWith('.jsx') ||
                   fullPath.endsWith('.ts') ||
                   fullPath.endsWith('.tsx'))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${directory}:`, error);
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
      if (pattern.test) {
        // For patterns with custom test function
        const matches = updatedContent.matchAll(pattern.regex);
        for (const match of Array.from(matches)) {
          if (pattern.test(filePath, match)) {
            const replacementText = typeof pattern.replacement === 'function' 
              ? pattern.replacement(match[0], match[1], match.index, updatedContent, match.groups, filePath)
              : match[0].replace(pattern.regex, pattern.replacement);
            
            if (replacementText !== match[0]) {
              updatedContent = updatedContent.slice(0, match.index) + 
                               replacementText + 
                               updatedContent.slice(match.index + match[0].length);
              changesMade = true;
            }
          }
        }
      } else {
        // For standard patterns
        const newContent = updatedContent.replace(pattern.regex, pattern.replacement);
        if (newContent !== updatedContent) {
          changesMade = true;
          updatedContent = newContent;
        }
      }
    }
    
    // Fix duplicate react imports
    const reactImportRegex = /import React.+from\s+['"]react['"];?\s*import\s+{\s*(.+)\s*}\s*from\s+['"]react['"];?/g;
    const fixedReactImport = updatedContent.replace(reactImportRegex, 'import React, { $1 } from "react";');
    
    if (fixedReactImport !== updatedContent) {
      changesMade = true;
      updatedContent = fixedReactImport;
    }
    
    // Fix missing React import for JSX files
    if ((filePath.endsWith('.jsx') || filePath.endsWith('.tsx')) && 
        !updatedContent.includes('import React') && 
        !updatedContent.includes('react-dom')) {
      const insertPosition = updatedContent.search(/import/);
      if (insertPosition >= 0) {
        updatedContent = updatedContent.slice(0, insertPosition) + 
                         'import React from "react";\n' + 
                         updatedContent.slice(insertPosition);
        changesMade = true;
      }
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
  let totalFilesChecked = 0;
  
  for (const directory of DIRECTORIES_TO_PROCESS) {
    const dirPath = path.join(rootDir, directory);
    
    console.log(`\nProcessing directory: ${directory}`);
    
    try {
      const files = await getJsFiles(dirPath);
      console.log(`Found ${files.length} JavaScript/TypeScript files.`);
      totalFilesChecked += files.length;
      
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
  
  console.log(`\n🚀 Done! Fixed imports in ${totalFilesFixed} out of ${totalFilesChecked} files.`);
}

// Run the script
main().catch(error => {
  console.error('Error executing script:', error);
  process.exit(1);
}); 