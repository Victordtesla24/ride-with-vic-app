/**
 * Customer Model
 * Defines the structure for customer data
 */

export const CustomerSchema = {
  id: String,         // Unique identifier
  name: String,       // Customer name
  email: String,      // Customer email (optional)
  phone: String,      // Customer phone (optional)
  preferences: Object // Customer preferences (optional)
};

/**
 * Create a new customer
 * @param {Object} data Customer data
 * @returns {Object} New customer object
 */
export function createCustomer(data = {}) {
  const customer = {
    id: data.id || Date.now().toString(),
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    preferences: data.preferences || {}
  };
  
  return customer;
}

/**
 * Save customer to localStorage
 * @param {Object} customer Customer data
 * @returns {Object} Saved customer
 */
export function saveCustomer(customer) {
  if (!customer.id) {
    customer.id = Date.now().toString();
  }
  
  const customers = getCustomers();
  customers.push(customer);
  
  localStorage.setItem('customers', JSON.stringify(customers));
  return customer;
}

/**
 * Get all customers from localStorage
 * @returns {Array} Array of customers
 */
export function getCustomers() {
  try {
    return JSON.parse(localStorage.getItem('customers')) || [];
  } catch (error) {
    console.error('Error getting customers:', error);
    return [];
  }
}

/**
 * Get customer by ID
 * @param {String} id Customer ID
 * @returns {Object|null} Customer object or null if not found
 */
export function getCustomerById(id) {
  const customers = getCustomers();
  return customers.find(customer => customer.id === id) || null;
}

/**
 * Update customer in localStorage
 * @param {String} id Customer ID
 * @param {Object} data Updated customer data
 * @returns {Object|null} Updated customer or null if not found
 */
export function updateCustomer(id, data) {
  const customers = getCustomers();
  const index = customers.findIndex(customer => customer.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedCustomer = { ...customers[index], ...data };
  customers[index] = updatedCustomer;
  
  localStorage.setItem('customers', JSON.stringify(customers));
  return updatedCustomer;
}

/**
 * Delete customer from localStorage
 * @param {String} id Customer ID
 * @returns {Boolean} Whether the customer was deleted
 */
export function deleteCustomer(id) {
  const customers = getCustomers();
  const newCustomers = customers.filter(customer => customer.id !== id);
  
  localStorage.setItem('customers', JSON.stringify(newCustomers));
  return newCustomers.length < customers.length;
}

export default {
  createCustomer,
  saveCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
}; 