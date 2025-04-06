#!/usr/bin/env node

/**
 * Test script for Uber API token endpoint
 * 
 * This script calls the Uber token API to verify authentication is working
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
  'UBER_CLIENT_ID',
  'UBER_CLIENT_SECRET',
  'UBER_ASYMMETRIC_KEY_PATH'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(`Error: Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

console.log('Environment variables loaded successfully');
console.log(`UBER_CLIENT_ID: ${process.env.UBER_CLIENT_ID.substring(0, 6)}...`);
console.log(`UBER_ASYMMETRIC_KEY_PATH: ${process.env.UBER_ASYMMETRIC_KEY_PATH}`);

// Function to test the token endpoint
async function testUberToken() {
  console.log('\n=== Testing Uber Token API ===\n');
  
  try {
    // Test method 1: Client Credentials
    console.log('Testing client credentials method...');
    const clientCredentialsResponse = await fetch('http://localhost:3000/api/auth/get-uber-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        method: 'client_credentials'
      })
    });
    
    const clientCredentialsData = await clientCredentialsResponse.json();
    
    if (clientCredentialsResponse.ok) {
      console.log('✅ Client credentials method successful!');
      console.log(`Token: ${clientCredentialsData.access_token.substring(0, 10)}...`);
      console.log(`Expires in: ${clientCredentialsData.expires_in} seconds`);
    } else {
      console.error('❌ Client credentials method failed:', clientCredentialsData.error);
    }
    
    // Test method 2: Asymmetric Key
    console.log('\nTesting asymmetric key method...');
    const asymmetricKeyResponse = await fetch('http://localhost:3000/api/auth/get-uber-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        method: 'asymmetric_key'
      })
    });
    
    const asymmetricKeyData = await asymmetricKeyResponse.json();
    
    if (asymmetricKeyResponse.ok) {
      console.log('✅ Asymmetric key method successful!');
      console.log(`Token: ${asymmetricKeyData.access_token.substring(0, 10)}...`);
      console.log(`Expires in: ${asymmetricKeyData.expires_in} seconds`);
    } else {
      console.error('❌ Asymmetric key method failed:', asymmetricKeyData.error);
    }
    
  } catch (error) {
    console.error('Error testing Uber token endpoint:', error);
  }
}

// Make sure local server is running before testing
console.log('Make sure your local server is running on http://localhost:3000');
console.log('Starting tests in 3 seconds...');

setTimeout(testUberToken, 3000); 