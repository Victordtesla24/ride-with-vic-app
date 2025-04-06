/**
 * Tesla OAuth callback handler
 * 
 * This endpoint receives the redirect from Tesla with the authorization code
 * and exchanges it for an access token.
 */

import teslaApi from '../../../lib/tesla-api.js';

export default async function handler(req, res) {
  // Get the authorization code from the query parameters
  const { code, state, error, error_description } = req.query;

  // Check for OAuth errors
  if (error) {
    console.error('Tesla OAuth error:', error, error_description);
    return res.redirect(`/dashboard?error=${encodeURIComponent(error_description || error)}`);
  }

  // Validate the authorization code
  if (!code) {
    console.error('Missing authorization code in Tesla callback');
    return res.redirect('/dashboard?error=Missing+authorization+code');
  }

  try {
    // Initialize the Tesla API client
    teslaApi.init({
      clientId: process.env.NEXT_PUBLIC_TESLA_CLIENT_ID,
      clientSecret: process.env.TESLA_CLIENT_SECRET,
      redirectUri: process.env.NEXT_PUBLIC_TESLA_REDIRECT_URI,
    });

    // Exchange the authorization code for tokens
    const tokens = await teslaApi.exchangeCodeForTokens(code);

    // Handle success case
    console.log('Successfully authenticated with Tesla');
    return res.redirect('/dashboard?teslaConnected=true');
  } catch (error) {
    console.error('Error exchanging Tesla code for tokens:', error);
    return res.redirect(`/dashboard?error=${encodeURIComponent(error.message || 'Failed to authenticate with Tesla')}`);
  }
} 