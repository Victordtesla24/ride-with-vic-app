#!/usr/bin/env node

/**
 * RIDE WITH VIC - File Creation CLI
 * 
 * This script helps create files in the correct directory structure,
 * enforcing naming conventions and preventing duplicates.
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { isFileInCorrectDirectory, findDuplicateFiles } from './enforce-structure.js';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check for help command
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Template content for different file types
const TEMPLATES = {
  component: (name) => `/**
 * ${name} Component
 */

class ${name} {
  constructor() {
    // Initialize component
  }
  
  // Add component methods here
}

export default ${name};`,
  
  api: (filename) => `/**
 * API endpoint: ${filename}
 */

export default async function handler(req, res) {
  try {
    // Implementation goes here
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}`,
  
  lib: (name) => `/**
 * ${name} Utility
 */

/**
 * Main function
 */
function ${toCamelCase(name)}() {
  // Implementation goes here
}

export default ${toCamelCase(name)};`,
  
  model: (name) => `/**
 * ${name} Model
 */

export const ${name}Schema = {
  id: String,
  // Add model properties here
};

/**
 * Create a new ${name}
 * @param {Object} data - The data to create the ${name} with
 * @returns {Object} - The created ${name}
 */
export function create${name}(data) {
  return {
    id: Date.now().toString(),
    ...data,
  };
}`,
  
  style: () => `/* 
 * Style definitions
 */

/* Variables */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --background-color: #f8f9fa;
  --text-color: #212529;
}

/* Global styles */
body {
  font-family: Arial, sans-serif;
  color: var(--text-color);
  background-color: var(--background-color);
  margin: 0;
  padding: 0;
}

/* Add more styles here */
`
};

/**
 * Helper to convert to camelCase
 * @param {string} str - The string to convert
 * @returns {string} - The camelCase string
 */
function toCamelCase(str) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, '');
}

/**
 * Helper to convert to PascalCase
 * @param {string} str - The string to convert
 * @returns {string} - The PascalCase string
 */
function toPascalCase(str) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
    .replace(/\s+/g, '');
}

/**
 * Shows help information for the CLI
 */
function showHelp() {
  console.log(`
=== RIDE WITH VIC - File Creation Tool ===

Usage:
  node scripts/cli-create.js [options]
  npm run create -- [options]

Options:
  -h, --help                  Show this help message
  --type <type>               File type to create (component, api, lib, model, style)
  --subtype <subtype>         Subtype for components and APIs
  --name <name>               Name of the file to create
  --force                     Overwrite existing files without prompting

Examples:
  # Create a component in interactive mode:
  node scripts/cli-create.js

  # Create a trip component without prompting:
  node scripts/cli-create.js --type component --subtype trip --name TripCard

  # Create a library utility:
  node scripts/cli-create.js --type lib --name formatDate

Subtypes:
  - Component: layout, customer, trip, vehicle, receipt
  - API: auth, vehicle, trip

File types:
  - component: Creates a component in the appropriate folder with PascalCase name
  - api: Creates an API endpoint in the appropriate API folder
  - lib: Creates a utility library file in the lib folder
  - model: Creates a data model in the models folder
  - style: Creates a CSS file in the styles folder
`);
}

// CLI interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Ask a question and get the answer
 * @param {string} question - The question to ask
 * @returns {Promise<string>} - The answer
 */
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Display file type menu and get selection
 * @returns {Promise<string>} - The selected file type
 */
async function selectFileType() {
  console.log('\nWhat type of file do you want to create?');
  console.log('1. Component');
  console.log('2. API Endpoint');
  console.log('3. Library Utility');
  console.log('4. Data Model');
  console.log('5. Style');
  
  const answer = await askQuestion('Enter number (1-5): ');
  
  switch (answer.trim()) {
    case '1': return 'component';
    case '2': return 'api';
    case '3': return 'lib';
    case '4': return 'model';
    case '5': return 'style';
    default: 
      console.log('Invalid choice. Please try again.');
      return selectFileType();
  }
}

/**
 * Get the path for a component
 * @param {string} subtype - The component subtype (optional)
 * @param {string} name - The component name (optional)
 * @returns {Promise<Object>} - The component path and name
 */
async function getComponentPath(subtype, name) {
  let directory;
  
  if (!subtype) {
    console.log('\nSelect component type:');
    console.log('1. Layout Component');
    console.log('2. Customer Component');
    console.log('3. Trip Component');
    console.log('4. Vehicle Component');
    console.log('5. Receipt Component');
    
    const answer = await askQuestion('Enter number (1-5): ');
    
    switch (answer.trim()) {
      case '1': directory = 'components/layout/'; break;
      case '2': directory = 'components/customer/'; break;
      case '3': directory = 'components/trip/'; break;
      case '4': directory = 'components/vehicle/'; break;
      case '5': directory = 'components/receipt/'; break;
      default: 
        console.log('Invalid choice. Please try again.');
        return getComponentPath();
    }
  } else {
    // Map subtype to directory
    switch (subtype.toLowerCase()) {
      case 'layout': directory = 'components/layout/'; break;
      case 'customer': directory = 'components/customer/'; break;
      case 'trip': directory = 'components/trip/'; break;
      case 'vehicle': directory = 'components/vehicle/'; break;
      case 'receipt': directory = 'components/receipt/'; break;
      default:
        console.error(`Invalid component subtype: ${subtype}`);
        process.exit(1);
    }
  }
  
  let componentName;
  if (!name) {
    const inputName = await askQuestion('Enter component name (PascalCase): ');
    componentName = toPascalCase(inputName);
  } else {
    componentName = toPascalCase(name);
  }
  
  return {
    path: `${directory}${componentName}.js`,
    name: componentName
  };
}

/**
 * Get the path for an API endpoint
 * @param {string} subtype - The API endpoint subtype (optional)
 * @param {string} name - The API endpoint name (optional)
 * @returns {Promise<Object>} - The API endpoint path and name
 */
async function getApiPath(subtype, name) {
  let directory;
  
  if (!subtype) {
    console.log('\nSelect API endpoint type:');
    console.log('1. Auth Endpoint');
    console.log('2. Vehicle Endpoint');
    console.log('3. Trip Endpoint');
    
    const answer = await askQuestion('Enter number (1-3): ');
    
    switch (answer.trim()) {
      case '1': directory = 'api/auth/'; break;
      case '2': directory = 'api/vehicle/'; break;
      case '3': directory = 'api/trip/'; break;
      default: 
        console.log('Invalid choice. Please try again.');
        return getApiPath();
    }
  } else {
    // Map subtype to directory
    switch (subtype.toLowerCase()) {
      case 'auth': directory = 'api/auth/'; break;
      case 'vehicle': directory = 'api/vehicle/'; break;
      case 'trip': directory = 'api/trip/'; break;
      default:
        console.error(`Invalid API subtype: ${subtype}`);
        process.exit(1);
    }
  }
  
  let filename;
  if (!name) {
    const inputName = await askQuestion('Enter endpoint filename: ');
    filename = inputName.endsWith('.js') ? inputName : `${inputName}.js`;
  } else {
    filename = name.endsWith('.js') ? name : `${name}.js`;
  }
  
  return {
    path: `${directory}${filename}`,
    name: filename
  };
}

/**
 * Get the path for a library utility
 * @param {string} name - The library utility name (optional)
 * @returns {Promise<Object>} - The library utility path and name
 */
async function getLibPath(name) {
  let filename;
  
  if (!name) {
    const inputName = await askQuestion('Enter library utility name: ');
    filename = inputName.endsWith('.js') ? inputName : `${inputName}.js`;
  } else {
    filename = name.endsWith('.js') ? name : `${name}.js`;
  }
  
  return {
    path: `lib/${filename}`,
    name: filename.replace('.js', '')
  };
}

/**
 * Get the path for a data model
 * @param {string} name - The data model name (optional)
 * @returns {Promise<Object>} - The data model path and name
 */
async function getModelPath(name) {
  let filename;
  
  if (!name) {
    const inputName = await askQuestion('Enter model name: ');
    filename = inputName.endsWith('.js') ? inputName : `${inputName}.js`;
  } else {
    filename = name.endsWith('.js') ? name : `${name}.js`;
  }
  
  return {
    path: `models/${filename}`,
    name: toPascalCase(filename.replace('.js', ''))
  };
}

/**
 * Get the path for a style file
 * @param {string} name - The style file name (optional)
 * @returns {Promise<Object>} - The style file path and name
 */
async function getStylePath(name) {
  let filename;
  
  if (!name) {
    const inputName = await askQuestion('Enter style filename: ');
    filename = inputName.endsWith('.css') ? inputName : `${inputName}.css`;
  } else {
    filename = name.endsWith('.css') ? name : `${name}.css`;
  }
  
  return {
    path: `styles/${filename}`,
    name: filename
  };
}

/**
 * Create a file with the given path and content
 * @param {string} filePath - The file path
 * @param {string} content - The file content
 * @param {boolean} force - Whether to overwrite existing files without prompting
 * @returns {Promise<boolean>} - Whether the file was created successfully
 */
async function createFile(filePath, content, force = false) {
  // Check if the file already exists
  if (fs.existsSync(filePath) && !force) {
    const overwrite = await askQuestion('File already exists. Overwrite? (y/N): ');
    if (overwrite.trim().toLowerCase() !== 'y') {
      return false;
    }
  }
  
  // Create directory if it doesn't exist
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write the file
  fs.writeFileSync(filePath, content);
  return true;
}

/**
 * Parse command line arguments
 * @returns {Object} - The parsed command line arguments
 */
function parseArgs() {
  const args = {};
  
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      
      if (i + 1 < process.argv.length && !process.argv[i + 1].startsWith('--')) {
        args[key] = process.argv[i + 1];
        i++;
      } else {
        args[key] = true;
      }
    } else if (arg.startsWith('-')) {
      const key = arg.slice(1);
      
      if (i + 1 < process.argv.length && !process.argv[i + 1].startsWith('-')) {
        args[key] = process.argv[i + 1];
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  
  return args;
}

/**
 * Main function
 */
async function main() {
  console.log('=== RIDE WITH VIC - File Creation Tool ===');
  
  try {
    // Parse command line arguments
    const args = parseArgs();
    const nonInteractive = args.type !== undefined;
    
    // Select file type
    const fileType = nonInteractive ? args.type : await selectFileType();
    
    if (!['component', 'api', 'lib', 'model', 'style'].includes(fileType)) {
      console.error(`Invalid file type: ${fileType}`);
      showHelp();
      process.exit(1);
    }
    
    // Get file path based on type
    let fileInfo;
    switch (fileType) {
      case 'component': 
        fileInfo = await getComponentPath(args.subtype, args.name); 
        break;
      case 'api': 
        fileInfo = await getApiPath(args.subtype, args.name); 
        break;
      case 'lib': 
        fileInfo = await getLibPath(args.name); 
        break;
      case 'model': 
        fileInfo = await getModelPath(args.name); 
        break;
      case 'style': 
        fileInfo = await getStylePath(args.name); 
        break;
    }
    
    // Validate the path
    const { valid, reason } = isFileInCorrectDirectory(fileInfo.path);
    if (!valid) {
      console.log(`\n❌ ${reason}`);
      return;
    }
    
    // Generate content
    const template = TEMPLATES[fileType];
    const content = template(fileInfo.name);
    
    // Create the file
    const created = await createFile(fileInfo.path, content, args.force);
    if (created) {
      console.log(`\n✅ File created: ${fileInfo.path}`);
    } else {
      console.log('\n❌ File creation canceled.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    rl.close();
  }
}

// Run when executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} 