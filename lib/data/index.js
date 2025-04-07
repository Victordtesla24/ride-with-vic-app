/**
 * Data Services Index
 * 
 * Exports all data service functions from a single entry point.
 */

// Export all address-related functions
export * from './addresses';

// Export all destination-related functions
export * from './destinations';

// Export all trip history-related functions
export * from './trips';

/**
 * Initialize all data stores with sample data for development
 * This is used only in development to provide initial data
 */
export function initializeDataStores() {
  if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
    const { initializeAddresses } = require('./addresses');
    const { initializeDestinations } = require('./destinations');
    const { initializeTrips } = require('./trips');
    
    // Sample addresses
    const sampleAddresses = [
      {
        id: 'addr1',
        name: 'Home',
        full: '123 Main St, New York, NY 10001',
        favorite: true,
        customerId: 'user1'
      },
      {
        id: 'addr2',
        name: 'Work',
        full: '456 Park Ave, New York, NY 10022',
        favorite: true,
        customerId: 'user1'
      },
      {
        id: 'addr3',
        name: 'Gym',
        full: '789 Broadway, New York, NY 10003',
        favorite: false,
        customerId: 'user1'
      }
    ];
    
    // Sample destinations
    const sampleDestinations = [
      {
        id: 'dest1',
        name: 'Grand Central Terminal',
        address: '89 E 42nd St, New York, NY 10017',
        type: 'transit',
        popularity: 124
      },
      {
        id: 'dest2',
        name: 'Empire State Building',
        address: '20 W 34th St, New York, NY 10001',
        type: 'landmark',
        popularity: 78
      },
      {
        id: 'dest3',
        name: 'Central Park',
        address: 'Central Park, New York, NY',
        type: 'park',
        popularity: 92
      },
      {
        id: 'dest4',
        name: 'Times Square',
        address: 'Manhattan, NY 10036',
        type: 'landmark',
        popularity: 110
      }
    ];
    
    // Initialize stores
    initializeAddresses(sampleAddresses);
    initializeDestinations(sampleDestinations);
    initializeTrips();
    
    console.log('Data stores initialized with sample data');
  }
} 