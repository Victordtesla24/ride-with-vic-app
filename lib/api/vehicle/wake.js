/**
 * Wake Vehicle API Endpoint
 * 
 * This endpoint attempts to wake up a Tesla vehicle.
 */

import teslaApi from 'lib/tesla-api.js';
import { getVehicleById, updateVehicleState } from 'models/vehicle.js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { vehicleId } = req.query;

    if (!vehicleId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Vehicle ID is required' 
      });
    }

    // Get the vehicle
    const vehicle = getVehicleById(vehicleId);
    
    if (!vehicle) {
      return res.status(404).json({ 
        success: false, 
        error: 'Vehicle not found' 
      });
    }

    // If vehicle is already online, return success
    if (vehicle.state === 'online') {
      return res.status(200).json({ 
        success: true, 
        message: 'Vehicle is already online',
        vehicle
      });
    }

    // In a real application, this would call the Tesla API to wake up the vehicle
    // For this mock implementation, we'll just update the vehicle state to 'online'
    
    // Simulate a delay to make it seem like we're waiting for the vehicle to wake up
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update the vehicle state to 'online'
    const updatedVehicle = updateVehicleState(vehicleId, 'online');

    // Return success response
    return res.status(200).json({ 
      success: true, 
      message: 'Vehicle woken up successfully',
      vehicle: updatedVehicle
    });
  } catch (error) {
    console.error('Error waking up vehicle:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to wake up vehicle' 
    });
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