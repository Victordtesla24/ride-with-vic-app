/**
 * Trip List API Tests
 * 
 * Tests for the trip list API endpoint to ensure it correctly
 * retrieves trip data from the database.
 */

import { createMocks } from 'node-mocks-http';
import handler from '../../../../lib/api/trips/list-trips.js';

// Sample trip data for testing
const sampleTrips = [
  {
    id: '12345',
    customerId: 'customer1',
    vehicleId: 'vehicle1',
    status: 'completed',
    startTime: '2023-01-01T10:00:00Z',
    endTime: '2023-01-01T11:00:00Z',
    startLocation: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: '123 Main St, San Francisco'
    },
    endLocation: {
      latitude: 37.3382,
      longitude: -121.8863,
      address: '456 Park Ave, San Jose'
    },
    estimatedFare: 45.75,
    actualFare: 42.50,
    discountPercent: 10,
    discountAmount: 4.25,
    finalFare: 38.25,
    telemetryData: [
      {
        timestamp: '2023-01-01T10:15:00Z',
        location: { latitude: 37.5, longitude: -122.0 }
      }
    ]
  },
  {
    id: '67890',
    customerId: 'customer2',
    vehicleId: 'vehicle2',
    status: 'active',
    startTime: '2023-01-02T10:00:00Z',
    startLocation: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: '123 Main St, San Francisco'
    },
    estimatedFare: 50.00,
    telemetryData: []
  }
];

describe('Trip List API', () => {
  beforeEach(() => {
    // Mock localStorage for the database handling
    global.localStorage = {
      getItem: jest.fn().mockImplementation((key) => {
        if (key === 'trips') {
          return JSON.stringify(sampleTrips);
        }
        return null;
      })
    };
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
  
  test('should return all trips when no query params', async () => {
    // Create mock GET request without any query params
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
    expect(responseData.trips).toHaveLength(2);
    expect(responseData.count).toBe(2);
  });
  
  test('should filter trips by status', async () => {
    // Create mock GET request with status filter
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        status: 'completed'
      }
    });
    
    // Call the API handler
    await handler(req, res);
    
    // Check response
    expect(res._getStatusCode()).toBe(200);
    
    // Parse the response JSON
    const responseData = JSON.parse(res._getData());
    
    // Verify response structure
    expect(responseData.success).toBe(true);
    expect(responseData.trips).toHaveLength(1);
    expect(responseData.trips[0].id).toBe('12345');
    expect(responseData.count).toBe(1);
  });
  
  test('should filter trips by customer ID', async () => {
    // Create mock GET request with customerId filter
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        customerId: 'customer1'
      }
    });
    
    // Call the API handler
    await handler(req, res);
    
    // Check response
    expect(res._getStatusCode()).toBe(200);
    
    // Parse the response JSON
    const responseData = JSON.parse(res._getData());
    
    // Verify response structure
    expect(responseData.success).toBe(true);
    expect(responseData.trips).toHaveLength(1);
    expect(responseData.trips[0].id).toBe('12345');
    expect(responseData.count).toBe(1);
  });
  
  test('should filter trips by vehicle ID', async () => {
    // Create mock GET request with vehicleId filter
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        vehicleId: 'vehicle2'
      }
    });
    
    // Call the API handler
    await handler(req, res);
    
    // Check response
    expect(res._getStatusCode()).toBe(200);
    
    // Parse the response JSON
    const responseData = JSON.parse(res._getData());
    
    // Verify response structure
    expect(responseData.success).toBe(true);
    expect(responseData.trips).toHaveLength(1);
    expect(responseData.trips[0].id).toBe('67890');
    expect(responseData.count).toBe(1);
  });
  
  test('should handle empty trip list', async () => {
    // Override the localStorage mock to return empty array
    global.localStorage.getItem.mockReturnValueOnce(JSON.stringify([]));
    
    // Create mock GET request
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
    expect(responseData.trips).toHaveLength(0);
    expect(responseData.count).toBe(0);
  });
  
  test('should handle undefined trip list in localStorage', async () => {
    // Override the localStorage mock to return null
    global.localStorage.getItem.mockReturnValueOnce(null);
    
    // Create mock GET request
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
    expect(responseData.trips).toHaveLength(0);
    expect(responseData.count).toBe(0);
  });
  
  test('should handle combined filters', async () => {
    // Create mock GET request with multiple filters
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        status: 'completed',
        customerId: 'customer1'
      }
    });
    
    // Call the API handler
    await handler(req, res);
    
    // Check response
    expect(res._getStatusCode()).toBe(200);
    
    // Parse the response JSON
    const responseData = JSON.parse(res._getData());
    
    // Verify response structure
    expect(responseData.success).toBe(true);
    expect(responseData.trips).toHaveLength(1);
    expect(responseData.trips[0].id).toBe('12345');
    expect(responseData.count).toBe(1);
  });
}); 