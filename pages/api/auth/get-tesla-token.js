/**
 * Script to get a Tesla API access token using client credentials
 * 
 * Usage: Call this API endpoint to get an access token without user interaction
 * Returns: OAuth access token for use with Tesla API
 */

import teslaApi from '../../../lib/tesla-api.js';

export default async function handler(req, res) {
  // Set correct content type
  res.setHeader('Content-Type', 'application/json');

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Starting Tesla API token request');
    
    // Log environment variables (without exposing secrets)
    console.log('Using Tesla API base URL:', process.env.NEXT_PUBLIC_TESLA_API_BASE_URL);
    console.log('Using Tesla Auth URL:', process.env.NEXT_PUBLIC_TESLA_AUTH_URL);
    console.log('Using Client ID:', process.env.NEXT_PUBLIC_TESLA_CLIENT_ID);
    console.log('Client Secret exists:', !!process.env.TESLA_CLIENT_SECRET);
    console.log('Redirect URI:', process.env.NEXT_PUBLIC_TESLA_REDIRECT_URI);
    
    // Validate required environment variables
    if (!process.env.NEXT_PUBLIC_TESLA_CLIENT_ID || !process.env.TESLA_CLIENT_SECRET) {
      console.error('Missing required environment variables for Tesla authentication');
      return res.status(500).json({ 
        error: 'Configuration error', 
        details: 'Missing required environment variables for Tesla authentication'
      });
    }
    
    // Initialize the Tesla API client with credentials from environment
    teslaApi.init({
      clientId: process.env.NEXT_PUBLIC_TESLA_CLIENT_ID,
      clientSecret: process.env.TESLA_CLIENT_SECRET,
      redirectUri: process.env.NEXT_PUBLIC_TESLA_REDIRECT_URI,
      baseUrl: process.env.NEXT_PUBLIC_TESLA_API_BASE_URL,
      authUrl: process.env.NEXT_PUBLIC_TESLA_AUTH_URL,
      privateKey: process.env.TESLA_PRIVATE_KEY
    });
    
    console.log('Attempting to get Tesla API token via client credentials flow...');
    
    // Use the client credentials grant to get a token
    try {
      const tokenData = await teslaApi.getClientCredentialsToken();
      
      // Return the token data
      return res.status(200).json({
        success: true,
        access_token: tokenData.access_token,
        token_type: tokenData.token_type,
        expires_in: tokenData.expires_in,
        refresh_token: tokenData.refresh_token,
        id_token: tokenData.id_token
      });
    } catch (tokenError) {
      console.error('Error in client credentials flow:', tokenError);
      
      // If the client credentials flow fails, this could be because Tesla requires authorization_code flow
      // Return an appropriate error with guidance
      return res.status(400).json({
        error: 'oauth_flow_error',
        error_description: 'Client credentials flow failed. Tesla API may require authorization_code flow instead.',
        message: 'Authentication failed. Use the Tesla Connect button to authenticate with user credentials.',
        original_error: tokenError.message
      });
    }
  } catch (error) {
    console.error('Error getting Tesla token:', error);
    return res.status(500).json({ 
      error: error.message,
      details: 'Failed to authenticate with Tesla API'
    });
  }
} 