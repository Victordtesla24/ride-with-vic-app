/**
 * Tesla API Token Utilities
 * 
 * This module provides utility functions for getting a Tesla API access token
 * using client credentials. Used by the pages/api/auth endpoints.
 */

import fs from 'fs';
import path from 'path';
import teslaApi from 'lib/tesla-api.js';

// Main utility function for getting a Tesla API token
export async function getTeslaToken(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Load the private key
    const keyPath = process.env.TESLA_PRIVATE_KEY_PATH;
    let privateKey;
    
    try {
      const privateKeyFile = await fs.promises.readFile(path.resolve(process.cwd(), keyPath), 'utf8');
      privateKey = privateKeyFile.trim();
    } catch (error) {
      console.error('Error loading Tesla private key:', error);
      return res.status(500).json({ 
        error: 'Failed to load Tesla private key',
        details: error.message
      });
    }

    // Initialize the Tesla API client
    await teslaApi.init({
      clientId: process.env.NEXT_PUBLIC_TESLA_CLIENT_ID,
      clientSecret: process.env.TESLA_CLIENT_SECRET,
      redirectUri: process.env.NEXT_PUBLIC_TESLA_REDIRECT_URI,
      privateKey
    });

    // Define the authentication parameters
    const authParams = {
      grant_type: 'client_credentials',
      client_id: process.env.NEXT_PUBLIC_TESLA_CLIENT_ID,
      client_secret: process.env.TESLA_CLIENT_SECRET,
      scope: 'openid vehicle_device_data vehicle_cmds vehicle_charging_cmds'
    };

    // Make the token request to Tesla OAuth endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_TESLA_AUTH_URL}/oauth2/v3/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(authParams)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_description || 'Failed to get Tesla access token');
    }

    // Store the tokens in the Tesla API client
    teslaApi.setTokens({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      id_token: data.id_token,
      expires_in: data.expires_in
    });

    // Return the token data
    return res.status(200).json({
      success: true,
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
      refresh_token: data.refresh_token,
      id_token: data.id_token
    });
  } catch (error) {
    console.error('Error getting Tesla token:', error);
    return res.status(500).json({ 
      error: error.message,
      details: 'Failed to authenticate with Tesla API'
    });
  }
}

// Default export for backwards compatibility
export default getTeslaToken; 