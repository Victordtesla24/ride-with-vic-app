import teslaApi from 'lib/tesla-api.js';

/**
 * API route to test Tesla client credentials token flow
 */
export default async function handler(req, res) {
  try {
    // Initialize the Tesla API client with credentials from environment
    teslaApi.init({
      clientId: process.env.NEXT_PUBLIC_TESLA_CLIENT_ID,
      clientSecret: process.env.TESLA_CLIENT_SECRET,
      redirectUri: process.env.NEXT_PUBLIC_TESLA_REDIRECT_URI,
      baseUrl: process.env.NEXT_PUBLIC_TESLA_API_BASE_URL,
      authUrl: process.env.NEXT_PUBLIC_TESLA_AUTH_URL
    });
    
    console.log('Attempting to get client credentials token...');
    console.log('Client ID:', process.env.NEXT_PUBLIC_TESLA_CLIENT_ID);
    console.log('Auth URL:', process.env.NEXT_PUBLIC_TESLA_AUTH_URL);
    console.log('Client Secret exists:', !!process.env.TESLA_CLIENT_SECRET);
    
    // Get client credentials token
    const tokenResponse = await teslaApi.getClientCredentialsToken();
    
    // Mask sensitive data
    const maskedResponse = {
      success: true,
      message: 'Successfully obtained client credentials token',
      token_type: tokenResponse.token_type,
      expires_in: tokenResponse.expires_in,
      has_access_token: !!tokenResponse.access_token,
      access_token_preview: tokenResponse.access_token ? 
        `${tokenResponse.access_token.substring(0, 10)}...` : null,
      has_refresh_token: !!tokenResponse.refresh_token
    };
    
    // Return success response with masked token data
    return res.status(200).json(maskedResponse);
  } catch (error) {
    // Log the full error for debugging
    console.error('Error getting Tesla client credentials token:', error);
    
    // Return error response
    return res.status(500).json({
      success: false,
      message: 'Failed to get client credentials token',
      error: error.message
    });
  }
} 