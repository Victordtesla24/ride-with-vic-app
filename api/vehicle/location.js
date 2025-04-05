/**
 * Tesla Vehicle Location API Endpoint
 * 
 * This endpoint gets the current location of a Tesla vehicle.
 */

import teslaApi from '../../lib/tesla-api.js';
import { getVehicleById, updateVehicleState } from '../../models/vehicle.js';

export default async function handler(req, res) {
  // Extract vehicle ID from query parameters or request body
  const vehicleId = req.query?.vehicleId || req.body?.vehicleId;
  
  // Check if vehicle ID is provided
  if (!vehicleId) {
    return sendResponse(res, 400, { error: 'Vehicle ID is required' });
  }
  
  try {
    // Get vehicle from storage
    const vehicle = getVehicleById(vehicleId);
    
    if (!vehicle) {
      return sendResponse(res, 404, { error: 'Vehicle not found' });
    }
    
    // Check if the vehicle is online
    const isOnline = await teslaApi.isVehicleOnline(vehicleId);
    
    // Update vehicle state in storage
    updateVehicleState(vehicleId, isOnline ? 'online' : 'offline');
    
    // If the vehicle is offline, attempt to wake it up
    if (!isOnline) {
      try {
        await teslaApi.wakeUpVehicle(vehicleId);
        // Wait for the vehicle to wake up (Tesla API can be slow to respond)
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (wakeUpError) {
        console.error('Error waking up vehicle:', wakeUpError);
        return sendResponse(res, 503, { 
          error: 'Vehicle is offline and could not be woken up',
          vehicle
        });
      }
    }
    
    // Get the vehicle location
    const locationData = await teslaApi.getVehicleLocation(vehicleId);
    
    if (!locationData) {
      return sendResponse(res, 404, { error: 'Could not retrieve vehicle location' });
    }
    
    // Format the response
    const location = {
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      heading: locationData.heading,
      speed: locationData.speed,
      timestamp: locationData.timestamp,
      gpsAccuracy: locationData.gps_as_of
    };
    
    return sendResponse(res, 200, { location, vehicle });
  } catch (error) {
    console.error('Error getting vehicle location:', error);
    return sendResponse(res, 500, { error: error.message });
  }
}

/**
 * Get vehicle location (client-side function)
 * @param {String} vehicleId Tesla vehicle ID
 * @returns {Promise<Object>} Vehicle location data
 */
export async function getVehicleLocation(vehicleId) {
  if (!vehicleId) {
    throw new Error('Vehicle ID is required');
  }
  
  try {
    // Get vehicle from storage
    const vehicle = getVehicleById(vehicleId);
    
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    
    // Check if the vehicle is online
    const isOnline = await teslaApi.isVehicleOnline(vehicleId);
    
    // Update vehicle state in storage
    updateVehicleState(vehicleId, isOnline ? 'online' : 'offline');
    
    // If the vehicle is offline, attempt to wake it up
    if (!isOnline) {
      try {
        await teslaApi.wakeUpVehicle(vehicleId);
        // Wait for the vehicle to wake up
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (wakeUpError) {
        console.error('Error waking up vehicle:', wakeUpError);
        throw new Error('Vehicle is offline and could not be woken up');
      }
    }
    
    // Get the vehicle location
    const locationData = await teslaApi.getVehicleLocation(vehicleId);
    
    if (!locationData) {
      throw new Error('Could not retrieve vehicle location');
    }
    
    // Format the response
    return {
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      heading: locationData.heading,
      speed: locationData.speed,
      timestamp: locationData.timestamp,
      gpsAccuracy: locationData.gps_as_of,
      vehicle
    };
  } catch (error) {
    console.error('Error getting vehicle location:', error);
    throw error;
  }
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