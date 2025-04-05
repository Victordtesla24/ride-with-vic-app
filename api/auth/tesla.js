/**
 * Tesla OAuth Authentication API Endpoint
 * 
 * This endpoint initiates the OAuth flow for the Tesla API
 * by redirecting the user to the Tesla authorization page.
 */

import teslaApi from '../../lib/tesla-api.js';

export default function handler(req, res) {
  try {
    // Check if we're in a browser environment (serverless functions vs. client-side)
    const isBrowser = typeof window !== 'undefined';
    
    // Get the authorization URL
    const authUrl = teslaApi.getAuthorizationUrl();
    
    if (isBrowser) {
      // If we're in a browser, redirect directly
      window.location.href = authUrl;
      return { redirected: true };
    } else {
      // If we're in a serverless function, return a redirect response
      res.writeHead(302, { Location: authUrl });
      res.end();
      return { redirected: true };
    }
  } catch (error) {
    console.error('Error initiating Tesla OAuth flow:', error);
    
    // Handle the error based on environment
    if (typeof window !== 'undefined') {
      return { error: error.message };
    } else {
      res.status(500).json({ error: error.message });
    }
  }
}

// For client-side usage
export function initiateAuth() {
  try {
    const authUrl = teslaApi.getAuthorizationUrl();
    window.location.href = authUrl;
    return { redirected: true };
  } catch (error) {
    console.error('Error initiating Tesla OAuth flow:', error);
    return { error: error.message };
  }
} 