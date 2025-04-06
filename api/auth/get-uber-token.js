/**
 * Script to get an Uber API access token using client credentials
 * 
 * Usage: Call this API endpoint to get an access token without user interaction
 * Returns: OAuth access token for use with Uber API
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

// For ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Load asymmetric key data
    const keyPath = process.env.UBER_ASYMMETRIC_KEY_PATH;
    const keyData = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), keyPath), 'utf8'));
    
    // Method 1: Client Credentials flow
    if (req.body.method === 'client_credentials' || !req.body.method) {
      // Create authentication parameters
      const params = new URLSearchParams({
        client_id: process.env.UBER_CLIENT_ID,
        client_secret: process.env.UBER_CLIENT_SECRET,
        grant_type: 'client_credentials',
        scope: 'estimatePrice' // Add more scopes as needed, separated by spaces
      });

      // Make the token request
      const response = await fetch('https://sandbox-login.uber.com/oauth/v2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error_description || 'Failed to get Uber access token');
      }
      
      // Return the token data
      return res.status(200).json({
        success: true,
        method: 'client_credentials',
        access_token: data.access_token,
        token_type: data.token_type,
        expires_in: data.expires_in
      });
    }
    // Method 2: Asymmetric Key Authentication
    else if (req.body.method === 'asymmetric_key') {
      // Load the private key from the key file
      const privateKey = keyData.private_key;
      
      // Create JWT payload
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        iss: keyData.key_id,
        sub: keyData.application_id,
        exp: now + 3600, // Token expires in 1 hour
        iat: now,
        scope: 'estimatePrice' // Add more scopes as needed, separated by spaces
      };
      
      // Create JWT header
      const header = {
        alg: 'RS256',
        typ: 'JWT'
      };
      
      // Encode header and payload
      const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
        
      const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      
      // Create signature
      const signatureInput = `${encodedHeader}.${encodedPayload}`;
      const signer = crypto.createSign('RSA-SHA256');
      signer.update(signatureInput);
      const signature = signer.sign(privateKey, 'base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      
      // Create JWT token
      const jwt = `${encodedHeader}.${encodedPayload}.${signature}`;
      
      // Create authentication parameters
      const params = new URLSearchParams({
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: jwt,
        grant_type: 'client_credentials',
        scope: 'estimatePrice' // Add more scopes as needed, separated by spaces
      });

      // Make the token request
      const response = await fetch('https://sandbox-login.uber.com/oauth/v2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error_description || 'Failed to get Uber access token');
      }
      
      // Return the token data
      return res.status(200).json({
        success: true,
        method: 'asymmetric_key',
        access_token: data.access_token,
        token_type: data.token_type,
        expires_in: data.expires_in
      });
    }
    else {
      throw new Error('Invalid authentication method');
    }
  } catch (error) {
    console.error('Error getting Uber token:', error);
    return res.status(500).json({ 
      error: error.message,
      details: 'Failed to authenticate with Uber API'
    });
  }
} 