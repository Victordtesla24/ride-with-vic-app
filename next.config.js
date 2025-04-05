/**
 * Next.js configuration file
 */

const config = {
  // Base path for the app (if deploying to a subdirectory)
  basePath: '',
  
  // Environment variables exposed to the browser
  env: {
    // These will be available on the client side
    TESLA_CLIENT_ID: process.env.TESLA_CLIENT_ID,
    TESLA_REDIRECT_URI: process.env.TESLA_REDIRECT_URI,
    TESLA_AUTH_URL: process.env.TESLA_AUTH_URL,
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
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
    domains: ['owner-api.teslamotors.com'],
    minimumCacheTTL: 60,
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Configure path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      'lib': `${__dirname}/lib`,
      'models': `${__dirname}/models`,
      'components': `${__dirname}/components`,
      'api': `${__dirname}/api`,
      'styles': `${__dirname}/styles`,
      'public': `${__dirname}/public`
    };
    
    // Add support for .mjs files
    config.resolve.extensions.push('.mjs');
    
    return config;
  },
};

// Support both CommonJS and ES modules
module.exports = config; 