/**
 * API endpoint for creating a new trip
 * In a real application, this would call the Tesla API or booking service
 */
import { v4 as uuidv4 } from 'uuid';
import { saveTrip } from 'models/trip';
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
    const { 
      customerId, 
      vehicleId, 
      startLocation, 
      endLocation, 
      estimatedFare 
    } = req.body;

    // Validate required fields
    if (!customerId || !vehicleId || !startLocation || !endLocation) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Create a new trip
    const trip = {
      id: uuidv4(),
      customerId,
      vehicleId,
      status: 'reserved',
      startTime: null,
      endTime: null,
      startLocation,
      endLocation,
      estimatedFare: estimatedFare || 0,
      actualFare: null,
      discountPercent: 0,
      discountAmount: 0,
      finalFare: null,
      telemetryData: [],
      notes: '',
      paymentMethod: 'credit_card',
      receipt: null,
      createdAt: new Date().toISOString()
    };

    // Save the trip
    saveTrip(trip);

    // Update vehicle state to 'reserved'
    try {
      updateVehicleState(vehicleId, 'reserved');
    } catch (error) {
      console.error('Could not update vehicle state:', error);
      // Continue with trip creation even if vehicle update fails
    }

    // Return success response with trip data
    return res.status(201).json({
      success: true,
      trip
    });
  } catch (error) {
    console.error('Error creating trip:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create trip'
    });
  }
} 