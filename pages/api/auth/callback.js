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
    // Initialize the Tesla API client with all required parameters
    teslaApi.init({
      clientId: process.env.NEXT_PUBLIC_TESLA_CLIENT_ID,
      clientSecret: process.env.TESLA_CLIENT_SECRET,
      redirectUri: process.env.NEXT_PUBLIC_TESLA_REDIRECT_URI,
      baseUrl: process.env.NEXT_PUBLIC_TESLA_API_BASE_URL,
      authUrl: process.env.NEXT_PUBLIC_TESLA_AUTH_URL
    });

    // Exchange the authorization code for tokens using the updated method
    const tokens = await teslaApi.exchangeCodeForTokens(code);

    // Log token information for debugging, but never expose sensitive info
    console.log('Successfully authenticated with Tesla, received tokens');

    // Try to get basic vehicle information to confirm API access
    try {
      const vehicleData = await teslaApi.getVehicles();
      console.log(`Successfully fetched vehicle data, found ${vehicleData?.response?.length || 0} vehicles`);
    } catch (vehicleError) {
      console.warn('Authenticated with Tesla but could not fetch vehicles:', vehicleError.message);
      // Continue anyway, as we're already authenticated
    }

    // Handle success case
    return res.redirect('/dashboard?teslaConnected=true');
  } catch (error) {
    console.error('Error exchanging Tesla code for tokens:', error);
    return res.redirect(`/dashboard?error=${encodeURIComponent(error.message || 'Failed to authenticate with Tesla')}`);
  }
} 