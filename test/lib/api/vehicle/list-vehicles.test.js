/**
 * Vehicle List API Tests
 * 
 * Tests for the vehicle list API endpoint to ensure it correctly
 * retrieves vehicle data from the Tesla API.
 */

import { createMocks } from 'node-mocks-http';
import handler from '../../../../lib/api/vehicle/list-vehicles.js';
import { TeslaAPI } from '../../../../lib/tesla-api.js';

// Mock the Tesla API
jest.mock('../../../../lib/tesla-api.js', () => {
  const mockTeslaAPI = {
    isAuthenticated: jest.fn(),
    getVehicles: jest.fn(),
    refreshTokenIfNeeded: jest.fn()
  };
  
  return {
    TeslaAPI: jest.fn(() => mockTeslaAPI)
  };
});

// Mock sample data
const mockVehicles = [
  {
    id: 12345,
    vehicle_id: 1000,
    vin: 'TEST12345678901234',
    display_name: 'Test Model 3',
    state: 'online',
    id_s: '12345'
  },
  {
    id: 67890,
    vehicle_id: 2000,
    vin: 'TEST67890123456789',
    display_name: 'Test Model Y',
    state: 'asleep',
    id_s: '67890'
  }
];

describe('Vehicle List API', () => {
  let teslaApiMock;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Get the mocked instance
    teslaApiMock = new TeslaAPI();
    
    // Set default authenticated status
    teslaApiMock.isAuthenticated.mockReturnValue(true);
    
    // Mock successful vehicles response
    teslaApiMock.getVehicles.mockResolvedValue(mockVehicles);
    
    // Mock successful token refresh
    teslaApiMock.refreshTokenIfNeeded.mockResolvedValue(true);
  });
  
  test('should return vehicles when authenticated', async () => {
    // Create mock request and response objects
    const { req, res } = createMocks({
      method: 'GET',
    });
    
    // Call the API handler
    await handler(req, res);
    
    // Check the API was called properly
    expect(teslaApiMock.isAuthenticated).toHaveBeenCalled();
    expect(teslaApiMock.getVehicles).toHaveBeenCalled();
    
    // Check response
    expect(res._getStatusCode()).toBe(200);
    
    // Parse the response JSON
    const responseData = JSON.parse(res._getData());
    
    // Verify response structure
    expect(responseData.success).toBe(true);
    expect(responseData.vehicles).toEqual(mockVehicles);
    expect(responseData.count).toBe(2);
  });
  
  test('should return 401 when not authenticated', async () => {
    // Mock unauthenticated state
    teslaApiMock.isAuthenticated.mockReturnValue(false);
    
    // Create mock request and response objects
    const { req, res } = createMocks({
      method: 'GET',
    });
    
    // Call the API handler
    await handler(req, res);
    
    // Check the authentication check was called
    expect(teslaApiMock.isAuthenticated).toHaveBeenCalled();
    
    // The getVehicles should not be called when not authenticated
    expect(teslaApiMock.getVehicles).not.toHaveBeenCalled();
    
    // Check response
    expect(res._getStatusCode()).toBe(401);
    
    // Parse the response JSON
    const responseData = JSON.parse(res._getData());
    
    // Verify response structure
    expect(responseData.success).toBe(false);
    expect(responseData.error).toBe('Not authenticated with the Tesla API');
  });
  
  test('should return 500 when API call fails', async () => {
    // Mock a failed API call
    teslaApiMock.getVehicles.mockRejectedValue(new Error('API error'));
    
    // Create mock request and response objects
    const { req, res } = createMocks({
      method: 'GET',
    });
    
    // Call the API handler
    await handler(req, res);
    
    // Check the authentication check was called
    expect(teslaApiMock.isAuthenticated).toHaveBeenCalled();
    expect(teslaApiMock.getVehicles).toHaveBeenCalled();
    
    // Check response
    expect(res._getStatusCode()).toBe(500);
    
    // Parse the response JSON
    const responseData = JSON.parse(res._getData());
    
    // Verify response structure
    expect(responseData.success).toBe(false);
    expect(responseData.error).toBe('Failed to retrieve vehicles');
  });
  
  test('should return 405 for non-GET methods', async () => {
    // Create mock POST request and response objects
    const { req, res } = createMocks({
      method: 'POST',
    });
    
    // Call the API handler
    await handler(req, res);
    
    // Check response
    expect(res._getStatusCode()).toBe(405);
    
    // Parse the response JSON
    const responseData = JSON.parse(res._getData());
    
    // Verify response structure
    expect(responseData.success).toBe(false);
    expect(responseData.error).toBe('Method not allowed');
  });
  
  test('should attempt token refresh before getting vehicles', async () => {
    // Create mock request and response objects
    const { req, res } = createMocks({
      method: 'GET',
    });
    
    // Call the API handler
    await handler(req, res);
    
    // Check that token refresh was attempted
    expect(teslaApiMock.refreshTokenIfNeeded).toHaveBeenCalled();
    expect(teslaApiMock.getVehicles).toHaveBeenCalled();
    
    // Check response
    expect(res._getStatusCode()).toBe(200);
  });
  
  test('should return empty vehicle list if no vehicles found', async () => {
    // Mock empty vehicles list
    teslaApiMock.getVehicles.mockResolvedValue([]);
    
    // Create mock request and response objects
    const { req, res } = createMocks({
      method: 'GET',
    });
    
    // Call the API handler
    await handler(req, res);
    
    // Check response
    expect(res._getStatusCode()).toBe(200);
    
    // Parse the response JSON
    const responseData = JSON.parse(res._getData());
    
    // Verify response structure
    expect(responseData.success).toBe(true);
    expect(responseData.vehicles).toEqual([]);
    expect(responseData.count).toBe(0);
  });
}); 