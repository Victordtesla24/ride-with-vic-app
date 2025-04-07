/**
 * API endpoint for retrieving trips
 * Returns all trips or filters by customer or status
 */
import { getTrips } from 'models/trip.js';

export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Get query parameters for filtering
    const { customerId, status } = req.query;
    
    // Get all trips
    let trips = getTrips();
    
    // Apply filters if provided
    if (customerId) {
      trips = trips.filter(trip => trip.customerId === customerId);
    }
    
    if (status) {
      trips = trips.filter(trip => trip.status === status);
    }
    
    // Sort trips by creation date, newest first
    trips.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    // Return success response with trips
    return res.status(200).json({
      success: true,
      trips
    });
  } catch (error) {
    console.error('Error retrieving trips:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve trips'
    });
  }
} 