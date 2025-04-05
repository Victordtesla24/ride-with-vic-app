/**
 * Vehicle Wake API Endpoint
 * 
 * Attempts to wake up a sleeping Tesla vehicle.
 */

import teslaApi from 'lib/tesla-api.js';
import { getVehicleById, updateVehicleState } from 'models/vehicle.js';

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
    
    // Attempt to wake up the vehicle
    const wakeResponse = await teslaApi.wakeUpVehicle(vehicleId);
    
    // Update vehicle state in storage
    updateVehicleState(vehicleId, 'waking');
    
    return sendResponse(res, 200, {
      success: true,
      message: 'Wake up command sent to vehicle',
      vehicle: wakeResponse
    });
  } catch (error) {
    console.error('Error waking up vehicle:', error);
    return sendResponse(res, 500, { error: error.message });
  }
}

/**
 * Wake up a vehicle (client-side function)
 * @param {String} vehicleId Tesla vehicle ID
 * @returns {Promise<Object>} Wake response
 */
export async function wakeVehicle(vehicleId) {
  if (!vehicleId) {
    throw new Error('Vehicle ID is required');
  }
  
  try {
    // Get vehicle from storage
    const vehicle = getVehicleById(vehicleId);
    
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    
    // Attempt to wake up the vehicle
    const wakeResponse = await teslaApi.wakeUpVehicle(vehicleId);
    
    // Update vehicle state in storage
    updateVehicleState(vehicleId, 'waking');
    
    return {
      success: true,
      message: 'Wake up command sent to vehicle',
      vehicle: wakeResponse
    };
  } catch (error) {
    console.error('Error waking up vehicle:', error);
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