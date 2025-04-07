/**
 * Destinations Data Service
 * 
 * Provides functions for managing popular destinations data.
 * Uses localStorage for client-side persistence.
 */

// Storage key for popular destinations
const STORAGE_KEY = 'popularDestinations';

/**
 * Get all popular destinations
 * @param {string} city Optional - filter destinations by city
 * @returns {Array} Array of popular destinations
 */
export function getPopularDestinations(city = null) {
  // Check if running in browser environment
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    // Get destinations from localStorage
    const destinationsJson = localStorage.getItem(STORAGE_KEY);
    const destinations = destinationsJson ? JSON.parse(destinationsJson) : [];
    
    // Filter by city if provided
    if (city) {
      return destinations.filter(dest => 
        dest.address.toLowerCase().includes(city.toLowerCase())
      );
    }
    
    return destinations;
  } catch (error) {
    console.error('Error retrieving popular destinations:', error);
    return [];
  }
}

/**
 * Add a new popular destination
 * @param {Object} destination Destination object to add
 * @returns {boolean} Success status
 */
export function addDestination(destination) {
  if (typeof window === 'undefined' || !destination) {
    return false;
  }
  
  try {
    // Ensure destination has required fields
    if (!destination.name || !destination.address) {
      console.error('Destination missing required fields');
      return false;
    }
    
    // Get existing destinations
    const destinations = getPopularDestinations();
    
    // Add ID if not present
    if (!destination.id) {
      destination.id = `dest_${Date.now()}`;
    }
    
    // Add timestamp
    destination.createdAt = new Date().toISOString();
    
    // Add popularity score if not present
    if (!destination.popularity) {
      destination.popularity = 0;
    }
    
    // Add to array
    destinations.push(destination);
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(destinations));
    
    return true;
  } catch (error) {
    console.error('Error adding destination:', error);
    return false;
  }
}

/**
 * Update an existing destination
 * @param {string} destinationId ID of destination to update
 * @param {Object} updatedData Updated destination data
 * @returns {boolean} Success status
 */
export function updateDestination(destinationId, updatedData) {
  if (typeof window === 'undefined' || !destinationId || !updatedData) {
    return false;
  }
  
  try {
    // Get existing destinations
    const destinations = getPopularDestinations();
    
    // Find destination index
    const index = destinations.findIndex(dest => dest.id === destinationId);
    
    if (index === -1) {
      console.error('Destination not found');
      return false;
    }
    
    // Update destination
    destinations[index] = {
      ...destinations[index],
      ...updatedData,
      updatedAt: new Date().toISOString()
    };
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(destinations));
    
    return true;
  } catch (error) {
    console.error('Error updating destination:', error);
    return false;
  }
}

/**
 * Increment popularity score for a destination
 * @param {string} destinationId ID of destination
 * @returns {boolean} Success status
 */
export function incrementPopularity(destinationId) {
  if (typeof window === 'undefined' || !destinationId) {
    return false;
  }
  
  try {
    // Get existing destinations
    const destinations = getPopularDestinations();
    
    // Find destination
    const destination = destinations.find(dest => dest.id === destinationId);
    
    if (!destination) {
      console.error('Destination not found');
      return false;
    }
    
    // Increment popularity
    destination.popularity = (destination.popularity || 0) + 1;
    destination.updatedAt = new Date().toISOString();
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(destinations));
    
    return true;
  } catch (error) {
    console.error('Error incrementing popularity:', error);
    return false;
  }
}

/**
 * Delete a destination
 * @param {string} destinationId ID of destination to delete
 * @returns {boolean} Success status
 */
export function deleteDestination(destinationId) {
  if (typeof window === 'undefined' || !destinationId) {
    return false;
  }
  
  try {
    // Get existing destinations
    const destinations = getPopularDestinations();
    
    // Filter out the destination to delete
    const updatedDestinations = destinations.filter(dest => dest.id !== destinationId);
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDestinations));
    
    return true;
  } catch (error) {
    console.error('Error deleting destination:', error);
    return false;
  }
}

/**
 * Initialize with sample destinations for development
 * @param {Array} initialDestinations Sample destinations to add
 */
export function initializeDestinations(initialDestinations = []) {
  if (typeof window === 'undefined') {
    return;
  }
  
  // Only initialize if no destinations exist
  const existing = getPopularDestinations();
  
  if (existing.length === 0 && initialDestinations.length > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDestinations));
  }
} 