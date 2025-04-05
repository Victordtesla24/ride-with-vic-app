/**
 * End Trip API Endpoint
 * 
 * This endpoint ends an active trip, calculates the final fare,
 * and updates the trip data.
 */

import { getTripById, getActiveTrip, endTrip, calculateTripDistance } from 'models/trip.js';
import { getVehicleById } from 'models/vehicle.js';
import { getVehicleLocation } from 'api/vehicle/location.js';

export default async function handler(req, res) {
  try {
    // Check request method (should be POST)
    if (req.method !== 'POST') {
      return sendResponse(res, 405, { error: 'Method not allowed' });
    }
    
    // Extract request data
    const { tripId, actualFare } = req.body || {};
    
    // If trip ID is provided, use it; otherwise find the active trip
    let trip;
    if (tripId) {
      trip = getTripById(tripId);
      if (!trip) {
        return sendResponse(res, 404, { error: 'Trip not found' });
      }
    } else {
      trip = getActiveTrip();
      if (!trip) {
        return sendResponse(res, 404, { error: 'No active trip found' });
      }
    }
    
    // Verify trip is active
    if (trip.status !== 'active') {
      return sendResponse(res, 400, { error: 'Trip is not active' });
    }
    
    // Get current vehicle location as ending point
    const locationData = await getVehicleLocation(trip.vehicleId);
    
    // Create ending location object
    const endLocation = {
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      address: 'End Location' // In a real app, we would do reverse geocoding here
    };
    
    // Calculate trip distance
    const distance = calculateTripDistance([
      {
        latitude: trip.startLocation.latitude,
        longitude: trip.startLocation.longitude,
        timestamp: trip.startTime
      },
      ...trip.telemetryData,
      {
        latitude: endLocation.latitude,
        longitude: endLocation.longitude,
        timestamp: new Date().toISOString()
      }
    ]);
    
    // Calculate fare based on distance if not provided
    const calculatedFare = actualFare || calculateFareFromDistance(distance);
    
    // End the trip with the final location and fare
    const completedTrip = endTrip(trip.id, endLocation, calculatedFare);
    
    // Get vehicle info
    const vehicle = getVehicleById(trip.vehicleId);
    
    return sendResponse(res, 200, {
      success: true,
      message: 'Trip ended successfully',
      trip: completedTrip,
      vehicle,
      distance,
      fare: completedTrip.finalFare,
      discountAmount: completedTrip.discountAmount
    });
  } catch (error) {
    console.error('Error ending trip:', error);
    return sendResponse(res, 500, { error: error.message });
  }
}

/**
 * End a trip (client-side function)
 * @param {String} tripId Trip ID (optional, will use active trip if not provided)
 * @param {Number} actualFare Actual fare (optional, will calculate based on distance if not provided)
 * @returns {Promise<Object>} Completed trip data
 */
export async function endCurrentTrip(tripId, actualFare) {
  try {
    // If trip ID is provided, use it; otherwise find the active trip
    let trip;
    if (tripId) {
      trip = getTripById(tripId);
      if (!trip) {
        throw new Error('Trip not found');
      }
    } else {
      trip = getActiveTrip();
      if (!trip) {
        throw new Error('No active trip found');
      }
    }
    
    // Verify trip is active
    if (trip.status !== 'active') {
      throw new Error('Trip is not active');
    }
    
    // Get current vehicle location as ending point
    const locationData = await getVehicleLocation(trip.vehicleId);
    
    // Create ending location object
    const endLocation = {
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      address: 'End Location' // In a real app, we would do reverse geocoding here
    };
    
    // Calculate trip distance
    const distance = calculateTripDistance([
      {
        latitude: trip.startLocation.latitude,
        longitude: trip.startLocation.longitude,
        timestamp: trip.startTime
      },
      ...trip.telemetryData,
      {
        latitude: endLocation.latitude,
        longitude: endLocation.longitude,
        timestamp: new Date().toISOString()
      }
    ]);
    
    // Calculate fare based on distance if not provided
    const calculatedFare = actualFare || calculateFareFromDistance(distance);
    
    // End the trip with the final location and fare
    const completedTrip = endTrip(trip.id, endLocation, calculatedFare);
    
    // Get vehicle info
    const vehicle = getVehicleById(trip.vehicleId);
    
    return {
      success: true,
      message: 'Trip ended successfully',
      trip: completedTrip,
      vehicle,
      distance,
      fare: completedTrip.finalFare,
      discountAmount: completedTrip.discountAmount
    };
  } catch (error) {
    console.error('Error ending trip:', error);
    throw error;
  }
}

/**
 * Calculate fare based on distance
 * @param {Number} distance Distance in kilometers
 * @returns {Number} Calculated fare
 */
function calculateFareFromDistance(distance) {
  // Base fare
  const baseFare = 5.0;
  
  // Rate per kilometer
  const ratePerKm = 2.5;
  
  // Calculate fare (base + distance * rate)
  return baseFare + (distance * ratePerKm);
}

// Helper function to send a response in the appropriate format based on environment
function sendResponse(res, statusCode, body) {
  // Check if we're in a serverless function environment
  if (res && typeof res.status === 'function') {
    return res.status(statusCode).json(body);
  }
  
  // Otherwise, return the body for client-side usage
  return body;
} 