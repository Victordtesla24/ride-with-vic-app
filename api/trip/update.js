/**
 * Update Trip API Endpoint
 * 
 * This endpoint updates an active trip with new telemetry data from the Tesla vehicle.
 */

import { getTripById, getActiveTrip, addTelemetryPoint, updateTrip } from 'models/trip.js';
import { getVehicleLocation } from 'api/vehicle/location.js';

export default async function handler(req, res) {
  try {
    // Check request method (should be POST)
    if (req.method !== 'POST') {
      return sendResponse(res, 405, { error: 'Method not allowed' });
    }
    
    // Extract request data
    const { tripId, manualUpdate } = req.body || {};
    
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
    
    // If this is a manual update with provided data (for testing purposes)
    if (manualUpdate && req.body.telemetryPoint) {
      const updatedTrip = addTelemetryPoint(trip.id, {
        timestamp: new Date().toISOString(),
        ...req.body.telemetryPoint
      });
      
      return sendResponse(res, 200, {
        success: true,
        message: 'Trip updated successfully (manual)',
        trip: updatedTrip
      });
    }
    
    // Get current vehicle location and add as telemetry point
    const locationData = await getVehicleLocation(trip.vehicleId);
    
    // Create telemetry point
    const telemetryPoint = {
      timestamp: new Date().toISOString(),
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      speed: locationData.speed || 0,
      heading: locationData.heading || 0
    };
    
    // Add telemetry point to trip
    const updatedTrip = addTelemetryPoint(trip.id, telemetryPoint);
    
    return sendResponse(res, 200, {
      success: true,
      message: 'Trip updated successfully',
      trip: updatedTrip,
      telemetryPoint
    });
  } catch (error) {
    console.error('Error updating trip:', error);
    return sendResponse(res, 500, { error: error.message });
  }
}

/**
 * Update a trip with new telemetry data (client-side function)
 * @param {String} tripId Trip ID (optional, will use active trip if not provided)
 * @returns {Promise<Object>} Updated trip data
 */
export async function updateTripTelemetry(tripId) {
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
    
    // Get current vehicle location and add as telemetry point
    const locationData = await getVehicleLocation(trip.vehicleId);
    
    // Create telemetry point
    const telemetryPoint = {
      timestamp: new Date().toISOString(),
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      speed: locationData.speed || 0,
      heading: locationData.heading || 0
    };
    
    // Add telemetry point to trip
    const updatedTrip = addTelemetryPoint(trip.id, telemetryPoint);
    
    return {
      success: true,
      message: 'Trip updated successfully',
      trip: updatedTrip,
      telemetryPoint
    };
  } catch (error) {
    console.error('Error updating trip:', error);
    throw error;
  }
}

/**
 * Manually add a telemetry point to a trip (for testing purposes)
 * @param {String} tripId Trip ID
 * @param {Object} telemetryPoint Telemetry data point
 * @returns {Object|null} Updated trip or null if not found
 */
export function addManualTelemetryPoint(tripId, telemetryPoint) {
  const trip = getTripById(tripId);
  
  if (!trip) {
    throw new Error('Trip not found');
  }
  
  if (trip.status !== 'active') {
    throw new Error('Trip is not active');
  }
  
  return addTelemetryPoint(trip.id, {
    timestamp: new Date().toISOString(),
    ...telemetryPoint
  });
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