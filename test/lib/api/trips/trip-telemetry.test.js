/**
 * Trip Telemetry API Tests
 * 
 * Tests for the trip telemetry API to ensure it correctly processes 
 * telemetry data for trip tracking.
 */

import { createMocks } from 'node-mocks-http';
import handler from '../../../../lib/api/trips/trip-telemetry.js';

describe('Trip Telemetry API', () => {
  test('should return 405 for non-POST methods', async () => {
    // Create mock GET request and response objects
    const { req, res } = createMocks({
      method: 'GET',
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
  
  test('should return 400 for missing trip ID', async () => {
    // Create mock POST request without trip ID
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        telemetry: {
          location: { latitude: 37.7749, longitude: -122.4194 },
          speed: 25,
          battery: { level: 75 }
        }
      }
    });
    
    // Call the API handler
    await handler(req, res);
    
    // Check response
    expect(res._getStatusCode()).toBe(400);
    
    // Parse the response JSON
    const responseData = JSON.parse(res._getData());
    
    // Verify response structure
    expect(responseData.success).toBe(false);
    expect(responseData.error).toBe('Trip ID is required');
  });
  
  test('should return 400 for missing telemetry data', async () => {
    // Create mock POST request without telemetry data
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        tripId: '12345'
      }
    });
    
    // Call the API handler
    await handler(req, res);
    
    // Check response
    expect(res._getStatusCode()).toBe(400);
    
    // Parse the response JSON
    const responseData = JSON.parse(res._getData());
    
    // Verify response structure
    expect(responseData.success).toBe(false);
    expect(responseData.error).toBe('Telemetry data is required');
  });
  
  test('should update trip with telemetry data', async () => {
    // Test telemetry data
    const testTelemetry = {
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
        heading: 90
      },
      speed: 25,
      battery: {
        level: 75,
        range: 180
      },
      climate: {
        insideTemp: 70,
        outsideTemp: 65
      },
      timestamp: Date.now()
    };
    
    // Create mock request
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        tripId: '12345',
        telemetry: testTelemetry
      }
    });
    
    // Mock localStorage for the database handling
    global.localStorage = {
      getItem: jest.fn().mockImplementation((key) => {
        if (key === 'trips') {
          return JSON.stringify([
            {
              id: '12345',
              status: 'active',
              startTime: new Date().toISOString(),
              telemetryData: []
            }
          ]);
        }
        return null;
      }),
      setItem: jest.fn()
    };
    
    // Call the API handler
    await handler(req, res);
    
    // Check response
    expect(res._getStatusCode()).toBe(200);
    
    // Parse the response JSON
    const responseData = JSON.parse(res._getData());
    
    // Verify response structure
    expect(responseData.success).toBe(true);
    expect(responseData.tripId).toBe('12345');
    expect(responseData.telemetryPointsCount).toBe(1);
    
    // Verify localStorage update was called
    expect(global.localStorage.setItem).toHaveBeenCalledWith('trips', expect.any(String));
    
    // Verify the updated trips data
    const updatedTripsData = JSON.parse(global.localStorage.setItem.mock.calls[0][1]);
    const updatedTrip = updatedTripsData.find(t => t.id === '12345');
    
    expect(updatedTrip).toBeDefined();
    expect(updatedTrip.telemetryData).toHaveLength(1);
    expect(updatedTrip.telemetryData[0]).toEqual(testTelemetry);
  });
  
  test('should return 404 for non-existent trip', async () => {
    // Test telemetry data
    const testTelemetry = {
      location: {
        latitude: 37.7749,
        longitude: -122.4194
      },
      speed: 25,
      timestamp: Date.now()
    };
    
    // Create mock request with a trip ID that doesn't exist
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        tripId: 'non-existent-id',
        telemetry: testTelemetry
      }
    });
    
    // Mock localStorage for the database handling
    global.localStorage = {
      getItem: jest.fn().mockImplementation((key) => {
        if (key === 'trips') {
          return JSON.stringify([
            {
              id: '12345',
              status: 'active',
              startTime: new Date().toISOString(),
              telemetryData: []
            }
          ]);
        }
        return null;
      }),
      setItem: jest.fn()
    };
    
    // Call the API handler
    await handler(req, res);
    
    // Check response
    expect(res._getStatusCode()).toBe(404);
    
    // Parse the response JSON
    const responseData = JSON.parse(res._getData());
    
    // Verify response structure
    expect(responseData.success).toBe(false);
    expect(responseData.error).toBe('Trip not found');
  });
  
  test('should return 400 for inactive trip', async () => {
    // Test telemetry data
    const testTelemetry = {
      location: {
        latitude: 37.7749,
        longitude: -122.4194
      },
      speed: 25,
      timestamp: Date.now()
    };
    
    // Create mock request with an inactive trip ID
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        tripId: 'completed-trip-id',
        telemetry: testTelemetry
      }
    });
    
    // Mock localStorage for the database handling
    global.localStorage = {
      getItem: jest.fn().mockImplementation((key) => {
        if (key === 'trips') {
          return JSON.stringify([
            {
              id: 'completed-trip-id',
              status: 'completed',
              startTime: new Date().toISOString(),
              endTime: new Date().toISOString(),
              telemetryData: []
            }
          ]);
        }
        return null;
      }),
      setItem: jest.fn()
    };
    
    // Call the API handler
    await handler(req, res);
    
    // Check response
    expect(res._getStatusCode()).toBe(400);
    
    // Parse the response JSON
    const responseData = JSON.parse(res._getData());
    
    // Verify response structure
    expect(responseData.success).toBe(false);
    expect(responseData.error).toBe('Trip is not active');
  });
}); 