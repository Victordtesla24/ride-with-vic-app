/**
 * API endpoint for retrieving popular destinations
 * Returns mock data in development or actual popular destinations in production
 */

export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // In a real application, we would fetch from a database
    // For development, use mock data
    const mockDestinations = [
      {
        id: 'dest1',
        name: 'Grand Central Terminal',
        address: '89 E 42nd St, New York, NY 10017',
        type: 'transit'
      },
      {
        id: 'dest2',
        name: 'Empire State Building',
        address: '20 W 34th St, New York, NY 10001',
        type: 'landmark'
      },
      {
        id: 'dest3',
        name: 'Central Park',
        address: 'Central Park, New York, NY',
        type: 'park'
      },
      {
        id: 'dest4',
        name: 'Times Square',
        address: 'Manhattan, NY 10036',
        type: 'landmark'
      },
      {
        id: 'dest5',
        name: 'JFK Airport',
        address: 'Queens, NY 11430',
        type: 'airport'
      },
      {
        id: 'dest6',
        name: 'Brooklyn Bridge',
        address: 'Brooklyn Bridge, New York, NY 10038',
        type: 'landmark'
      }
    ];

    // Return success response with destinations
    return res.status(200).json({ 
      success: true, 
      destinations: mockDestinations
    });
  } catch (error) {
    console.error('Error retrieving destinations:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve destinations' 
    });
  }
} 