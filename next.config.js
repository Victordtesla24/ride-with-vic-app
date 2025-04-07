/**
 * Next.js configuration file
 */

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  // Remove static exports setting as it causes routing issues
  // output: 'export', 
  
  // Base path for the app (if deploying to a subdirectory)
  basePath: '',
  
  // Environment variables are loaded from .env.local, 
  // only defining fallbacks or public variables here
  // Don't expose sensitive credentials here
  publicRuntimeConfig: {
    // Public variables that can be exposed to the browser
    NEXT_PUBLIC_TESLA_API_BASE_URL: process.env.NEXT_PUBLIC_TESLA_API_BASE_URL,
    NEXT_PUBLIC_TESLA_AUTH_URL: process.env.NEXT_PUBLIC_TESLA_AUTH_URL,
    NEXT_PUBLIC_TESLA_CLIENT_ID: process.env.NEXT_PUBLIC_TESLA_CLIENT_ID,
    NEXT_PUBLIC_TESLA_REDIRECT_URI: process.env.NEXT_PUBLIC_TESLA_REDIRECT_URI,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
  },
  
  // Properly configure API routes
  // Remove rewrites that could interfere with Next.js default routing
  async headers() {
    return [
      {
        // Apply these headers to API routes
        source: '/api/:path*',
        headers: [
          { key: 'Content-Type', value: 'application/json' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' }
        ]
      }
    ];
  },
  
  // Optimizations
  images: {
    domains: ['owner-api.teslamotors.com', 'images.unsplash.com', 'randomuser.me'],
    minimumCacheTTL: 60,
  },
  
  // Webpack configuration
  webpack: (config) => {
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