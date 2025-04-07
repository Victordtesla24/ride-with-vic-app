/**
 * Trips List API
 * 
 * Returns a list of trips for the customer
 */

import { getTrips } from '../../data/trips';

export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract query parameters
    const { customerId, vehicleId, status, startDate, endDate } = req.query;
    
    // Validate required parameters
    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }
    
    // Build filter object
    const filters = { customerId };
    
    // Add optional filters
    if (vehicleId) filters.vehicleId = vehicleId;
    if (status) filters.status = status;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    
    // Get trips with filters
    const trips = getTrips(filters);
    
    // Return the trips
    return res.status(200).json({ 
      success: true, 
      trips 
    });
  } catch (error) {
    console.error('Error in trips list API:', error);
    return res.status(500).json({ 
      error: 'Failed to retrieve trips',
      message: error.message 
    });
  }
} 