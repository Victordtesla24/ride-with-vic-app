/**
 * API endpoint for retrieving popular destinations
 * Retrieves popular destinations from the database or localStorage
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
    // Get city from query parameters (optional)
    const city = req.query.city;
    
    // If running in browser environment, fetch from localStorage
    let destinations = [];
    
    if (typeof window !== 'undefined') {
      // Retrieve from localStorage
      const storedDestinations = localStorage.getItem('popularDestinations');
      
      if (storedDestinations) {
        destinations = JSON.parse(storedDestinations);
        
        // Filter by city if provided
        if (city) {
          destinations = destinations.filter(dest => 
            dest.address.toLowerCase().includes(city.toLowerCase())
          );
        }
      }
    } else {
      // Server-side: would normally fetch from database
      // For demonstration, return empty array
      destinations = [];
    }

    // Return success response with destinations
    return res.status(200).json({ 
      success: true, 
      destinations: destinations
    });
  } catch (error) {
    console.error('Error retrieving destinations:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve destinations' 
    });
  }
} 