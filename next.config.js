/**
 * Next.js configuration file
 */

module.exports = {
  // Enable static exports
  output: 'export',
  
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
    // Add any webpack customizations here
    return config
  },
} 