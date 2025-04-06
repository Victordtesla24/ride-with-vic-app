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
export default async function handler(req, res) {
  // Parse request parameters
  const url = new URL(req.url, `http://${req.headers.host}`);
  const vehicleId = url.searchParams.get('vehicleId') || req.query?.vehicleId;
  const stream = url.searchParams.get('stream') === 'true' || req.query?.stream === 'true';
  
  // Return error if no vehicle ID provided
  if (!vehicleId) {
    return res.status(400).json({
      success: false,
      error: 'Vehicle ID is required'
    });
  }
  
  try {
    // Initialize Tesla API client
    const teslaApi = new TeslaAPI();
    
    // Check authentication
    if (!teslaApi.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated with Tesla'
      });
    }
    
    // Handle streaming request
    if (stream && req.method === 'POST') {
      return handleStreamRequest(vehicleId, teslaApi, res);
    }
    
    // Check if we're in development/testing mode and should use mock data
    if (process.env.NODE_ENV === 'development' && !teslaApi.isAuthenticated()) {
      return res.status(200).json(generateMockTelemetryData(vehicleId));
    }
    
    // Handle one-time telemetry request
    const vehicleData = await teslaApi.getVehicleTelemetry(vehicleId);
    
    if (!vehicleData) {
      return res.status(404).json({
        success: false,
        error: 'Failed to get vehicle telemetry'
      });
    }
    
    // Extract relevant telemetry data
    const location = extractLocationData(vehicleData);
    
    return res.status(200).json({
      success: true,
      location,
      speed: extractVehicleSpeed(vehicleData),
      battery: extractBatteryData(vehicleData),
      climate: extractClimateData(vehicleData),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting vehicle telemetry:', error);
    
    return res.status(500).json({
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

/**
 * Generate mock telemetry data for development/testing
 * @param {String} vehicleId Vehicle ID
 * @returns {Object} Mock telemetry data
 */
function generateMockTelemetryData(vehicleId) {
  // Mock vehicle locations (for simulation)
  const mockVehicleLocations = {
    'v1': [
      { latitude: 40.7128, longitude: -74.0060 },
      { latitude: 40.7130, longitude: -74.0055 },
      { latitude: 40.7135, longitude: -74.0050 },
      { latitude: 40.7140, longitude: -74.0045 },
      { latitude: 40.7145, longitude: -74.0040 },
    ],
    'v2': [
      { latitude: 40.7300, longitude: -73.9950 },
      { latitude: 40.7305, longitude: -73.9955 },
      { latitude: 40.7310, longitude: -73.9960 },
      { latitude: 40.7315, longitude: -73.9965 },
      { latitude: 40.7320, longitude: -73.9970 },
    ],
    'v3': [
      { latitude: 40.7050, longitude: -74.0150 },
      { latitude: 40.7055, longitude: -74.0155 },
      { latitude: 40.7060, longitude: -74.0160 },
      { latitude: 40.7065, longitude: -74.0165 },
      { latitude: 40.7070, longitude: -74.0170 },
    ]
  };

  // Use vehicle ID to determine which mock location set to use
  const locationSet = mockVehicleLocations[vehicleId] || mockVehicleLocations['v1'];
  
  // Get a random location from the set
  const randomIndex = Math.floor(Math.random() * locationSet.length);
  const location = locationSet[randomIndex];
  
  // Generate random speed (0-80 mph)
  const speed = Math.floor(Math.random() * 80);
  
  // Generate random battery level (10-100%)
  const batteryLevel = Math.floor(Math.random() * 90) + 10;
  
  return {
    success: true,
    location: {
      ...location,
      heading: Math.floor(Math.random() * 360),
      speed: speed
    },
    speed: speed,
    battery: {
      level: batteryLevel,
      range: batteryLevel * 3, // Rough estimate of range based on battery
      charging: false,
      chargeLimit: 90
    },
    climate: {
      insideTemp: 72,
      outsideTemp: 68,
      hvacOn: Math.random() > 0.5,
      targetTemp: 70
    },
    timestamp: new Date().toISOString()
  };
} 