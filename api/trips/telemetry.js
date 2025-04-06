/**
 * API endpoint for adding telemetry data to a trip
 * In a real application, this would receive data from the Tesla API
 */
import { getTripById, saveTrip } from 'models/trip';

export default function handler(req, res) {
  // Allow both GET (for retrieving telemetry) and POST (for adding telemetry)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const tripId = req.query.tripId || (req.body && req.body.tripId);

    // Validate required fields
    if (!tripId) {
      return res.status(400).json({
        success: false,
        error: 'Trip ID is required'
      });
    }

    // Get the trip
    const trip = getTripById(tripId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }

    // Handle GET request (retrieve telemetry)
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        telemetry: trip.telemetryData || []
      });
    }

    // Handle POST request (add telemetry data)
    const { latitude, longitude, speed, timestamp } = req.body;

    // Validate telemetry data
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    // Create telemetry entry
    const telemetryEntry = {
      timestamp: timestamp || new Date().toISOString(),
      latitude,
      longitude,
      speed: speed || 0
    };

    // Add to telemetry data array
    const telemetryData = [...(trip.telemetryData || []), telemetryEntry];

    // Update trip with new telemetry data
    const updatedTrip = {
      ...trip,
      telemetryData
    };

    // Save updated trip
    saveTrip(updatedTrip);

    // Return success response with updated telemetry data
    return res.status(200).json({
      success: true,
      telemetry: telemetryData
    });
  } catch (error) {
    console.error('Error handling telemetry data:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process telemetry data'
    });
  }
} 