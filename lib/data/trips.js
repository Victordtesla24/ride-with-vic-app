/**
 * Trips Data Service
 * 
 * Provides functions for managing trip history data.
 * Uses localStorage for client-side persistence.
 */

// Storage key for trips
const STORAGE_KEY = 'tripHistory';

/**
 * Get all trips
 * @param {Object} filters Optional filters (customerId, status, vehicleId)
 * @returns {Array} Array of trips
 */
export function getTrips(filters = {}) {
  // Check if running in browser environment
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    // Get trips from localStorage
    const tripsJson = localStorage.getItem(STORAGE_KEY);
    let trips = tripsJson ? JSON.parse(tripsJson) : [];
    
    // Apply filters if provided
    if (filters) {
      if (filters.customerId) {
        trips = trips.filter(trip => trip.customerId === filters.customerId);
      }
      
      if (filters.status) {
        trips = trips.filter(trip => trip.status === filters.status);
      }
      
      if (filters.vehicleId) {
        trips = trips.filter(trip => trip.vehicleId === filters.vehicleId);
      }
      
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        trips = trips.filter(trip => new Date(trip.startTime) >= startDate);
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        trips = trips.filter(trip => new Date(trip.startTime) <= endDate);
      }
    }
    
    // Sort by start time, most recent first
    return trips.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  } catch (error) {
    console.error('Error retrieving trips:', error);
    return [];
  }
}

/**
 * Get a single trip by ID
 * @param {string} tripId Trip ID to retrieve
 * @returns {Object|null} Trip object or null if not found
 */
export function getTripById(tripId) {
  if (typeof window === 'undefined' || !tripId) {
    return null;
  }
  
  try {
    const trips = getTrips();
    return trips.find(trip => trip.id === tripId) || null;
  } catch (error) {
    console.error('Error retrieving trip:', error);
    return null;
  }
}

/**
 * Create a new trip
 * @param {Object} trip Trip object to create
 * @returns {string|null} New trip ID or null if failed
 */
export function createTrip(trip) {
  if (typeof window === 'undefined' || !trip) {
    return null;
  }
  
  try {
    // Ensure trip has required fields
    if (!trip.customerId || !trip.startLocation) {
      console.error('Trip missing required fields');
      return null;
    }
    
    // Get existing trips
    const trips = getTrips();
    
    // Generate ID if not present
    if (!trip.id) {
      trip.id = `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Set default values
    const newTrip = {
      ...trip,
      status: trip.status || 'active',
      startTime: trip.startTime || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      telemetryData: trip.telemetryData || []
    };
    
    // Add to array
    trips.push(newTrip);
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    
    return newTrip.id;
  } catch (error) {
    console.error('Error creating trip:', error);
    return null;
  }
}

/**
 * Update an existing trip
 * @param {string} tripId ID of trip to update
 * @param {Object} updatedData Updated trip data
 * @returns {boolean} Success status
 */
export function updateTrip(tripId, updatedData) {
  if (typeof window === 'undefined' || !tripId || !updatedData) {
    return false;
  }
  
  try {
    // Get existing trips
    const trips = getTrips();
    
    // Find trip index
    const index = trips.findIndex(trip => trip.id === tripId);
    
    if (index === -1) {
      console.error('Trip not found');
      return false;
    }
    
    // Update trip
    trips[index] = {
      ...trips[index],
      ...updatedData,
      updatedAt: new Date().toISOString()
    };
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    
    return true;
  } catch (error) {
    console.error('Error updating trip:', error);
    return false;
  }
}

/**
 * Complete a trip
 * @param {string} tripId ID of trip to complete
 * @param {Object} completionData Data for trip completion (endLocation, fare, etc.)
 * @returns {boolean} Success status
 */
export function completeTrip(tripId, completionData) {
  if (typeof window === 'undefined' || !tripId) {
    return false;
  }
  
  try {
    // Get the trip
    const trip = getTripById(tripId);
    
    if (!trip) {
      console.error('Trip not found');
      return false;
    }
    
    if (trip.status === 'completed') {
      console.error('Trip already completed');
      return false;
    }
    
    // Update with completion data
    const completedTrip = {
      ...trip,
      ...completionData,
      status: 'completed',
      endTime: completionData.endTime || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Update the trip
    return updateTrip(tripId, completedTrip);
  } catch (error) {
    console.error('Error completing trip:', error);
    return false;
  }
}

/**
 * Add telemetry data to a trip
 * @param {string} tripId Trip ID
 * @param {Object} telemetryData Telemetry data to add
 * @returns {boolean} Success status
 */
export function addTripTelemetry(tripId, telemetryData) {
  if (typeof window === 'undefined' || !tripId || !telemetryData) {
    return false;
  }
  
  try {
    // Get the trip
    const trip = getTripById(tripId);
    
    if (!trip) {
      console.error('Trip not found');
      return false;
    }
    
    if (trip.status !== 'active') {
      console.error('Cannot add telemetry to a non-active trip');
      return false;
    }
    
    // Add timestamp if not present
    if (!telemetryData.timestamp) {
      telemetryData.timestamp = new Date().toISOString();
    }
    
    // Add to telemetry array
    const updatedTelemetry = [...(trip.telemetryData || []), telemetryData];
    
    // Update the trip
    return updateTrip(tripId, { 
      telemetryData: updatedTelemetry,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error adding trip telemetry:', error);
    return false;
  }
}

/**
 * Delete a trip
 * @param {string} tripId ID of trip to delete
 * @returns {boolean} Success status
 */
export function deleteTrip(tripId) {
  if (typeof window === 'undefined' || !tripId) {
    return false;
  }
  
  try {
    // Get existing trips
    const trips = getTrips();
    
    // Filter out the trip to delete
    const updatedTrips = trips.filter(trip => trip.id !== tripId);
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTrips));
    
    return true;
  } catch (error) {
    console.error('Error deleting trip:', error);
    return false;
  }
}

/**
 * Get trip statistics
 * @param {string} customerId Optional customer ID to filter stats
 * @returns {Object} Trip statistics
 */
export function getTripStats(customerId = null) {
  if (typeof window === 'undefined') {
    return {
      totalTrips: 0,
      totalDistance: 0,
      totalFare: 0,
      avgFare: 0,
      completedTrips: 0,
      activeTrips: 0
    };
  }
  
  try {
    // Get trips, filtered by customer ID if provided
    const trips = getTrips(customerId ? { customerId } : {});
    
    // Calculate statistics
    const completedTrips = trips.filter(trip => trip.status === 'completed');
    const activeTrips = trips.filter(trip => trip.status === 'active');
    
    const totalFare = completedTrips.reduce((sum, trip) => sum + (parseFloat(trip.fare) || 0), 0);
    const totalDistance = completedTrips.reduce((sum, trip) => sum + (parseFloat(trip.distance) || 0), 0);
    
    return {
      totalTrips: trips.length,
      totalDistance,
      totalFare,
      avgFare: completedTrips.length > 0 ? totalFare / completedTrips.length : 0,
      completedTrips: completedTrips.length,
      activeTrips: activeTrips.length
    };
  } catch (error) {
    console.error('Error calculating trip stats:', error);
    return {
      totalTrips: 0,
      totalDistance: 0,
      totalFare: 0,
      avgFare: 0,
      completedTrips: 0,
      activeTrips: 0
    };
  }
}

/**
 * Initialize with sample trips for development
 * @param {Array} initialTrips Sample trips to add
 */
export function initializeTrips(initialTrips = []) {
  if (typeof window === 'undefined') {
    return;
  }
  
  // Only initialize if no trips exist
  const existing = getTrips();
  
  if (existing.length === 0 && initialTrips.length > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTrips));
  }
} 