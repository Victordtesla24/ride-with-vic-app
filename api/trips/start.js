/**
 * API endpoint for starting a trip
 * In a real application, this would call the Tesla API to start the trip
 */
import { createTrip, saveTrip, startTrip } from 'models/trip.js';
import { getVehicleById } from 'models/vehicle.js';
import { updateVehicleState } from 'models/vehicle';

export default function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { tripId, startLocation } = req.body;

    // Validate required fields
    if (!tripId) {
      return res.status(400).json({
        success: false,
        error: 'Trip ID is required'
      });
    }

    // Get the trip
    const trip = createTrip(tripId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }

    // Check if trip is in valid state to start
    if (trip.status !== 'reserved') {
      return res.status(400).json({
        success: false,
        error: `Cannot start trip with status: ${trip.status}`
      });
    }

    // Update trip data
    const updatedTrip = {
      ...trip,
      status: 'in_progress',
      startTime: new Date().toISOString(),
      startLocation: startLocation || trip.startLocation,
      telemetryData: []
    };

    // Save updated trip
    saveTrip(updatedTrip);

    // Update vehicle state to 'in_use'
    try {
      updateVehicleState(trip.vehicleId, 'in_use');
    } catch (error) {
      console.error('Could not update vehicle state:', error);
      // Continue with trip start even if vehicle update fails
    }

    // Return success response with updated trip data
    return res.status(200).json({
      success: true,
      trip: updatedTrip
    });
  } catch (error) {
    console.error('Error starting trip:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to start trip'
    });
  }
} 