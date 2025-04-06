/**
 * Next.js configuration file
 */

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  // Enable static exports - removing this setting as it can cause routing issues
  // output: 'export',
  
  // Base path for the app (if deploying to a subdirectory)
  basePath: '',
  
  // Environment variables exposed to the browser
  env: {
    // These will be available on the client side with fallback values
    TESLA_CLIENT_ID: process.env.TESLA_CLIENT_ID || 'default-tesla-client-id',
    TESLA_REDIRECT_URI: process.env.TESLA_REDIRECT_URI || 'http://localhost:3002/api/auth/callback',
    TESLA_AUTH_URL: process.env.TESLA_AUTH_URL || 'https://auth.tesla.com/oauth2/v3',
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || 'default-google-maps-key',
  },
  
  // API routes handling
  rewrites: async () => {
    return [
      // Auth routes
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
      // Vehicle routes
      {
        source: '/api/vehicle/:path*',
        destination: '/api/vehicle/:path*',
      },
      // Trip routes
      {
        source: '/api/trip/:path*',
        destination: '/api/trip/:path*',
      },
    ]
  },
  
  // Optimizations
  images: {
    domains: ['owner-api.teslamotors.com', 'images.unsplash.com', 'randomuser.me'],
    minimumCacheTTL: 60,
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Configure path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      'lib': resolve(__dirname, 'lib'),
      'models': resolve(__dirname, 'models'),
      'components': resolve(__dirname, 'components'),
      'api': resolve(__dirname, 'api'),
      'styles': resolve(__dirname, 'styles'),
      'public': resolve(__dirname, 'public')
    };
    
    // Add support for .mjs files
    config.resolve.extensions.push('.mjs');
    
    return config;
  },
} 