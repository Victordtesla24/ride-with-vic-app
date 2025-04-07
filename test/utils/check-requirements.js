#!/usr/bin/env node

/**
 * Requirements Validation Utility
 * 
 * This script checks if the codebase adheres to the requirements specified
 * in the ride-with-vic-app-requirements.md document.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative, resolve, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import chalk from 'chalk';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..', '..');

// Path to the requirements document
const REQUIREMENTS_PATH = join(ROOT_DIR, 'docs', 'ride-with-vic-app-requirements.md');

// Function to read requirements
function readRequirements() {
  try {
    if (!existsSync(REQUIREMENTS_PATH)) {
      console.error(chalk.red(`Requirements file not found at ${REQUIREMENTS_PATH}`));
      return null;
    }
    
    const content = readFileSync(REQUIREMENTS_PATH, 'utf8');
    return content;
  } catch (error) {
    console.error(chalk.red(`Error reading requirements file: ${error.message}`));
    return null;
  }
}

// Function to extract directory structure from requirements
function extractDirectoryStructure(requirementsText) {
  try {
    // Find the project structure section
    const structureMatch = requirementsText.match(/```\s*\n(RIDE-WITH-VIC-APP[\s\S]+?)```/);
    
    if (!structureMatch || !structureMatch[1]) {
      console.error(chalk.red('Could not extract directory structure from requirements'));
      return null;
    }
    
    const structureText = structureMatch[1];
    const dirs = new Set();
    const requiredFiles = new Set();
    
    // Parse the directory structure
    const lines = structureText.split('\n');
    let currentPath = '';
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      // Skip the root entry
      if (line.startsWith('RIDE-WITH-VIC-APP')) continue;
      
      // Calculate indentation level (assuming 4 spaces or 1 tab per level)
      const indentMatch = line.match(/^(\s+)/);
      const indentLevel = indentMatch ? indentMatch[1].length / 4 : 0;
      
      // Reset path based on indentation
      const pathParts = currentPath.split('/').filter(Boolean);
      while (pathParts.length > indentLevel) {
        pathParts.pop();
      }
      currentPath = pathParts.join('/');
      
      // Extract the item name
      const itemMatch = line.match(/├── (.+)/);
      if (!itemMatch) continue;
      
      const itemName = itemMatch[1].trim();
      
      // Check if it's a directory or file
      if (itemName.endsWith('/')) {
        // It's a directory
        const dirName = itemName.slice(0, -1);
        const dirPath = currentPath ? `${currentPath}/${dirName}` : dirName;
        dirs.add(dirPath);
        currentPath = dirPath;
      } else {
        // It's a file
        const filePath = currentPath ? `${currentPath}/${itemName}` : itemName;
        requiredFiles.add(filePath);
      }
    }
    
    return { dirs: [...dirs], requiredFiles: [...requiredFiles] };
  } catch (error) {
    console.error(chalk.red(`Error extracting directory structure: ${error.message}`));
    return null;
  }
}

// Function to extract API endpoints from requirements
function extractApiEndpoints(requirementsText) {
  try {
    const apiEndpoints = [];
    
    // Match patterns like "/api/auth/tesla.js" or similar endpoints
    const endpointMatches = requirementsText.match(/\/api\/[a-zA-Z0-9\/\-_.]+/g);
    
    if (endpointMatches) {
      endpointMatches.forEach(endpoint => {
        // Clean up and normalize the endpoint
        const cleanEndpoint = endpoint.trim();
        if (!apiEndpoints.includes(cleanEndpoint)) {
          apiEndpoints.push(cleanEndpoint);
        }
      });
    }
    
    return apiEndpoints;
  } catch (error) {
    console.error(chalk.red(`Error extracting API endpoints: ${error.message}`));
    return [];
  }
}

// Function to check if required directories exist
function checkDirectories(requiredDirs) {
  const issues = [];
  
  for (const dir of requiredDirs) {
    const dirPath = join(ROOT_DIR, dir);
    if (!existsSync(dirPath) || !statSync(dirPath).isDirectory()) {
      issues.push({
        type: 'missing-directory',
        path: dir,
        severity: 'high'
      });
    }
  }
  
  return issues;
}

// Function to check if required files exist
function checkFiles(requiredFiles) {
  const issues = [];
  
  for (const file of requiredFiles) {
    const filePath = join(ROOT_DIR, file);
    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      issues.push({
        type: 'missing-file',
        path: file,
        severity: 'medium'
      });
    }
  }
  
  return issues;
}

// Function to check API endpoints
function checkApiEndpoints(endpoints) {
  const issues = [];
  const pagesApiDir = join(ROOT_DIR, 'pages', 'api');
  const apiDir = join(ROOT_DIR, 'api');
  const libApiDir = join(ROOT_DIR, 'lib', 'api');
  
  for (const endpoint of endpoints) {
    // Remove leading slash and convert to path components
    const components = endpoint.replace(/^\//, '').split('/');
    const apiPathPagesApi = join(pagesApiDir, ...components);
    const apiPathRootApi = join(apiDir, ...components);
    const apiPathLibApi = join(libApiDir, ...components);
    
    // Check various file extensions
    const extensions = ['.js', '.ts', '.jsx', '.tsx'];
    let found = false;
    
    for (const ext of extensions) {
      if (
        existsSync(`${apiPathPagesApi}${ext}`) || 
        existsSync(`${apiPathRootApi}${ext}`) || 
        existsSync(`${apiPathLibApi}${ext}`)
      ) {
        found = true;
        break;
      }
    }
    
    if (!found) {
      issues.push({
        type: 'missing-endpoint',
        path: endpoint,
        severity: 'high'
      });
    }
  }
  
  return issues;
}

// Function to check for Tesla API client
function checkTeslaApiClient() {
  const issues = [];
  const teslaApiPath = join(ROOT_DIR, 'lib', 'tesla-api.js');
  
  if (!existsSync(teslaApiPath)) {
    issues.push({
      type: 'missing-tesla-api',
      path: 'lib/tesla-api.js',
      severity: 'critical'
    });
  } else {
    // Check for Tesla API functionality
    try {
      const content = readFileSync(teslaApiPath, 'utf8');
      if (!content.includes('getVehicles') || !content.includes('vehicleTelemetry')) {
        issues.push({
          type: 'incomplete-tesla-api',
          path: 'lib/tesla-api.js',
          severity: 'high'
        });
      }
    } catch (error) {
      issues.push({
        type: 'error-reading-tesla-api',
        path: 'lib/tesla-api.js',
        severity: 'medium'
      });
    }
  }
  
  return issues;
}

// Function to check for trip tracking implementation
function checkTripTracking() {
  const issues = [];
  
  // Required trip tracking files
  const requiredFiles = [
    join(ROOT_DIR, 'lib', 'api', 'trips', 'list-trips.js'),
    join(ROOT_DIR, 'lib', 'api', 'trips', 'trip-telemetry.js'),
    join(ROOT_DIR, 'components', 'trip')
  ];
  
  for (const file of requiredFiles) {
    if (!existsSync(file)) {
      issues.push({
        type: 'missing-trip-tracking',
        path: relative(ROOT_DIR, file),
        severity: 'high'
      });
    }
  }
  
  return issues;
}

// Function to check for vehicle telemetry implementation
function checkVehicleTelemetry() {
  const issues = [];
  
  // Required vehicle telemetry files
  const telemetryPath = join(ROOT_DIR, 'lib', 'api', 'vehicle', 'vehicle-telemetry.js');
  
  if (!existsSync(telemetryPath)) {
    issues.push({
      type: 'missing-vehicle-telemetry',
      path: 'lib/api/vehicle/vehicle-telemetry.js',
      severity: 'critical'
    });
  } else {
    // Check for required telemetry functions
    try {
      const content = readFileSync(telemetryPath, 'utf8');
      const requiredFunctions = [
        'extractLocationData',
        'extractVehicleSpeed',
        'extractBatteryData',
        'extractClimateData'
      ];
      
      for (const fn of requiredFunctions) {
        if (!content.includes(fn)) {
          issues.push({
            type: 'missing-telemetry-function',
            path: `lib/api/vehicle/vehicle-telemetry.js#${fn}`,
            severity: 'high'
          });
        }
      }
    } catch (error) {
      issues.push({
        type: 'error-reading-telemetry',
        path: 'lib/api/vehicle/vehicle-telemetry.js',
        severity: 'medium'
      });
    }
  }
  
  return issues;
}

// Main function to run the validation
function runValidation() {
  console.log(chalk.white.bold('\n=== Requirements Validation ==='));
  console.log(chalk.white(`Reading requirements from: ${REQUIREMENTS_PATH}`));
  
  const requirementsText = readRequirements();
  if (!requirementsText) {
    return { valid: false, issues: [] };
  }
  
  console.log(chalk.white('Extracting structure and requirements...'));
  
  const directoryStructure = extractDirectoryStructure(requirementsText);
  if (!directoryStructure) {
    return { valid: false, issues: [] };
  }
  
  const apiEndpoints = extractApiEndpoints(requirementsText);
  
  console.log(chalk.white('Validating project against requirements...'));
  
  let issues = [];
  
  // Check directories
  issues = [...issues, ...checkDirectories(directoryStructure.dirs)];
  
  // Check files
  issues = [...issues, ...checkFiles(directoryStructure.requiredFiles)];
  
  // Check API endpoints
  issues = [...issues, ...checkApiEndpoints(apiEndpoints)];
  
  // Check Tesla API client
  issues = [...issues, ...checkTeslaApiClient()];
  
  // Check trip tracking
  issues = [...issues, ...checkTripTracking()];
  
  // Check vehicle telemetry
  issues = [...issues, ...checkVehicleTelemetry()];
  
  const valid = issues.length === 0;
  
  return { valid, issues };
}

// Function to print validation results
function printValidationResults(results) {
  if (results.valid) {
    console.log(chalk.green.bold('\n✓ Project meets all specified requirements'));
    return;
  }
  
  console.log(chalk.red.bold(`\n✗ Found ${results.issues.length} issues with project requirements:`));
  
  // Group issues by type
  const issuesByType = {};
  results.issues.forEach(issue => {
    if (!issuesByType[issue.type]) {
      issuesByType[issue.type] = [];
    }
    issuesByType[issue.type].push(issue);
  });
  
  // Print issues by type
  Object.entries(issuesByType).forEach(([type, issues]) => {
    console.log(chalk.yellow.bold(`\n${formatIssueType(type)} (${issues.length}):`));
    
    issues.forEach(issue => {
      const severity = formatSeverity(issue.severity);
      console.log(`  [${severity}] ${issue.path}`);
    });
  });
  
  // Summary by severity
  const criticalCount = results.issues.filter(i => i.severity === 'critical').length;
  const highCount = results.issues.filter(i => i.severity === 'high').length;
  const mediumCount = results.issues.filter(i => i.severity === 'medium').length;
  const lowCount = results.issues.filter(i => i.severity === 'low').length;
  
  console.log(chalk.white.bold('\nSummary by Severity:'));
  console.log(`  ${formatSeverity('critical')} issues: ${criticalCount}`);
  console.log(`  ${formatSeverity('high')} issues: ${highCount}`);
  console.log(`  ${formatSeverity('medium')} issues: ${mediumCount}`);
  console.log(`  ${formatSeverity('low')} issues: ${lowCount}`);
}

// Helper function to format issue type
function formatIssueType(type) {
  return type
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper function to format severity
function formatSeverity(severity) {
  switch (severity) {
    case 'critical':
      return chalk.bgRed.white.bold(' CRITICAL ');
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

// Run validation if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const results = runValidation();
  printValidationResults(results);
  
  // Return non-zero exit code for critical or high severity issues
  if (
    results.issues.some(issue => 
      issue.severity === 'critical' || issue.severity === 'high'
    )
  ) {
    process.exit(1);
  }
}

export default { runValidation, printValidationResults }; 