import teslaApi from 'lib/tesla-api.js';
import { saveVehicles, createVehicle } from 'models/vehicle.js';

export default async function handler(req, res) {
  try {
    // Check if authenticated
    if (!teslaApi.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated with Tesla'
      });
    }
    
    // Fetch vehicles from Tesla API
    const teslaVehicles = await teslaApi.getVehicles();
    
    if (!Array.isArray(teslaVehicles) || teslaVehicles.length === 0) {
      return res.status(200).json({
        success: true,
        vehicles: []
      });
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
    
    // Save to database (localStorage in this case)
    saveVehicles(vehicles);
    
    return res.status(200).json({
      success: true,
      vehicles
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch vehicles'
    });
  }
} 