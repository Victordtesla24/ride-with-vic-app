/**
 * Customer model for storing and retrieving customer data
 * Uses localStorage for client-side persistence
 */

import { v4 as uuidv4 } from 'uuid';

// Customer schema based on requirements
export const CustomerSchema = {
  id: String,         // Unique identifier
  name: String,       // Customer name
  email: String,      // Customer email (optional)
  phone: String,      // Customer phone (optional)
  preferences: Object // Customer preferences (optional)
};

// Store customers in localStorage
const STORAGE_KEY = 'customers_data';

/**
 * Get all customers from storage
 * @returns {Array} Array of customer objects
 */
export function getCustomers() {
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting customers from storage:', error);
    return [];
  }
}

/**
 * Get a customer by ID
 * @param {string} id Customer ID
 * @returns {Object|null} Customer object or null if not found
 */
export function getCustomerById(id) {
  if (!id || typeof window === 'undefined') {
    return null;
  }
  
  try {
    const customers = getCustomers();
    return customers.find(customer => customer.id === id) || null;
  } catch (error) {
    console.error('Error getting customer by ID:', error);
    return null;
  }
}

/**
 * Save customers to storage
 * @param {Array} customers Array of customer objects
 * @returns {boolean} Success status
 */
export function saveCustomers(customers) {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    return true;
  } catch (error) {
    console.error('Error saving customers to storage:', error);
    return false;
  }
}

/**
 * Save a customer to storage
 * @param {Object} customer Customer object
 * @returns {Object} Saved customer
 */
export function saveCustomer(customer) {
  if (!customer || typeof window === 'undefined') {
    throw new Error('Invalid customer data');
  }
  
  try {
    // Ensure customer has an ID
    const customerToSave = {
      ...customer,
      id: customer.id || uuidv4()
    };
    
    const customers = getCustomers();
    const index = customers.findIndex(c => c.id === customerToSave.id);
    
    if (index >= 0) {
      // Update existing customer
      customers[index] = customerToSave;
    } else {
      // Add new customer
      customers.push(customerToSave);
    }
    
    saveCustomers(customers);
    return customerToSave;
  } catch (error) {
    console.error('Error saving customer:', error);
    throw error;
  }
}

/**
 * Delete a customer by ID
 * @param {string} id Customer ID
 * @returns {boolean} Success status
 */
export function deleteCustomer(id) {
  if (!id || typeof window === 'undefined') {
    return false;
  }
  
  try {
    const customers = getCustomers();
    const filteredCustomers = customers.filter(customer => customer.id !== id);
    
    if (filteredCustomers.length < customers.length) {
      saveCustomers(filteredCustomers);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting customer:', error);
    return false;
  }
}

/**
 * Create a new customer
 * @param {Object} customerData Customer data
 * @returns {Object} New customer
 */
export function createCustomer(customerData = {}) {
  if (typeof window === 'undefined') {
    throw new Error('Cannot create customer in server context');
  }
  
  // Create a new customer with defaults
  const newCustomer = {
    id: uuidv4(),
    name: customerData.name || 'Guest',
    email: customerData.email || '',
    phone: customerData.phone || '',
    preferences: customerData.preferences || {},
    ...customerData
  };
  
  // Save to storage
  saveCustomer(newCustomer);
  
  return newCustomer;
}

/**
 * Get or create a guest customer
 * @returns {Object} Guest customer
 */
export function getGuestCustomer() {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    // Check if a guest customer already exists
    const customers = getCustomers();
    const guestCustomer = customers.find(c => c.id === 'guest');
    
    if (guestCustomer) {
      return guestCustomer;
    }
    
    // Create a new guest customer
    return createCustomer({
      id: 'guest',
      name: 'Guest',
      email: '',
      phone: '',
      preferences: {}
    });
  } catch (error) {
    console.error('Error getting/creating guest customer:', error);
    return null;
  }
}

export default {
  getCustomers,
  getCustomerById,
  saveCustomers,
  saveCustomer,
  deleteCustomer,
  createCustomer,
  getGuestCustomer
}; 