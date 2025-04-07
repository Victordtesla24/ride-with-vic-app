/**
 * Vehicle List API
 * 
 * Retrieves a list of vehicles from the Tesla API
 */

import { TeslaAPI } from '../../tesla-api';

export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize Tesla API
    const teslaAPI = new TeslaAPI();
    
    // Check if Tesla API is authenticated
    if (!teslaAPI.isAuthenticated()) {
      return res.status(401).json({
        error: 'Not authenticated with Tesla API',
        message: 'Please authenticate with the Tesla API first'
      });
    }

    // Get vehicles from Tesla API
    const vehicles = await teslaAPI.getVehicles();
    
    if (!vehicles || vehicles.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No vehicles found',
        vehicles: []
      });
    }
    
    // Format vehicle data for the app
    const formattedVehicles = vehicles.map(vehicle => ({
      id: vehicle.id_s || vehicle.id,
      name: vehicle.display_name || 'Tesla Vehicle',
      model: vehicle.vehicle_config?.car_type || vehicle.model || 'Unknown Model',
      vin: vehicle.vin,
      state: vehicle.state,
      isCharging: vehicle.charge_state?.charging_state === 'Charging',
      batteryLevel: vehicle.charge_state?.battery_level || 0,
      lastUpdated: vehicle.vehicle_state?.timestamp || new Date().toISOString()
    }));

    // Return success response with vehicles
    return res.status(200).json({
      success: true,
      vehicles: formattedVehicles
    });
  } catch (error) {
    console.error('Error retrieving vehicles:', error);
    return res.status(500).json({
      error: 'Failed to retrieve vehicles',
      message: error.message || 'An unknown error occurred'
    });
  }
} 