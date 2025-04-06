/**
 * Trip model for storing and retrieving trip data
 * Uses localStorage for client-side persistence
 */

import { v4 as uuidv4 } from 'uuid';

// Trip schema based on requirements
export const TripSchema = {
  id: String,              // Unique identifier (timestamp)
  customerId: String,      // Reference to customer
  vehicleId: String,       // Tesla vehicle ID
  status: String,          // "pending", "active", "completed", "cancelled"
  startTime: Date,         // Trip start time
  endTime: Date,           // Trip end time
  startLocation: {         // Starting location
    latitude: Number,
    longitude: Number,
    address: String,
    label: String
  },
  endLocation: {           // Ending location
    latitude: Number,
    longitude: Number,
    address: String,
    label: String
  },
  estimatedFare: Number,   // Fare estimate from Uber API
  actualFare: Number,      // Calculated actual fare
  discountPercent: Number, // Discount percentage
  discountAmount: Number,  // Calculated discount amount
  finalFare: Number,       // Final fare after discount
  telemetryData: Array,    // Array of location points during trip
  notes: String,           // Trip notes
  paymentMethod: String,   // Payment method
  receipt: {               // Receipt data
    id: String,
    generated: Boolean,
    url: String
  }
};

// Store trips in localStorage
const STORAGE_KEY = 'trips_data';

/**
 * Get all trips from storage
 * @returns {Array} Array of trip objects
 */
export function getTrips() {
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting trips from storage:', error);
    return [];
  }
}

/**
 * Get a trip by ID
 * @param {string} id Trip ID
 * @returns {Object|null} Trip object or null if not found
 */
export function getTripById(id) {
  if (!id || typeof window === 'undefined') {
    return null;
  }
  
  try {
    const trips = getTrips();
    return trips.find(trip => trip.id === id) || null;
  } catch (error) {
    console.error('Error getting trip by ID:', error);
    return null;
  }
}

/**
 * Save trips to storage
 * @param {Array} trips Array of trip objects
 * @returns {boolean} Success status
 */
export function saveTrips(trips) {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    return true;
  } catch (error) {
    console.error('Error saving trips to storage:', error);
    return false;
  }
}

/**
 * Save a trip to storage
 * @param {Object} trip Trip object
 * @returns {Object} Saved trip
 */
export function saveTrip(trip) {
  if (!trip || typeof window === 'undefined') {
    throw new Error('Invalid trip data');
  }
  
  try {
    // Ensure trip has an ID
    const tripToSave = {
      ...trip,
      id: trip.id || uuidv4()
    };
    
    const trips = getTrips();
    const index = trips.findIndex(t => t.id === tripToSave.id);
    
    if (index >= 0) {
      // Update existing trip
      trips[index] = tripToSave;
    } else {
      // Add new trip
      trips.push(tripToSave);
    }
    
    saveTrips(trips);
    return tripToSave;
  } catch (error) {
    console.error('Error saving trip:', error);
    throw error;
  }
}

/**
 * Delete a trip by ID
 * @param {string} id Trip ID
 * @returns {boolean} Success status
 */
export function deleteTrip(id) {
  if (!id || typeof window === 'undefined') {
    return false;
  }
  
  try {
    const trips = getTrips();
    const filteredTrips = trips.filter(trip => trip.id !== id);
    
    if (filteredTrips.length < trips.length) {
      saveTrips(filteredTrips);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting trip:', error);
    return false;
  }
}

/**
 * Get active trip
 * @returns {Object|null} Active trip or null if no active trip
 */
export function getActiveTrip() {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const trips = getTrips();
    return trips.find(trip => trip.status === 'active') || null;
  } catch (error) {
    console.error('Error getting active trip:', error);
    return null;
  }
}

/**
 * Create a new trip
 * @param {Object} tripData Trip data
 * @returns {Object} New trip
 */
export function createTrip(tripData = {}) {
  if (typeof window === 'undefined') {
    throw new Error('Cannot create trip in server context');
  }
  
  // Create a new trip with defaults
  const newTrip = {
    id: uuidv4(),
    customerId: tripData.customerId || 'guest',
    vehicleId: tripData.vehicleId || '',
    status: 'pending',
    startTime: null,
    endTime: null,
    startLocation: {
      latitude: null,
      longitude: null,
      address: '',
      label: ''
    },
    endLocation: {
      latitude: null,
      longitude: null,
      address: '',
      label: ''
    },
    estimatedFare: tripData.estimatedFare || 0,
    actualFare: 0,
    discountPercent: tripData.discountPercent || 0,
    discountAmount: 0,
    finalFare: 0,
    telemetryData: [],
    notes: tripData.notes || '',
    paymentMethod: tripData.paymentMethod || 'Credit Card',
    receipt: {
      id: '',
      generated: false,
      url: ''
    },
    ...tripData
  };
  
  // Save to storage
  saveTrip(newTrip);
  
  return newTrip;
}

/**
 * Start a trip
 * @param {string} tripId Trip ID
 * @param {Object} startLocation Start location
 * @returns {Object} Updated trip
 */
export function startTrip(tripId, startLocation) {
  if (!tripId || !startLocation || typeof window === 'undefined') {
    throw new Error('Invalid trip start data');
  }
  
  try {
    const trip = getTripById(tripId);
    
    if (!trip) {
      throw new Error('Trip not found');
    }
    
    // Update trip with start data
    const updatedTrip = {
      ...trip,
      status: 'active',
      startTime: new Date().toISOString(),
      startLocation: {
        ...trip.startLocation,
        ...startLocation
      },
      telemetryData: [
        {
          latitude: startLocation.latitude,
          longitude: startLocation.longitude,
          timestamp: new Date().toISOString()
        }
      ]
    };
    
    // Save updated trip
    saveTrip(updatedTrip);
    
    return updatedTrip;
  } catch (error) {
    console.error('Error starting trip:', error);
    throw error;
  }
}

/**
 * End a trip
 * @param {string} tripId Trip ID
 * @param {Object} endData End data
 * @returns {Object} Updated trip
 */
export function endTrip(tripId, endData = {}) {
  if (!tripId || typeof window === 'undefined') {
    throw new Error('Invalid trip end data');
  }
  
  try {
    const trip = getTripById(tripId);
    
    if (!trip) {
      throw new Error('Trip not found');
    }
    
    if (trip.status !== 'active') {
      throw new Error('Trip is not active');
    }
    
    // Calculate fare
    const actualFare = endData.actualFare || trip.estimatedFare || 0;
    const discountAmount = (actualFare * (trip.discountPercent / 100)) || 0;
    const finalFare = actualFare - discountAmount;
    
    // Update trip with end data
    const updatedTrip = {
      ...trip,
      status: 'completed',
      endTime: new Date().toISOString(),
      endLocation: {
        ...trip.endLocation,
        ...endData.endLocation
      },
      actualFare,
      discountAmount,
      finalFare,
      notes: endData.notes || trip.notes,
      receipt: {
        id: uuidv4(),
        generated: true,
        url: endData.receiptUrl || ''
      }
    };
    
    // Save updated trip
    saveTrip(updatedTrip);
    
    return updatedTrip;
  } catch (error) {
    console.error('Error ending trip:', error);
    throw error;
  }
}

export default {
  getTrips,
  getTripById,
  saveTrips,
  saveTrip,
  deleteTrip,
  getActiveTrip,
  createTrip,
  startTrip,
  endTrip
}; 