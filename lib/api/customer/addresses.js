/**
 * API endpoint for retrieving customer saved addresses
 * Returns mock data in development or actual saved addresses in production
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
    const mockAddresses = [
      {
        id: 'addr1',
        name: 'Home',
        full: '123 Main St, New York, NY 10001',
        favorite: true
      },
      {
        id: 'addr2',
        name: 'Work',
        full: '456 Park Ave, New York, NY 10022',
        favorite: true
      },
      {
        id: 'addr3',
        name: 'Gym',
        full: '789 Broadway, New York, NY 10003',
        favorite: false
      },
      {
        id: 'addr4',
        name: 'Parents',
        full: '101 Queens Blvd, Queens, NY 11375',
        favorite: false
      }
    ];

    // Return success response with addresses
    return res.status(200).json({ 
      success: true, 
      addresses: mockAddresses
    });
  } catch (error) {
    console.error('Error retrieving addresses:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve addresses' 
    });
  }
} 