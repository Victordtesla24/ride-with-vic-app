/**
 * Vehicle Telemetry API
 * Handles requests for vehicle telemetry data from Tesla API
 */

import TeslaAPI from 'lib/tesla-api.js';

// Singleton map to track active telemetry streams
const activeStreams = new Map();

/**
 * Handle telemetry requests
 * @param {Object} request Request object
 * @param {Object} response Response object
 */
export default async function handleTelemetryRequest(request, response) {
  // Parse request parameters
  const url = new URL(request.url, `http://${request.headers.host}`);
  const vehicleId = url.searchParams.get('vehicleId');
  const stream = url.searchParams.get('stream') === 'true';
  
  // Return error if no vehicle ID provided
  if (!vehicleId) {
    return response.json({
      success: false,
      error: 'Vehicle ID is required'
    });
  }
  
  try {
    // Initialize Tesla API client
    const teslaApi = new TeslaAPI();
    
    // Check authentication
    if (!teslaApi.isAuthenticated()) {
      return response.json({
        success: false,
        error: 'Not authenticated with Tesla'
      });
    }
    
    // Handle streaming request
    if (stream && request.method === 'POST') {
      return handleStreamRequest(vehicleId, teslaApi, response);
    }
    
    // Handle one-time telemetry request
    const vehicleData = await teslaApi.getVehicleTelemetry(vehicleId);
    
    if (!vehicleData) {
      return response.json({
        success: false,
        error: 'Failed to get vehicle telemetry'
      });
    }
    
    // Extract relevant telemetry data
    const location = extractLocationData(vehicleData);
    
    return response.json({
      success: true,
      location,
      speed: extractVehicleSpeed(vehicleData),
      battery: extractBatteryData(vehicleData),
      climate: extractClimateData(vehicleData),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting vehicle telemetry:', error);
    
    return response.json({
      success: false,
      error: error.message || 'Failed to get vehicle telemetry'
    });
  }
}

/**
 * Handle streaming telemetry request
 * @param {String} vehicleId Vehicle ID
 * @param {TeslaAPI} teslaApi Tesla API client
 * @param {Object} response Response object
 */
function handleStreamRequest(vehicleId, teslaApi, response) {
  // Check if stream already exists
  if (activeStreams.has(vehicleId)) {
    // Stop existing stream
    const existingStream = activeStreams.get(vehicleId);
    existingStream.stop();
    activeStreams.delete(vehicleId);
  }
  
  // Start new telemetry stream
  const streamController = teslaApi.startTelemetryStream(vehicleId, (data) => {
    // This callback is invoked when new telemetry data is available
    console.log(`Telemetry update for vehicle ${vehicleId}`);
    
    // Extract data with proper error handling
    const location = extractLocationData(data);
    const speed = extractVehicleSpeed(data);
    const battery = extractBatteryData(data);
    const climate = extractClimateData(data);
    
    // Check for completeness of critical data
    if (!location) {
      console.error(`Invalid location data received for vehicle ${vehicleId}. Skipping update.`);
      return;
    }
    
    // Store only valid data, no fallbacks
    streamController.latestData = {
      location,
      speed: speed !== null ? speed : null,
      battery: battery || null,
      climate: climate || null,
      timestamp: new Date().toISOString(),
      // Mark incomplete data for error handling by client
      isComplete: !!location && speed !== null && !!battery && !!climate
    };
  });
  
  // Store in active streams map
  activeStreams.set(vehicleId, streamController);
  
  // Return success response
  return response.json({
    success: true,
    message: 'Telemetry stream started',
    vehicleId
  });
}

/**
 * Extract location data from vehicle data
 * @param {Object} vehicleData Vehicle data from Tesla API
 * @returns {Object|null} Location data or null if invalid
 */
function extractLocationData(vehicleData) {
  const driveState = vehicleData.drive_state;
  
  if (!driveState) {
    console.error('Missing drive_state in vehicle data');
    return null;
  }
  
  return {
    latitude: driveState.latitude,
    longitude: driveState.longitude,
    heading: driveState.heading || 0,
    speed: driveState.speed || 0,
    timestamp: driveState.timestamp || new Date().toISOString()
  };
}

/**
 * Extract vehicle speed from data
 * @param {Object} vehicleData Vehicle data from Tesla API
 * @returns {Number|null} Speed in mph or null if invalid
 */
function extractVehicleSpeed(vehicleData) {
  const driveState = vehicleData.drive_state;
  
  if (!driveState) {
    console.error('Missing drive_state in vehicle data');
    return null;
  }
  
  return typeof driveState.speed === 'number' ? driveState.speed : null;
}

/**
 * Extract battery data from vehicle data
 * @param {Object} vehicleData Vehicle data from Tesla API
 * @returns {Object|null} Battery data or null if invalid
 */
function extractBatteryData(vehicleData) {
  const chargeState = vehicleData.charge_state;
  
  if (!chargeState) {
    console.error('Missing charge_state in vehicle data');
    return null;
  }
  
  return {
    level: chargeState.battery_level,
    range: chargeState.battery_range,
    charging: chargeState.charging_state === 'Charging',
    chargeLimit: chargeState.charge_limit_soc
  };
}

/**
 * Extract climate data from vehicle data
 * @param {Object} vehicleData Vehicle data from Tesla API
 * @returns {Object|null} Climate data or null if invalid
 */
function extractClimateData(vehicleData) {
  const climateState = vehicleData.climate_state;
  
  if (!climateState) {
    console.error('Missing climate_state in vehicle data');
    return null;
  }
  
  return {
    insideTemp: climateState.inside_temp,
    outsideTemp: climateState.outside_temp,
    hvacOn: climateState.is_climate_on,
    targetTemp: climateState.driver_temp_setting
  };
} 