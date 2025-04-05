/**
 * Trip Model
 * Defines the structure for trip data with Tesla integration
 */

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
    address: String
  },
  endLocation: {           // Ending location
    latitude: Number,
    longitude: Number,
    address: String
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

/**
 * Create a new trip
 * @param {Object} data Trip data
 * @returns {Object} New trip object
 */
export function createTrip(data = {}) {
  const trip = {
    id: data.id || Date.now().toString(),
    customerId: data.customerId || '',
    vehicleId: data.vehicleId || '',
    status: data.status || 'pending',
    startTime: data.startTime || null,
    endTime: data.endTime || null,
    startLocation: data.startLocation || {
      latitude: null,
      longitude: null,
      address: ''
    },
    endLocation: data.endLocation || {
      latitude: null,
      longitude: null,
      address: ''
    },
    estimatedFare: data.estimatedFare || 0,
    actualFare: data.actualFare || 0,
    discountPercent: data.discountPercent || 0,
    discountAmount: data.discountAmount || 0,
    finalFare: data.finalFare || 0,
    telemetryData: data.telemetryData || [],
    notes: data.notes || '',
    paymentMethod: data.paymentMethod || '',
    receipt: data.receipt || {
      id: null,
      generated: false,
      url: ''
    }
  };
  
  return trip;
}

/**
 * Save trip to localStorage
 * @param {Object} trip Trip data
 * @returns {Object} Saved trip
 */
export function saveTrip(trip) {
  if (!trip.id) {
    trip.id = Date.now().toString();
  }
  
  const trips = getTrips();
  const existingIndex = trips.findIndex(t => t.id === trip.id);
  
  if (existingIndex >= 0) {
    trips[existingIndex] = trip;
  } else {
    trips.push(trip);
  }
  
  localStorage.setItem('tesla_trips', JSON.stringify(trips));
  return trip;
}

/**
 * Get all trips from localStorage
 * @returns {Array} Array of trips
 */
export function getTrips() {
  try {
    return JSON.parse(localStorage.getItem('tesla_trips')) || [];
  } catch (error) {
    console.error('Error getting trips:', error);
    return [];
  }
}

/**
 * Get trip by ID
 * @param {String} id Trip ID
 * @returns {Object|null} Trip object or null if not found
 */
export function getTripById(id) {
  const trips = getTrips();
  return trips.find(trip => trip.id === id) || null;
}

/**
 * Get trips by customer ID
 * @param {String} customerId Customer ID
 * @returns {Array} Array of trips
 */
export function getTripsByCustomer(customerId) {
  const trips = getTrips();
  return trips.filter(trip => trip.customerId === customerId);
}

/**
 * Get trips by vehicle ID
 * @param {String} vehicleId Vehicle ID
 * @returns {Array} Array of trips
 */
export function getTripsByVehicle(vehicleId) {
  const trips = getTrips();
  return trips.filter(trip => trip.vehicleId === vehicleId);
}

/**
 * Get active trip (if any)
 * @returns {Object|null} Active trip or null if none
 */
export function getActiveTrip() {
  const trips = getTrips();
  return trips.find(trip => trip.status === 'active') || null;
}

/**
 * Update trip in localStorage
 * @param {String} id Trip ID
 * @param {Object} data Updated trip data
 * @returns {Object|null} Updated trip or null if not found
 */
export function updateTrip(id, data) {
  const trips = getTrips();
  const index = trips.findIndex(trip => trip.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedTrip = { ...trips[index], ...data };
  trips[index] = updatedTrip;
  
  localStorage.setItem('tesla_trips', JSON.stringify(trips));
  return updatedTrip;
}

/**
 * Add telemetry data point to trip
 * @param {String} id Trip ID
 * @param {Object} telemetryPoint Telemetry data point
 * @returns {Object|null} Updated trip or null if not found
 */
export function addTelemetryPoint(id, telemetryPoint) {
  const trip = getTripById(id);
  
  if (!trip) {
    return null;
  }
  
  const telemetryData = [...(trip.telemetryData || []), telemetryPoint];
  return updateTrip(id, { telemetryData });
}

/**
 * Start a trip
 * @param {String} id Trip ID
 * @param {Object} startLocation Start location
 * @returns {Object|null} Updated trip or null if not found
 */
export function startTrip(id, startLocation) {
  return updateTrip(id, {
    status: 'active',
    startTime: new Date().toISOString(),
    startLocation,
    telemetryData: [
      {
        timestamp: new Date().toISOString(),
        latitude: startLocation.latitude,
        longitude: startLocation.longitude,
        speed: 0
      }
    ]
  });
}

/**
 * End a trip
 * @param {String} id Trip ID
 * @param {Object} endLocation End location
 * @param {Number} actualFare Calculated actual fare
 * @returns {Object|null} Updated trip or null if not found
 */
export function endTrip(id, endLocation, actualFare) {
  const trip = getTripById(id);
  
  if (!trip) {
    return null;
  }
  
  // Calculate discount
  let discountAmount = 0;
  let finalFare = actualFare;
  
  if (trip.discountPercent > 0) {
    discountAmount = (actualFare * trip.discountPercent) / 100;
    finalFare = actualFare - discountAmount;
  }
  
  return updateTrip(id, {
    status: 'completed',
    endTime: new Date().toISOString(),
    endLocation,
    actualFare,
    discountAmount,
    finalFare
  });
}

/**
 * Calculate trip distance in kilometers
 * @param {Array} telemetryData Array of telemetry data points
 * @returns {Number} Trip distance in kilometers
 */
export function calculateTripDistance(telemetryData) {
  if (!telemetryData || telemetryData.length < 2) {
    return 0;
  }
  
  let distance = 0;
  
  for (let i = 1; i < telemetryData.length; i++) {
    const prev = telemetryData[i - 1];
    const current = telemetryData[i];
    
    distance += haversineDistance(
      prev.latitude, prev.longitude,
      current.latitude, current.longitude
    );
  }
  
  return distance;
}

/**
 * Calculate the Haversine distance between two points in kilometers
 * @param {Number} lat1 Latitude of point 1
 * @param {Number} lon1 Longitude of point 1
 * @param {Number} lat2 Latitude of point 2
 * @param {Number} lon2 Longitude of point 2
 * @returns {Number} Distance in kilometers
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Delete trip from localStorage
 * @param {String} id Trip ID
 * @returns {Boolean} Whether the trip was deleted
 */
export function deleteTrip(id) {
  const trips = getTrips();
  const newTrips = trips.filter(trip => trip.id !== id);
  
  localStorage.setItem('tesla_trips', JSON.stringify(newTrips));
  return newTrips.length < trips.length;
}

export default {
  createTrip,
  saveTrip,
  getTrips,
  getTripById,
  getTripsByCustomer,
  getTripsByVehicle,
  getActiveTrip,
  updateTrip,
  addTelemetryPoint,
  startTrip,
  endTrip,
  calculateTripDistance,
  deleteTrip
}; 