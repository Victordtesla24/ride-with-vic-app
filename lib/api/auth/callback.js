/**
 * Tesla OAuth Callback Utilities
 * 
 * This module provides utility functions for handling Tesla OAuth callbacks
 * both on the server and client sides.
 */

import teslaApi from 'lib/tesla-api.js';
import { saveVehicles, createVehicle } from 'models/vehicle.js';

// Main utility function for handling callbacks
export async function handleTeslaCallback(req, res) {
  try {
    // Extract authorization code from query parameters
    const { code, error, error_description } = req.query || {};
    
    // Check if there was an error in the OAuth process
    if (error) {
      throw new Error(error_description || 'OAuth authentication failed');
    }
    
    // Validate authorization code
    if (!code) {
      throw new Error('No authorization code received');
    }
    
    // Exchange authorization code for access tokens
    
    // Check if we're in a browser environment
    const isBrowser = typeof window !== 'undefined';
    
    if (isBrowser) {
      // In browser - proceed to fetch and store vehicle data
      try {
        await fetchAndStoreVehicles();
        
        // Redirect to the vehicle selection page
        window.location.href = '/vehicle-select.html';
        return { success: true };
      } catch (vehicleError) {
        console.error('Error fetching vehicles:', vehicleError);
        return { error: vehicleError.message };
      }
    } else {
      // In serverless function - send response with tokens
      res.status(200).json({
        success: true,
        message: 'Authentication successful'
      });
    }
  } catch (error) {
    console.error('Error in Tesla OAuth callback:', error);
    
    // Handle the error based on environment
    if (typeof window !== 'undefined') {
      // Display error to user
      alert(`Authentication failed: ${error.message}`);
      // Redirect to home page
      window.location.href = '/';
      return { error: error.message };
    } else {
      // Return error in API response
      res.status(500).json({ error: error.message });
    }
  }
}

// Default export for backwards compatibility
export default handleTeslaCallback;

/**
 * Fetch and store Tesla vehicles
 */
export async function fetchAndStoreVehicles() {
  try {
    // Ensure user is authenticated
    if (!teslaApi.isAuthenticated()) {
      throw new Error('Not authenticated with Tesla');
    }
    
    // Fetch vehicles from Tesla API
    const teslaVehicles = await teslaApi.getVehicles();
    
    if (!Array.isArray(teslaVehicles) || teslaVehicles.length === 0) {
      throw new Error('No vehicles found in your Tesla account');
    }
    
    // Convert to our vehicle model structure
    const vehicles = teslaVehicles.map(vehicle => createVehicle({
      id: vehicle.id.toString(),
      name: vehicle.display_name || vehicle.vehicle_id,
      model: vehicle.model_name || 'Tesla',
      vin: vehicle.vin,
      display_name: vehicle.display_name,
      state: vehicle.state
    }));
    
    // Save to localStorage
    saveVehicles(vehicles);
    
    return { success: true, vehicles };
  } catch (error) {
    console.error('Error fetching Tesla vehicles:', error);
    throw error;
  }
}

// For client-side callback handling
export async function handleCallback() {
  try {
    // Parse URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    
    // Check for errors
    if (error) {
      throw new Error(errorDescription || 'OAuth authentication failed');
    }
    
    // Validate code
    if (!code) {
      throw new Error('No authorization code received');
    }
    
    // Exchange code for tokens
    await teslaApi.exchangeCodeForTokens(code);
    
    // Fetch and store vehicles
    await fetchAndStoreVehicles();
    
    // Redirect to the vehicle selection page
    window.location.href = '/vehicle-select.html';
    return { success: true };
  } catch (error) {
    console.error('Error handling Tesla callback:', error);
    alert(`Authentication failed: ${error.message}`);
    window.location.href = '/';
    return { error: error.message };
  }
} 