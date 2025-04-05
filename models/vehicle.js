/**
 * Vehicle Model
 * Defines the structure for Tesla vehicle data
 */

export const VehicleSchema = {
  id: String,           // Tesla vehicle ID
  name: String,         // Vehicle name
  model: String,        // Tesla model
  vin: String,          // Vehicle identification number
  display_name: String, // Display name
  state: String,        // Online state
  tokens: Array         // Auth tokens
};

/**
 * Create a new vehicle
 * @param {Object} data Vehicle data
 * @returns {Object} New vehicle object
 */
export function createVehicle(data = {}) {
  const vehicle = {
    id: data.id || '',
    name: data.name || '',
    model: data.model || '',
    vin: data.vin || '',
    display_name: data.display_name || data.name || 'Tesla',
    state: data.state || 'offline',
    tokens: data.tokens || []
  };
  
  return vehicle;
}

/**
 * Save vehicles to localStorage
 * @param {Array} vehicles Array of vehicle objects
 * @returns {Array} Saved vehicles
 */
export function saveVehicles(vehicles = []) {
  localStorage.setItem('vehicles', JSON.stringify(vehicles));
  return vehicles;
}

/**
 * Save vehicle to localStorage
 * @param {Object} vehicle Vehicle data
 * @returns {Object} Saved vehicle
 */
export function saveVehicle(vehicle) {
  if (!vehicle.id) {
    throw new Error('Vehicle ID is required');
  }
  
  const vehicles = getVehicles();
  const index = vehicles.findIndex(v => v.id === vehicle.id);
  
  if (index === -1) {
    vehicles.push(vehicle);
  } else {
    vehicles[index] = { ...vehicles[index], ...vehicle };
  }
  
  localStorage.setItem('vehicles', JSON.stringify(vehicles));
  return vehicle;
}

/**
 * Get all vehicles from localStorage
 * @returns {Array} Array of vehicles
 */
export function getVehicles() {
  try {
    return JSON.parse(localStorage.getItem('vehicles')) || [];
  } catch (error) {
    console.error('Error getting vehicles:', error);
    return [];
  }
}

/**
 * Get vehicle by ID
 * @param {String} id Vehicle ID
 * @returns {Object|null} Vehicle object or null if not found
 */
export function getVehicleById(id) {
  const vehicles = getVehicles();
  return vehicles.find(vehicle => vehicle.id === id) || null;
}

/**
 * Update vehicle in localStorage
 * @param {String} id Vehicle ID
 * @param {Object} data Updated vehicle data
 * @returns {Object|null} Updated vehicle or null if not found
 */
export function updateVehicle(id, data) {
  const vehicles = getVehicles();
  const index = vehicles.findIndex(vehicle => vehicle.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedVehicle = { ...vehicles[index], ...data };
  vehicles[index] = updatedVehicle;
  
  localStorage.setItem('vehicles', JSON.stringify(vehicles));
  return updatedVehicle;
}

/**
 * Update vehicle state in localStorage
 * @param {String} id Vehicle ID
 * @param {String} state Vehicle state (online/offline)
 * @returns {Object|null} Updated vehicle or null if not found
 */
export function updateVehicleState(id, state) {
  return updateVehicle(id, { state });
}

/**
 * Delete vehicle from localStorage
 * @param {String} id Vehicle ID
 * @returns {Boolean} Whether the vehicle was deleted
 */
export function deleteVehicle(id) {
  const vehicles = getVehicles();
  const newVehicles = vehicles.filter(vehicle => vehicle.id !== id);
  
  localStorage.setItem('vehicles', JSON.stringify(newVehicles));
  return newVehicles.length < vehicles.length;
}

export default {
  createVehicle,
  saveVehicle,
  saveVehicles,
  getVehicles,
  getVehicleById,
  updateVehicle,
  updateVehicleState,
  deleteVehicle
}; 