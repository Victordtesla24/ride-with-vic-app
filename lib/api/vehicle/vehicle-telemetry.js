/**
 * Vehicle Telemetry API
 * 
 * Retrieves real-time telemetry data from the Tesla API for a specific vehicle
 */

import { TeslaAPI } from '../../tesla-api';

/**
 * Extract location data from vehicle data
 */
function extractLocationData(vehicleData) {
  if (!vehicleData || !vehicleData.drive_state) {
    return null;
  }
  
  const { drive_state } = vehicleData;
  
  return {
    latitude: drive_state.latitude,
    longitude: drive_state.longitude,
    heading: drive_state.heading,
    speed: drive_state.speed ? drive_state.speed : 0,
    timestamp: new Date().toISOString()
  };
}

/**
 * Extract vehicle speed from vehicle data
 */
function extractVehicleSpeed(vehicleData) {
  if (!vehicleData || !vehicleData.drive_state) {
    return 0;
  }
  
  return vehicleData.drive_state.speed || 0;
}

/**
 * Extract battery data from vehicle data
 */
function extractBatteryData(vehicleData) {
  if (!vehicleData || !vehicleData.charge_state) {
    return null;
  }
  
  const { charge_state } = vehicleData;
  
  return {
    batteryLevel: charge_state.battery_level,
    batteryRange: charge_state.battery_range,
    chargingState: charge_state.charging_state,
    chargeLimit: charge_state.charge_limit_soc,
    timeToFullCharge: charge_state.time_to_full_charge,
    chargeRate: charge_state.charge_rate
  };
}

/**
 * Extract climate data from vehicle data
 */
function extractClimateData(vehicleData) {
  if (!vehicleData || !vehicleData.climate_state) {
    return null;
  }
  
  const { climate_state } = vehicleData;
  
  return {
    insideTemp: climate_state.inside_temp,
    outsideTemp: climate_state.outside_temp,
    isClimateOn: climate_state.is_climate_on,
    driverTempSetting: climate_state.driver_temp_setting,
    passengerTempSetting: climate_state.passenger_temp_setting,
    fanStatus: climate_state.fan_status
  };
}

export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { vehicleId } = req.query;
    
    // Validate vehicleId
    if (!vehicleId) {
      return res.status(400).json({ error: 'Vehicle ID is required' });
    }
    
    // Initialize Tesla API
    const teslaAPI = new TeslaAPI();
    
    // Check if Tesla API is authenticated
    if (!teslaAPI.isAuthenticated()) {
      return res.status(401).json({
        error: 'Not authenticated with Tesla API',
        message: 'Please authenticate with the Tesla API first'
      });
    }
    
    // Get vehicle data from Tesla API
    const vehicleData = await teslaAPI.getVehicleData(vehicleId);
    
    if (!vehicleData) {
      return res.status(404).json({
        error: 'Vehicle data not found',
        message: 'Failed to retrieve data for the specified vehicle'
      });
    }
    
    // Extract relevant telemetry data
    const telemetryData = {
      timestamp: new Date().toISOString(),
      location: extractLocationData(vehicleData),
      speed: extractVehicleSpeed(vehicleData),
      battery: extractBatteryData(vehicleData),
      climate: extractClimateData(vehicleData),
      state: vehicleData.state,
      name: vehicleData.display_name,
      model: vehicleData.vehicle_config?.car_type || 'Tesla'
    };
    
    // Return success response with telemetry data
    return res.status(200).json({
      success: true,
      vehicleId,
      telemetry: telemetryData
    });
  } catch (error) {
    console.error('Error retrieving vehicle telemetry:', error);
    return res.status(500).json({
      error: 'Failed to retrieve vehicle telemetry',
      message: error.message || 'An unknown error occurred'
    });
  }
} 