#!/usr/bin/env node

/**
 * Test script for Tesla API token endpoint
 * 
 * This script calls the Tesla token API to verify authentication is working
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Check for required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_TESLA_CLIENT_ID',
  'TESLA_CLIENT_SECRET',
  'NEXT_PUBLIC_TESLA_REDIRECT_URI',
  'NEXT_PUBLIC_TESLA_AUTH_URL',
  'NEXT_PUBLIC_TESLA_API_BASE_URL',
  'TESLA_PRIVATE_KEY_PATH'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(`Error: Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

console.log('Environment variables loaded successfully');
console.log(`NEXT_PUBLIC_TESLA_CLIENT_ID: ${process.env.NEXT_PUBLIC_TESLA_CLIENT_ID.substring(0, 6)}...`);
console.log(`TESLA_PRIVATE_KEY_PATH: ${process.env.TESLA_PRIVATE_KEY_PATH}`);
console.log(`NEXT_PUBLIC_TESLA_AUTH_URL: ${process.env.NEXT_PUBLIC_TESLA_AUTH_URL}`);

// Function to test the token endpoint
async function testTeslaToken() {
  console.log('\n=== Testing Tesla Token API ===\n');
  
  try {
    console.log('Testing client credentials flow...');
    const response = await fetch('http://localhost:3000/api/auth/get-tesla-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Client credentials flow successful!');
      console.log(`Access Token: ${data.access_token.substring(0, 10)}...`);
      console.log(`ID Token: ${data.id_token ? data.id_token.substring(0, 10) + '...' : 'N/A'}`);
      console.log(`Refresh Token: ${data.refresh_token ? data.refresh_token.substring(0, 10) + '...' : 'N/A'}`);
      console.log(`Expires in: ${data.expires_in} seconds`);
    } else {
      console.error('❌ Client credentials flow failed:');
      console.error(`Error: ${data.error}`);
      console.error(`Details: ${data.details || 'No details provided'}`);
    }
  } catch (error) {
    console.error('Error testing Tesla token endpoint:', error);
  }
}

// Make sure local server is running before testing
console.log('Make sure your local server is running on http://localhost:3000');
console.log('Starting tests in 3 seconds...');

setTimeout(testTeslaToken, 3000); 