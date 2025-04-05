/**
 * Trip Start API Endpoint
 * 
 * Starts a new trip for a Tesla vehicle with a customer.
 */

import teslaApi from 'lib/tesla-api.js';
import { getVehicleById } from 'models/vehicle.js';
import { createTrip, saveTrip, startTrip, getActiveTrip } from 'models/trip.js';
import { getCustomerById } from 'models/customer.js';
import { getVehicleLocation } from 'api/vehicle/location.js';

export default async function handler(req, res) {
  try {
    // Check request method (should be POST)
    if (req.method !== 'POST') {
      return sendResponse(res, 405, { error: 'Method not allowed' });
    }
    
    // Extract request data
    const { vehicleId, customerId, estimatedFare, notes, paymentMethod, discountPercent } = req.body || {};
    
    // Validate required fields
    if (!vehicleId) {
      return sendResponse(res, 400, { error: 'Vehicle ID is required' });
    }
    
    if (!customerId) {
      return sendResponse(res, 400, { error: 'Customer ID is required' });
    }
    
    // Check if there's already an active trip
    const existingActiveTrip = getActiveTrip();
    if (existingActiveTrip) {
      return sendResponse(res, 409, { 
        error: 'There is already an active trip in progress',
        trip: existingActiveTrip
      });
    }
    
    // Verify vehicle exists
    const vehicle = getVehicleById(vehicleId);
    if (!vehicle) {
      return sendResponse(res, 404, { error: 'Vehicle not found' });
    }
    
    // Verify customer exists
    const customer = getCustomerById(customerId);
    if (!customer) {
      return sendResponse(res, 404, { error: 'Customer not found' });
    }
    
    // Get current vehicle location as starting point
    const locationData = await getVehicleLocation(vehicleId);
    
    // Create starting location object
    const startLocation = {
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      address: 'Current Location' // In a real app, we would do reverse geocoding here
    };
    
    // Create a new trip
    const trip = createTrip({
      customerId,
      vehicleId,
      estimatedFare: estimatedFare || 0,
      notes: notes || '',
      paymentMethod: paymentMethod || '',
      discountPercent: parseInt(discountPercent || 0)
    });
    
    // Save the trip to get an ID
    const savedTrip = saveTrip(trip);
    
    // Start the trip with the current location
    const startedTrip = startTrip(savedTrip.id, startLocation);
    
    return sendResponse(res, 201, {
      success: true,
      message: 'Trip started successfully',
      trip: startedTrip,
      vehicle,
      customer
    });
  } catch (error) {
    console.error('Error starting trip:', error);
    return sendResponse(res, 500, { error: error.message });
  }
}

/**
 * Start a trip (client-side function)
 * @param {Object} tripData Trip data
 * @returns {Promise<Object>} Started trip
 */
export async function startNewTrip(tripData) {
  try {
    // Validate required fields
    if (!tripData.vehicleId) {
      throw new Error('Vehicle ID is required');
    }
    
    if (!tripData.customerId) {
      throw new Error('Customer ID is required');
    }
    
    // Check if there's already an active trip
    const existingActiveTrip = getActiveTrip();
    if (existingActiveTrip) {
      throw new Error('There is already an active trip in progress');
    }
    
    // Verify vehicle exists
    const vehicle = getVehicleById(tripData.vehicleId);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    
    // Verify customer exists
    const customer = getCustomerById(tripData.customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    // Get current vehicle location as starting point
    const locationData = await getVehicleLocation(tripData.vehicleId);
    
    // Create starting location object
    const startLocation = {
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      address: 'Current Location' // In a real app, we would do reverse geocoding here
    };
    
    // Create a new trip
    const trip = createTrip({
      customerId: tripData.customerId,
      vehicleId: tripData.vehicleId,
      estimatedFare: tripData.estimatedFare || 0,
      notes: tripData.notes || '',
      paymentMethod: tripData.paymentMethod || '',
      discountPercent: parseInt(tripData.discountPercent || 0)
    });
    
    // Save the trip to get an ID
    const savedTrip = saveTrip(trip);
    
    // Start the trip with the current location
    const startedTrip = startTrip(savedTrip.id, startLocation);
    
    return {
      success: true,
      message: 'Trip started successfully',
      trip: startedTrip,
      vehicle,
      customer
    };
  } catch (error) {
    console.error('Error starting trip:', error);
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