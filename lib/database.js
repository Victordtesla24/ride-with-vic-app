/**
 * Database Operations
 * Enhanced localStorage utilities for data persistence
 */

/**
 * A simple localStorage-based database with expiration and encryption support
 */
class LocalDatabase {
  constructor() {
    this.prefix = 'ride_with_vic_';
    this.initializeStorage();
    this.encryptionKey = null;
  }

  /**
   * Initialize the storage system
   */
  initializeStorage() {
    // Create storage namespaces if they don't exist
    if (!this.get('customers')) {
      this.set('customers', []);
    }
    
    if (!this.get('trips')) {
      this.set('trips', []);
    }
    
    if (!this.get('vehicles')) {
      this.set('vehicles', []);
    }
  }

  /**
   * Set encryption key for sensitive data
   * @param {string} key The encryption key to use
   */
  setEncryptionKey(key) {
    this.encryptionKey = key;
  }

  /**
   * Store data in localStorage with optional expiration
   * @param {string} key Key to store under
   * @param {*} value Value to store
   * @param {number} expiration Expiration time in milliseconds (optional)
   */
  set(key, value, expiration = null) {
    const storageKey = this.prefix + key;
    const data = {
      value,
      timestamp: new Date().getTime(),
      expiration
    };
    
    let serializedData = JSON.stringify(data);
    
    // Encrypt if encryption key is set and data is sensitive
    if (this.encryptionKey && this.isSensitiveKey(key)) {
      serializedData = this.encrypt(serializedData);
    }
    
    localStorage.setItem(storageKey, serializedData);
  }

  /**
   * Get data from localStorage
   * @param {string} key Key to retrieve
   * @returns {*} Retrieved value or null if expired or not found
   */
  get(key) {
    const storageKey = this.prefix + key;
    const serializedData = localStorage.getItem(storageKey);
    
    if (!serializedData) {
      return null;
    }
    
    let data;
    
    // Decrypt if encryption key is set and data is sensitive
    if (this.encryptionKey && this.isSensitiveKey(key)) {
      try {
        data = JSON.parse(this.decrypt(serializedData));
      } catch (error) {
        console.error('Failed to decrypt data:', error);
        return null;
      }
    } else {
      try {
        data = JSON.parse(serializedData);
      } catch (error) {
        console.error('Failed to parse data:', error);
        return null;
      }
    }
    
    // Check if data is expired
    if (data.expiration && new Date().getTime() > data.timestamp + data.expiration) {
      this.remove(key);
      return null;
    }
    
    return data.value;
  }

  /**
   * Remove data from localStorage
   * @param {string} key Key to remove
   */
  remove(key) {
    const storageKey = this.prefix + key;
    localStorage.removeItem(storageKey);
  }

  /**
   * Check if data exists in localStorage
   * @param {string} key Key to check
   * @returns {boolean} True if key exists and is not expired
   */
  exists(key) {
    return this.get(key) !== null;
  }

  /**
   * Find items in a collection by criteria
   * @param {string} collectionName Collection name
   * @param {function} filterFn Filter function
   * @returns {Array} Filtered items
   */
  find(collectionName, filterFn) {
    const collection = this.get(collectionName) || [];
    return collection.filter(filterFn);
  }

  /**
   * Find a single item by id
   * @param {string} collectionName Collection name
   * @param {string} id Item ID
   * @returns {Object|null} Found item or null
   */
  findById(collectionName, id) {
    const collection = this.get(collectionName) || [];
    return collection.find(item => item.id === id) || null;
  }

  /**
   * Insert an item into a collection
   * @param {string} collectionName Collection name
   * @param {Object} item Item to insert
   * @returns {Object} Inserted item
   */
  insert(collectionName, item) {
    const collection = this.get(collectionName) || [];
    collection.push(item);
    this.set(collectionName, collection);
    return item;
  }

  /**
   * Update an item in a collection
   * @param {string} collectionName Collection name
   * @param {string} id Item ID
   * @param {Object} updates Updates to apply
   * @returns {Object|null} Updated item or null
   */
  update(collectionName, id, updates) {
    const collection = this.get(collectionName) || [];
    const index = collection.findIndex(item => item.id === id);
    
    if (index === -1) {
      return null;
    }
    
    const updatedItem = { ...collection[index], ...updates };
    collection[index] = updatedItem;
    this.set(collectionName, collection);
    
    return updatedItem;
  }

  /**
   * Delete an item from a collection
   * @param {string} collectionName Collection name
   * @param {string} id Item ID
   * @returns {boolean} True if item was deleted
   */
  delete(collectionName, id) {
    const collection = this.get(collectionName) || [];
    const index = collection.findIndex(item => item.id === id);
    
    if (index === -1) {
      return false;
    }
    
    collection.splice(index, 1);
    this.set(collectionName, collection);
    
    return true;
  }

  /**
   * Determine if a key contains sensitive data that should be encrypted
   * @param {string} key The key to check
   * @returns {boolean} True if the key should be encrypted
   */
  isSensitiveKey(key) {
    // List of keys that should be encrypted
    const sensitiveKeys = [
      'tokens',
      'auth',
      'credentials',
      'payment'
    ];
    
    // Check if key contains any sensitive keyword
    return sensitiveKeys.some(sensitiveKey => key.includes(sensitiveKey));
  }

  /**
   * Simple encryption function (this is a basic implementation)
   * In a production environment, use a proper encryption library
   * @param {string} data Data to encrypt
   * @returns {string} Encrypted data
   */
  encrypt(data) {
    // In a real implementation, use a proper encryption library
    // This is just a placeholder for demonstration
    if (!this.encryptionKey) return data;
    
    return btoa(data);
  }

  /**
   * Simple decryption function (this is a basic implementation)
   * In a production environment, use a proper decryption library
   * @param {string} encryptedData Data to decrypt
   * @returns {string} Decrypted data
   */
  decrypt(encryptedData) {
    // In a real implementation, use a proper decryption library
    // This is just a placeholder for demonstration
    if (!this.encryptionKey) return encryptedData;
    
    return atob(encryptedData);
  }

  /**
   * Clear expired items from storage
   */
  clearExpired() {
    // Get all keys with our prefix
    const keys = Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix));
    
    keys.forEach(key => {
      const shortKey = key.substring(this.prefix.length);
      this.get(shortKey); // This will check expiration and remove if expired
    });
  }

  /**
   * Clear all data in the database
   */
  clear() {
    const keys = Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix));
    
    keys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    this.initializeStorage();
  }
}

// Export a singleton instance
const db = new LocalDatabase();
export default db; 