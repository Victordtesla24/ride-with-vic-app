#!/usr/bin/env node

/**
 * Tesla API Test Script
 * 
 * This script tests the Tesla API integration by performing a series
 * of checks and validations against the Tesla Fleet API.
 */

import * as dotenv from 'dotenv';
import fetch from 'node-fetch';
import { createHash } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Tesla API endpoints
const TESLA_API_BASE_URL = process.env.NEXT_PUBLIC_TESLA_API_BASE_URL || 'https://owner-api.teslamotors.com';
const TESLA_AUTH_URL = process.env.NEXT_PUBLIC_TESLA_AUTH_URL || 'https://auth.tesla.com/oauth2/v3';
const TESLA_CLIENT_ID = process.env.NEXT_PUBLIC_TESLA_CLIENT_ID;
const TESLA_REDIRECT_URI = process.env.NEXT_PUBLIC_TESLA_REDIRECT_URI;
const TESLA_PRIVATE_KEY = process.env.TESLA_PRIVATE_KEY;

// Terminal colors for output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Helper function to print colored output
function print(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

// Log the start of the test
print('🚗 Tesla API Integration Test', 'blue');
print('===============================', 'blue');

// Test 1: Check environment variables
async function testEnvironmentVariables() {
  print('\n1. Testing Environment Variables:', 'cyan');
  let success = true;
  
  // Check Tesla Client ID
  if (!TESLA_CLIENT_ID) {
    print('  ❌ TESLA_CLIENT_ID is missing', 'red');
    success = false;
  } else {
    print(`  ✅ TESLA_CLIENT_ID is set: ${TESLA_CLIENT_ID.substring(0, 8)}...`, 'green');
  }
  
  // Check Tesla Redirect URI
  if (!TESLA_REDIRECT_URI) {
    print('  ❌ TESLA_REDIRECT_URI is missing', 'red');
    success = false;
  } else {
    print(`  ✅ TESLA_REDIRECT_URI is set: ${TESLA_REDIRECT_URI}`, 'green');
  }
  
  // Check Tesla API Base URL
  if (!TESLA_API_BASE_URL) {
    print('  ❌ TESLA_API_BASE_URL is missing', 'red');
    success = false;
  } else {
    print(`  ✅ TESLA_API_BASE_URL is set: ${TESLA_API_BASE_URL}`, 'green');
  }
  
  // Check Tesla Auth URL
  if (!TESLA_AUTH_URL) {
    print('  ❌ TESLA_AUTH_URL is missing', 'red');
    success = false;
  } else {
    print(`  ✅ TESLA_AUTH_URL is set: ${TESLA_AUTH_URL}`, 'green');
  }
  
  // Check Tesla Private Key
  if (!TESLA_PRIVATE_KEY) {
    print('  ❌ TESLA_PRIVATE_KEY is missing', 'red');
    success = false;
  } else {
    print(`  ✅ TESLA_PRIVATE_KEY is set (length: ${TESLA_PRIVATE_KEY.length})`, 'green');
  }
  
  return success;
}

// Test 2: Test Authorization URL generation
async function testAuthorizationUrl() {
  print('\n2. Testing Authorization URL Generation:', 'cyan');
  
  try {
    // Generate code verifier and challenge
    const codeVerifier = generateRandomString(128);
    const codeChallenge = generateCodeChallenge(codeVerifier);
    
    // Create authorization URL
    const authUrl = `${TESLA_AUTH_URL}/authorize?client_id=${TESLA_CLIENT_ID}&redirect_uri=${encodeURIComponent(TESLA_REDIRECT_URI)}&response_type=code&scope=openid%20offline_access%20vehicle_device_data&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    
    // Verify URL structure
    const url = new URL(authUrl);
    
    if (url.searchParams.get('client_id') !== TESLA_CLIENT_ID) {
      throw new Error('Invalid client_id in authorization URL');
    }
    
    if (decodeURIComponent(url.searchParams.get('redirect_uri')) !== TESLA_REDIRECT_URI) {
      throw new Error('Invalid redirect_uri in authorization URL');
    }
    
    print(`  ✅ Authorization URL generated successfully`, 'green');
    print(`  URL: ${authUrl}`, 'white');
    
    return true;
  } catch (error) {
    print(`  ❌ Failed to generate authorization URL: ${error.message}`, 'red');
    return false;
  }
}

// Test 3: Perform a CURL request to test API availability
async function testApiAvailability() {
  print('\n3. Testing Tesla API Availability:', 'cyan');
  
  try {
    // Test API availability with a simple request
    const response = await fetch(`${TESLA_API_BASE_URL}/api/1/vehicles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'RideWithVic/1.0'
      }
    });
    
    // We expect a 401 Unauthorized response since we're not authenticated
    // This confirms the API is available but requires authentication
    if (response.status === 401) {
      print('  ✅ Tesla API is available (expected 401 Unauthorized)', 'green');
      print(`  Response: ${await response.text()}`, 'white');
      return true;
    } else {
      print(`  ⚠️ Unexpected response status: ${response.status}`, 'yellow');
      print(`  Response: ${await response.text()}`, 'white');
      return false;
    }
  } catch (error) {
    print(`  ❌ Failed to connect to Tesla API: ${error.message}`, 'red');
    return false;
  }
}

// Helper function to generate a random string for OAuth
function generateRandomString(length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  
  return text;
}

// Helper function to generate code challenge from verifier
function generateCodeChallenge(codeVerifier) {
  const hash = createHash('sha256')
    .update(codeVerifier)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  
  return hash;
}

// Run all tests
async function runTests() {
  const results = [
    await testEnvironmentVariables(),
    await testAuthorizationUrl(),
    await testApiAvailability()
  ];
  
  // Print summary
  print('\n🚗 Tesla API Test Summary:', 'blue');
  print('========================', 'blue');
  
  const passedTests = results.filter(r => r).length;
  const totalTests = results.length;
  
  print(`Passed: ${passedTests}/${totalTests} tests`, passedTests === totalTests ? 'green' : 'red');
  
  if (passedTests === totalTests) {
    print('✅ All tests passed!', 'green');
    return 0; // success exit code
  } else {
    print('❌ Some tests failed.', 'red');
    return 1; // error exit code
  }
}

// Execute tests
runTests()
  .then(exitCode => {
    process.exit(exitCode);
  })
  .catch(error => {
    print(`\n❌ Unhandled error during tests: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }); 