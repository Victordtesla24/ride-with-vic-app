/**
 * Addresses Data Service
 * 
 * Provides functions for managing customer saved address data.
 * Uses localStorage for client-side persistence.
 */

// Storage key for saved addresses
const STORAGE_KEY = 'savedAddresses';

/**
 * Get all saved addresses
 * @param {string} customerId Optional - filter addresses by customer ID
 * @returns {Array} Array of saved addresses
 */
export function getSavedAddresses(customerId = null) {
  // Check if running in browser environment
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    // Get addresses from localStorage
    const addressesJson = localStorage.getItem(STORAGE_KEY);
    const addresses = addressesJson ? JSON.parse(addressesJson) : [];
    
    // Filter by customer ID if provided
    if (customerId) {
      return addresses.filter(addr => addr.customerId === customerId);
    }
    
    return addresses;
  } catch (error) {
    console.error('Error retrieving saved addresses:', error);
    return [];
  }
}

/**
 * Save a new address
 * @param {Object} address Address object to save
 * @returns {boolean} Success status
 */
export function saveAddress(address) {
  if (typeof window === 'undefined' || !address) {
    return false;
  }
  
  try {
    // Ensure address has required fields
    if (!address.name || !address.full) {
      console.error('Address missing required fields');
      return false;
    }
    
    // Get existing addresses
    const addresses = getSavedAddresses();
    
    // Add ID if not present
    if (!address.id) {
      address.id = `addr_${Date.now()}`;
    }
    
    // Add timestamp
    address.createdAt = new Date().toISOString();
    
    // Add to array
    addresses.push(address);
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
    
    return true;
  } catch (error) {
    console.error('Error saving address:', error);
    return false;
  }
}

/**
 * Update an existing address
 * @param {string} addressId ID of address to update
 * @param {Object} updatedData Updated address data
 * @returns {boolean} Success status
 */
export function updateAddress(addressId, updatedData) {
  if (typeof window === 'undefined' || !addressId || !updatedData) {
    return false;
  }
  
  try {
    // Get existing addresses
    const addresses = getSavedAddresses();
    
    // Find address index
    const index = addresses.findIndex(addr => addr.id === addressId);
    
    if (index === -1) {
      console.error('Address not found');
      return false;
    }
    
    // Update address
    addresses[index] = {
      ...addresses[index],
      ...updatedData,
      updatedAt: new Date().toISOString()
    };
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
    
    return true;
  } catch (error) {
    console.error('Error updating address:', error);
    return false;
  }
}

/**
 * Delete an address
 * @param {string} addressId ID of address to delete
 * @returns {boolean} Success status
 */
export function deleteAddress(addressId) {
  if (typeof window === 'undefined' || !addressId) {
    return false;
  }
  
  try {
    // Get existing addresses
    const addresses = getSavedAddresses();
    
    // Filter out the address to delete
    const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAddresses));
    
    return true;
  } catch (error) {
    console.error('Error deleting address:', error);
    return false;
  }
}

/**
 * Initialize with sample addresses for development
 * @param {Array} initialAddresses Sample addresses to add
 */
export function initializeAddresses(initialAddresses = []) {
  if (typeof window === 'undefined') {
    return;
  }
  
  // Only initialize if no addresses exist
  const existing = getSavedAddresses();
  
  if (existing.length === 0 && initialAddresses.length > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialAddresses));
  }
} 