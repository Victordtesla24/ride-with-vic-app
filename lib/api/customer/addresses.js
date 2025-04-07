/**
 * API endpoint for retrieving customer saved addresses
 * Retrieves saved addresses from the database
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
    // Get customer ID from query parameters or request body
    const customerId = req.query.customerId || req.body?.customerId;
    
    // If running in browser environment, fetch from localStorage
    let addresses = [];
    
    if (typeof window !== 'undefined') {
      // Retrieve from localStorage
      const savedAddresses = localStorage.getItem('savedAddresses');
      
      if (savedAddresses) {
        addresses = JSON.parse(savedAddresses);
        
        // Filter by customer ID if provided
        if (customerId) {
          addresses = addresses.filter(addr => addr.customerId === customerId);
        }
      }
    } else {
      // Server-side: would normally fetch from database
      // For demonstration, return empty array
      addresses = [];
    }

    // Return success response with addresses
    return res.status(200).json({ 
      success: true, 
      addresses: addresses
    });
  } catch (error) {
    console.error('Error retrieving addresses:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve addresses' 
    });
  }
} 