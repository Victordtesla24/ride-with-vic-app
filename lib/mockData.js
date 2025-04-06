/**
 * Mock Data for Ride with Vic App
 * 
 * This file contains mock data used for development and testing purposes.
 * In a production environment, this data would be fetched from an API or database.
 */

// User Profile
export const userProfile = {
  id: 'user123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg',
  paymentMethods: [
    {
      id: 'pm1',
      type: 'credit_card',
      last4: '4242',
      brand: 'Visa',
      expMonth: 12,
      expYear: 2024,
      isDefault: true
    },
    {
      id: 'pm2',
      type: 'credit_card',
      last4: '5555',
      brand: 'Mastercard',
      expMonth: 10,
      expYear: 2023,
      isDefault: false
    }
  ],
  preferences: {
    darkMode: false,
    notifications: true,
    language: 'en',
    currency: 'USD'
  },
  stats: {
    totalRides: 42,
    totalDistance: 684.2, // in miles
    totalSaved: 153.40, // in USD (compared to traditional rideshare)
    carbonFootprintReduction: 756.2 // in kg of CO2
  },
  memberSince: '2022-03-15'
};

// Vehicle Data
export const vehicles = [
  {
    id: 'v001',
    model: 'Tesla Model 3',
    variant: 'Long Range',
    year: 2023,
    licensePlate: 'EV-3456',
    color: 'Deep Blue Metallic',
    seats: 5,
    range: 358, // miles
    charging: {
      current: 87, // percentage
      timeToFull: 35 // minutes
    },
    status: 'available',
    location: {
      lat: 37.7749,
      lng: -122.4194,
      address: '123 Market St, San Francisco, CA 94105'
    },
    features: [
      'Autopilot',
      'Premium Interior',
      'Glass Roof',
      'All-Wheel Drive'
    ],
    images: [
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1760&q=80'
    ],
    pricing: {
      perMile: 0.50,
      perMinute: 0.20,
      base: 5.00,
      minimum: 10.00
    }
  },
  {
    id: 'v002',
    model: 'Tesla Model Y',
    variant: 'Performance',
    year: 2023,
    licensePlate: 'EV-7890',
    color: 'Pearl White',
    seats: 7,
    range: 303, // miles
    charging: {
      current: 92, // percentage
      timeToFull: 20 // minutes
    },
    status: 'available',
    location: {
      lat: 37.7833,
      lng: -122.4167,
      address: '456 Montgomery St, San Francisco, CA 94104'
    },
    features: [
      'Autopilot',
      'Premium Interior',
      'Third Row Seating',
      'Performance Upgrade'
    ],
    images: [
      'https://images.unsplash.com/photo-1617704548623-340376564e04?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80'
    ],
    pricing: {
      perMile: 0.55,
      perMinute: 0.25,
      base: 6.00,
      minimum: 12.00
    }
  },
  {
    id: 'v003',
    model: 'Tesla Model X',
    variant: 'Plaid',
    year: 2023,
    licensePlate: 'EV-1234',
    color: 'Midnight Silver Metallic',
    seats: 6,
    range: 333, // miles
    charging: {
      current: 78, // percentage
      timeToFull: 45 // minutes
    },
    status: 'available',
    location: {
      lat: 37.7865,
      lng: -122.4011,
      address: '789 Embarcadero, San Francisco, CA 94111'
    },
    features: [
      'Autopilot',
      'Premium Interior',
      'Falcon Wing Doors',
      'Ludicrous Mode',
      'Bio-Weapon Defense Mode'
    ],
    images: [
      'https://images.unsplash.com/photo-1566833816403-1d83080f7dc3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80'
    ],
    pricing: {
      perMile: 0.65,
      perMinute: 0.30,
      base: 8.00,
      minimum: 15.00
    }
  }
];

// Trip history data
export const tripHistory = [
  {
    id: 'trip-1',
    date: '2023-03-25T14:30:00',
    vehicle: 'Tesla Model 3',
    pickup: '123 Main St, San Francisco, CA',
    dropoff: 'SFO Airport, San Francisco, CA',
    distance: 12.5, // miles
    duration: 28, // minutes
    cost: 35.75,
    driver: {
      name: 'Alex Johnson',
      rating: 4.9,
      photo: 'https://randomuser.me/api/portraits/men/42.jpg'
    },
    status: 'completed',
    route: [
      { lat: 37.7749, lng: -122.4194 }, // start
      { lat: 37.7550, lng: -122.4050 },
      { lat: 37.7350, lng: -122.3950 },
      { lat: 37.6213, lng: -122.3790 }  // SFO
    ]
  },
  {
    id: 'trip-2',
    date: '2023-03-20T09:15:00',
    vehicle: 'Tesla Model Y',
    pickup: '456 Market St, San Francisco, CA',
    dropoff: 'Golden Gate Park, San Francisco, CA',
    distance: 4.8, // miles
    duration: 18, // minutes
    cost: 18.25,
    driver: {
      name: 'Sarah Williams',
      rating: 4.8,
      photo: 'https://randomuser.me/api/portraits/women/33.jpg'
    },
    status: 'completed',
    route: [
      { lat: 37.7902, lng: -122.4015 }, // start
      { lat: 37.7785, lng: -122.4210 },
      { lat: 37.7695, lng: -122.4570 }  // Golden Gate Park
    ]
  },
  {
    id: 'trip-3',
    date: '2023-03-18T19:45:00',
    vehicle: 'Tesla Model X',
    pickup: 'Fisherman\'s Wharf, San Francisco, CA',
    dropoff: 'Union Square, San Francisco, CA',
    distance: 2.3, // miles
    duration: 12, // minutes
    cost: 15.50,
    driver: {
      name: 'Michael Chen',
      rating: 5.0,
      photo: 'https://randomuser.me/api/portraits/men/64.jpg'
    },
    status: 'completed',
    route: [
      { lat: 37.8083, lng: -122.4156 }, // Fisherman's Wharf
      { lat: 37.7958, lng: -122.4074 },
      { lat: 37.7881, lng: -122.4075 }  // Union Square
    ]
  }
];

// Popular destinations
export const popularDestinations = [
  {
    id: 'dest-1',
    name: 'San Francisco International Airport (SFO)',
    address: 'San Francisco International Airport, San Francisco, CA 94128',
    location: { lat: 37.6213, lng: -122.3790 },
    icon: 'airport'
  },
  {
    id: 'dest-2',
    name: 'Union Square',
    address: '333 Post St, San Francisco, CA 94108',
    location: { lat: 37.7881, lng: -122.4075 },
    icon: 'shopping'
  },
  {
    id: 'dest-3',
    name: 'Fisherman\'s Wharf',
    address: 'Beach Street & The Embarcadero, San Francisco, CA 94133',
    location: { lat: 37.8083, lng: -122.4156 },
    icon: 'attraction'
  },
  {
    id: 'dest-4',
    name: 'Golden Gate Bridge',
    address: 'Golden Gate Bridge, San Francisco, CA 94129',
    location: { lat: 37.8199, lng: -122.4783 },
    icon: 'landmark'
  },
  {
    id: 'dest-5',
    name: 'Oracle Park',
    address: '24 Willie Mays Plaza, San Francisco, CA 94107',
    location: { lat: 37.7786, lng: -122.3893 },
    icon: 'sports'
  }
];

// Saved addresses
export const savedAddresses = [
  {
    id: 'addr-1',
    name: 'Home',
    address: '123 Main St, Apt 45, San Francisco, CA 94105',
    location: { lat: 37.7749, lng: -122.4194 },
    type: 'home'
  },
  {
    id: 'addr-2',
    name: 'Work',
    address: '555 Market St, San Francisco, CA 94105',
    location: { lat: 37.7895, lng: -122.4007 },
    type: 'work'
  },
  {
    id: 'addr-3',
    name: 'Gym',
    address: '300 Berry St, San Francisco, CA 94158',
    location: { lat: 37.7721, lng: -122.3876 },
    type: 'other'
  }
]; 