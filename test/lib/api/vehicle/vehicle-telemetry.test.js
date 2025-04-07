/**
 * Vehicle Telemetry API Tests
 * 
 * Tests for the vehicle telemetry API endpoint to ensure it correctly
 * retrieves and processes telemetry data from the Tesla API.
 */

import { extractLocationData, extractVehicleSpeed, extractBatteryData, extractClimateData } from '../../../../lib/api/vehicle/vehicle-telemetry.js';

// Mock telemetry data from a real API response
const mockTelemetryData = {
  drive_state: {
    latitude: 37.7749,
    longitude: -122.4194,
    heading: 90,
    speed: 25,
    power: 10,
    timestamp: 1610000000000
  },
  charge_state: {
    battery_level: 75,
    battery_range: 180.5,
    charging_state: 'Disconnected',
    charge_port_door_open: false,
    charge_miles_added_rated: 0,
    minutes_to_full_charge: 0,
    time_to_full_charge: 0.0
  },
  climate_state: {
    inside_temp: 70.5,
    outside_temp: 65.5,
    driver_temp_setting: 72,
    passenger_temp_setting: 72,
    is_climate_on: true,
    is_auto_conditioning_on: true,
    seat_heater_left: 0,
    seat_heater_right: 0
  },
  vehicle_state: {
    api_version: 30,
    locked: true,
    odometer: 12345.6,
    vehicle_name: 'Test Model 3'
  }
};

describe('Vehicle Telemetry API', () => {
  test('extractLocationData should return correctly formatted location data', () => {
    const locationData = extractLocationData(mockTelemetryData);
    
    expect(locationData).toEqual({
      latitude: 37.7749,
      longitude: -122.4194,
      heading: 90,
      timestamp: 1610000000000
    });
  });
  
  test('extractVehicleSpeed should return correctly formatted speed data', () => {
    const speedData = extractVehicleSpeed(mockTelemetryData);
    
    expect(speedData).toEqual({
      speed: 25,
      power: 10
    });
  });
  
  test('extractBatteryData should return correctly formatted battery data', () => {
    const batteryData = extractBatteryData(mockTelemetryData);
    
    expect(batteryData).toEqual({
      level: 75,
      range: 180.5,
      charging: false,
      chargePortOpen: false
    });
  });
  
  test('extractClimateData should return correctly formatted climate data', () => {
    const climateData = extractClimateData(mockTelemetryData);
    
    expect(climateData).toEqual({
      insideTemp: 70.5,
      outsideTemp: 65.5,
      driverSetting: 72,
      passengerSetting: 72,
      isClimateOn: true
    });
  });
  
  test('extractLocationData should handle missing drive state', () => {
    const incompleteData = { ...mockTelemetryData };
    delete incompleteData.drive_state;
    
    const locationData = extractLocationData(incompleteData);
    
    expect(locationData).toEqual({
      latitude: null,
      longitude: null,
      heading: null,
      timestamp: null
    });
  });
  
  test('extractBatteryData should handle missing charge state', () => {
    const incompleteData = { ...mockTelemetryData };
    delete incompleteData.charge_state;
    
    const batteryData = extractBatteryData(incompleteData);
    
    expect(batteryData).toEqual({
      level: null,
      range: null,
      charging: false,
      chargePortOpen: false
    });
  });
  
  test('extractClimateData should handle missing climate state', () => {
    const incompleteData = { ...mockTelemetryData };
    delete incompleteData.climate_state;
    
    const climateData = extractClimateData(incompleteData);
    
    expect(climateData).toEqual({
      insideTemp: null,
      outsideTemp: null,
      driverSetting: null,
      passengerSetting: null,
      isClimateOn: false
    });
  });
  
  test('extractVehicleSpeed should handle missing drive state', () => {
    const incompleteData = { ...mockTelemetryData };
    delete incompleteData.drive_state;
    
    const speedData = extractVehicleSpeed(incompleteData);
    
    expect(speedData).toEqual({
      speed: null,
      power: null
    });
  });
}); 