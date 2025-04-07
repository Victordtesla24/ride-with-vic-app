/**
 * Tesla API Client Tests
 * 
 * Tests for the Tesla API client functionality to ensure proper integration
 * with the Tesla Fleet API for vehicle data access.
 */

import { TeslaAPI } from '../../../lib/tesla-api.js';

// Mock environment variables for testing
jest.mock('process', () => ({
  ...process,
  env: {
    TESLA_CLIENT_ID: 'test-client-id',
    TESLA_API_BASE_URL: 'https://owner-api.teslamotors.com',
    TESLA_AUTH_URL: 'https://auth.tesla.com/oauth2/v3',
    TESLA_REDIRECT_URI: 'http://localhost:3000/api/auth/callback',
  }
}));

// Global mock for fetch
global.fetch = jest.fn();

describe('Tesla API Client', () => {
  let teslaApi;
  
  beforeEach(() => {
    // Reset mocks
    fetch.mockClear();
    
    // Create a new instance for each test
    teslaApi = new TeslaAPI();
    
    // Set up a successful authentication state
    teslaApi.setAuthToken('test-access-token');
    teslaApi.setRefreshToken('test-refresh-token');
  });
  
  test('should initialize without auth tokens', () => {
    const newApi = new TeslaAPI();
    expect(newApi.isAuthenticated()).toBe(false);
  });
  
  test('should be authenticated when tokens are set', () => {
    expect(teslaApi.isAuthenticated()).toBe(true);
  });
  
  test('should clear auth state when logout is called', () => {
    teslaApi.logout();
    expect(teslaApi.isAuthenticated()).toBe(false);
  });
  
  test('should fetch vehicle list when authenticated', async () => {
    // Mock a successful API response for vehicle list
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        response: [
          {
            id: 12345,
            vehicle_id: 1000,
            vin: 'TEST12345678901234',
            display_name: 'Test Tesla',
            state: 'online',
            id_s: '12345'
          }
        ],
        count: 1
      })
    });
    
    const vehicles = await teslaApi.getVehicles();
    
    // Check that fetch was called with correct URL and headers
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/1/vehicles'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-access-token'
        })
      })
    );
    
    // Check the returned data
    expect(vehicles).toHaveLength(1);
    expect(vehicles[0].id).toBe(12345);
    expect(vehicles[0].vin).toBe('TEST12345678901234');
  });
  
  test('should throw error when fetching vehicles without authentication', async () => {
    teslaApi.logout();
    
    await expect(async () => {
      await teslaApi.getVehicles();
    }).rejects.toThrow('Not authenticated');
  });
  
  test('should fetch vehicle data when authenticated', async () => {
    // Mock a successful API response for vehicle data
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        response: {
          id: 12345,
          vehicle_id: 1000,
          vin: 'TEST12345678901234',
          display_name: 'Test Tesla',
          state: 'online'
        }
      })
    });
    
    const vehicleId = 12345;
    const vehicle = await teslaApi.getVehicle(vehicleId);
    
    // Check that fetch was called with correct URL and headers
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/api/1/vehicles/${vehicleId}`),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-access-token'
        })
      })
    );
    
    // Check the returned data
    expect(vehicle.id).toBe(12345);
    expect(vehicle.vin).toBe('TEST12345678901234');
  });
  
  test('should fetch vehicle telemetry data when authenticated', async () => {
    // Mock a successful API response for vehicle telemetry
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        response: {
          drive_state: {
            latitude: 37.7749,
            longitude: -122.4194,
            speed: 25,
            heading: 90
          },
          charge_state: {
            battery_level: 70,
            battery_range: 180,
            charging_state: 'Disconnected'
          },
          climate_state: {
            inside_temp: 72,
            outside_temp: 68
          }
        }
      })
    });
    
    const vehicleId = 12345;
    const telemetry = await teslaApi.getVehicleTelemetry(vehicleId);
    
    // Check that fetch was called with correct URL and headers
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/api/1/vehicles/${vehicleId}/vehicle_data`),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-access-token'
        })
      })
    );
    
    // Check the returned data has the expected structure
    expect(telemetry.drive_state).toBeDefined();
    expect(telemetry.charge_state).toBeDefined();
    expect(telemetry.climate_state).toBeDefined();
    
    // Check specific telemetry values
    expect(telemetry.drive_state.latitude).toBe(37.7749);
    expect(telemetry.drive_state.longitude).toBe(-122.4194);
    expect(telemetry.charge_state.battery_level).toBe(70);
  });
  
  test('should refresh token when expired', async () => {
    // First mock a 401 response for an expired token
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'token_expired' })
    });
    
    // Then mock a successful token refresh
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600
      })
    });
    
    // Finally mock a successful API call after token refresh
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        response: [
          {
            id: 12345,
            vehicle_id: 1000,
            vin: 'TEST12345678901234',
            display_name: 'Test Tesla',
            state: 'online',
          }
        ],
        count: 1
      })
    });
    
    // Implement token refresh functionality in our Tesla API client
    teslaApi.refreshTokenIfNeeded = jest.fn().mockResolvedValue(true);
    
    const vehicles = await teslaApi.getVehicles();
    
    // Check that the refresh token method was called
    expect(teslaApi.refreshTokenIfNeeded).toHaveBeenCalled();
    
    // Check the returned data
    expect(vehicles).toHaveLength(1);
    expect(vehicles[0].id).toBe(12345);
  });
}); 