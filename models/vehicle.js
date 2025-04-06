/**
 * Vehicle model for storing and retrieving Tesla vehicle data
 * Uses localStorage for client-side persistence
 */

// Vehicle schema based on requirements
export const VehicleSchema = {
  id: String,           // Tesla vehicle ID
  name: String,         // Vehicle name
  model: String,        // Tesla model (model3, modely, etc)
  vin: String,          // Vehicle identification number
  display_name: String, // Display name
  state: String,        // Online state ('online' or 'offline')
  location: Object,     // Current location {latitude, longitude}
  tokens: Array         // Auth tokens
};

// Store vehicles in localStorage
const STORAGE_KEY = 'tesla_vehicles';

/**
 * Get all vehicles from storage
 * @returns {Array} Array of vehicles
 */
export function getVehicles() {
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting vehicles from storage:', error);
    return [];
  }
}

/**
 * Get a vehicle by ID
 * @param {string} id Vehicle ID
 * @returns {Object|null} Vehicle object or null if not found
 */
export function getVehicleById(id) {
  if (!id || typeof window === 'undefined') {
    return null;
  }
  
  try {
    const vehicles = getVehicles();
    return vehicles.find(vehicle => vehicle.id === id) || null;
  } catch (error) {
    console.error('Error getting vehicle by ID:', error);
    return null;
  }
}

/**
 * Save vehicles to storage
 * @param {Array} vehicles Array of vehicle objects
 * @returns {boolean} Success status
 */
export function saveVehicles(vehicles) {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
    return true;
  } catch (error) {
    console.error('Error saving vehicles to storage:', error);
    return false;
  }
}

/**
 * Add or update a vehicle
 * @param {Object} vehicle Vehicle object
 * @returns {Object} Updated vehicle
 */
export function saveVehicle(vehicle) {
  if (!vehicle || !vehicle.id || typeof window === 'undefined') {
    throw new Error('Invalid vehicle data');
  }
  
  try {
    const vehicles = getVehicles();
    const index = vehicles.findIndex(v => v.id === vehicle.id);
    
    if (index >= 0) {
      // Update existing vehicle
      vehicles[index] = { ...vehicles[index], ...vehicle };
    } else {
      // Add new vehicle
      vehicles.push(vehicle);
    }
    
    saveVehicles(vehicles);
    return vehicle;
  } catch (error) {
    console.error('Error saving vehicle:', error);
    throw error;
  }
}

/**
 * Remove a vehicle by ID
 * @param {string} id Vehicle ID
 * @returns {boolean} Success status
 */
export function removeVehicle(id) {
  if (!id || typeof window === 'undefined') {
    return false;
  }
  
  try {
    const vehicles = getVehicles();
    const filteredVehicles = vehicles.filter(vehicle => vehicle.id !== id);
    
    if (filteredVehicles.length < vehicles.length) {
      saveVehicles(filteredVehicles);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error removing vehicle:', error);
    return false;
  }
}

/**
 * Update vehicle state
 * @param {string} id Vehicle ID
 * @param {string} state New state ('online' or 'offline')
 * @returns {Object|null} Updated vehicle or null if not found
 */
export function updateVehicleState(id, state) {
  if (!id || typeof window === 'undefined') {
    return null;
  }
  
  try {
    const vehicle = getVehicleById(id);
    
    if (!vehicle) {
      return null;
    }
    
    const updatedVehicle = { ...vehicle, state };
    saveVehicle(updatedVehicle);
    
    return updatedVehicle;
  } catch (error) {
    console.error('Error updating vehicle state:', error);
    return null;
  }
}

/**
 * Update vehicle location
 * @param {string} id Vehicle ID
 * @param {Object} location New location {latitude, longitude}
 * @returns {Object|null} Updated vehicle or null if not found
 */
export function updateVehicleLocation(id, location) {
  if (!id || !location || typeof window === 'undefined') {
    return null;
  }
  
  try {
    const vehicle = getVehicleById(id);
    
    if (!vehicle) {
      return null;
    }
    
    const updatedVehicle = { 
      ...vehicle, 
      location: { 
        ...vehicle.location,
        ...location
      }
    };
    
    saveVehicle(updatedVehicle);
    
    return updatedVehicle;
  } catch (error) {
    console.error('Error updating vehicle location:', error);
    return null;
  }
}

export default {
  getVehicles,
  getVehicleById,
  saveVehicles,
  saveVehicle,
  removeVehicle,
  updateVehicleState,
  updateVehicleLocation
}; 