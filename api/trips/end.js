/**
 * API endpoint for ending a trip
 * In a real application, this would call the Tesla API to end the trip
 */
import { getTripById, saveTrip } from 'models/trip';
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
      tripId, 
      endLocation, 
      actualFare, 
      discountPercent, 
      notes 
    } = req.body;

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

    // Check if trip is in valid state to end
    if (trip.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        error: `Cannot end trip with status: ${trip.status}`
      });
    }

    // Calculate fare details
    const fare = actualFare || trip.estimatedFare;
    const discount = discountPercent || trip.discountPercent;
    const discountAmount = (fare * discount) / 100;
    const finalFare = fare - discountAmount;

    // Generate receipt data
    const receipt = {
      id: `RCV-${Date.now()}`,
      date: new Date().toISOString(),
      items: [
        {
          description: 'Trip fare',
          amount: fare
        }
      ],
      discount: {
        percent: discount,
        amount: discountAmount
      },
      total: finalFare,
      paymentMethod: trip.paymentMethod
    };

    // Update trip data
    const updatedTrip = {
      ...trip,
      status: 'completed',
      endTime: new Date().toISOString(),
      endLocation: endLocation || trip.endLocation,
      actualFare: fare,
      discountPercent: discount,
      discountAmount,
      finalFare,
      notes: notes || trip.notes,
      receipt
    };

    // Save updated trip
    saveTrip(updatedTrip);

    // Update vehicle state to 'online'
    try {
      updateVehicleState(trip.vehicleId, 'online');
    } catch (error) {
      console.error('Could not update vehicle state:', error);
      // Continue with trip end even if vehicle update fails
    }

    // Return success response with updated trip data
    return res.status(200).json({
      success: true,
      trip: updatedTrip
    });
  } catch (error) {
    console.error('Error ending trip:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to end trip'
    });
  }
} 