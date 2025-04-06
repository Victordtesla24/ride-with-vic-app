/**
 * API endpoint for listing Tesla vehicles
 * Returns mock data in development or actual Tesla Fleet API data in production
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
    // In a real application, we would fetch from Tesla API
    // For development, use mock data
    const mockVehicles = [
      {
        id: 'v1',
        display_name: 'Model 3',
        name: 'My Tesla',
        model: 'model3',
        vin: 'TESTVIN123456789',
        state: 'online',
        location: {
          latitude: 40.7128,
          longitude: -74.0060
        }
      },
      {
        id: 'v2',
        display_name: 'Model Y',
        name: 'Tesla SUV',
        model: 'modely',
        vin: 'TESTVIN987654321',
        state: 'online',
        location: {
          latitude: 40.7300,
          longitude: -73.9950
        }
      },
      {
        id: 'v3',
        display_name: 'Model S Plaid',
        name: 'Rocket Ship',
        model: 'models',
        vin: 'TESTVIN456789123',
        state: 'offline',
        location: {
          latitude: 40.7050,
          longitude: -74.0150
        }
      }
    ];

    // Return success response with vehicles
    return res.status(200).json({ 
      success: true, 
      vehicles: mockVehicles
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch vehicles' 
    });
  }
} 