/**
 * Mock data for demonstration purposes
 */

// Sample user profile data
export const userProfile = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  birthdate: '1990-05-15',
  profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg',
  bio: 'I travel a lot for work and use ride-sharing services frequently. Looking forward to trying out this new ride service!',
  joinDate: '2023-02-10',
  ridesCompleted: 24,
  rating: 4.8
};

// Sample ride history
export const rideHistory = [
  {
    id: '1',
    date: '2023-06-15',
    time: '08:30',
    pickup: '123 Main St, San Francisco, CA',
    dropoff: 'SF International Airport, Terminal 3',
    driver: 'Miguel R.',
    fare: '42.50',
    payment: 'Visa ***1234',
    status: 'completed',
    rating: 5,
    notes: 'Great driver, helped with my luggage'
  },
  {
    id: '2',
    date: '2023-06-10',
    time: '19:15',
    pickup: 'Golden Gate Park, San Francisco, CA',
    dropoff: '789 Market St, San Francisco, CA',
    driver: 'Lisa K.',
    fare: '18.75',
    originalFare: '25.00',
    discount: 25,
    discountAmount: '6.25',
    payment: 'Mastercard ***5678',
    status: 'completed',
    rating: 4
  },
  {
    id: '3',
    date: '2023-06-05',
    time: '12:45',
    pickup: '555 California St, San Francisco, CA',
    dropoff: 'Ferry Building, San Francisco, CA',
    driver: 'Thomas J.',
    fare: '15.50',
    payment: 'Cash',
    status: 'completed',
    rating: 4.5
  },
  {
    id: '4',
    date: '2023-05-28',
    time: '09:00',
    pickup: 'Fisherman\'s Wharf, San Francisco, CA',
    dropoff: 'Union Square, San Francisco, CA',
    driver: 'Sarah M.',
    fare: '12.25',
    payment: 'Visa ***1234',
    status: 'completed',
    rating: 5
  },
  {
    id: '5',
    date: '2023-05-20',
    time: '22:30',
    pickup: 'AT&T Park, San Francisco, CA',
    dropoff: '123 Main St, San Francisco, CA',
    driver: 'David L.',
    fare: '22.00',
    originalFare: '27.50',
    discount: 20,
    discountAmount: '5.50',
    payment: 'Mastercard ***5678',
    status: 'completed',
    rating: 4
  }
];

// Sample saved addresses
export const savedAddresses = [
  {
    id: '1',
    name: 'Home',
    address: '123 Main St, Apt 4B, San Francisco, CA 94103',
    type: 'home'
  },
  {
    id: '2',
    name: 'Work',
    address: '555 Market St, Floor 10, San Francisco, CA 94105',
    type: 'work'
  },
  {
    id: '3',
    name: 'Gym',
    address: '200 Bay St, San Francisco, CA 94133',
    type: 'favorite'
  },
  {
    id: '4',
    name: 'Parents',
    address: '42 Sunset Ave, Sausalito, CA 94965',
    type: 'home'
  }
];

// Sample payment methods
export const paymentMethods = [
  {
    id: '1',
    type: 'credit',
    number: '4111 1111 1111 1234',
    name: 'John Doe',
    expiry: '05/25',
    cvv: '123',
    isDefault: true
  },
  {
    id: '2',
    type: 'debit',
    number: '5555 5555 5555 4444',
    name: 'John Doe',
    expiry: '12/24',
    cvv: '456',
    isDefault: false
  },
  {
    id: '3',
    type: 'cash',
    name: 'Cash Payment',
    isDefault: false
  }
];

// Sample settings
export const userSettings = {
  notifications: {
    rideUpdates: true,
    promotions: false,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false
  },
  privacy: {
    shareLocation: true,
    shareRideHistory: false,
    dataAnalytics: true
  },
  preferences: {
    language: 'en',
    currency: 'USD',
    theme: 'light',
    defaultMapView: 'standard'
  },
  accessibility: {
    highContrast: false,
    largeText: false,
    screenReader: false
  }
};

// Sample destinations for fare estimates
export const popularDestinations = [
  {
    id: '1',
    name: 'SF International Airport',
    address: 'San Francisco International Airport, CA 94128'
  },
  {
    id: '2',
    name: 'Downtown',
    address: 'Union Square, San Francisco, CA 94108'
  },
  {
    id: '3',
    name: 'Golden Gate Bridge',
    address: 'Golden Gate Bridge, San Francisco, CA 94129'
  },
  {
    id: '4',
    name: 'Fisherman\'s Wharf',
    address: 'Fisherman\'s Wharf, San Francisco, CA 94133'
  },
  {
    id: '5',
    name: 'Oracle Park',
    address: '24 Willie Mays Plaza, San Francisco, CA 94107'
  },
  {
    id: '6',
    name: 'Twin Peaks',
    address: 'Twin Peaks, San Francisco, CA 94131'
  }
];

// Sample active ride (if user has one)
export const activeRide = {
  id: 'active-1',
  status: 'en_route', // 'requesting', 'confirmed', 'en_route', 'arrived', 'in_progress', 'completed'
  driver: {
    name: 'Rebecca S.',
    phone: '+1 (555) 987-6543',
    photo: 'https://randomuser.me/api/portraits/women/44.jpg',
    car: 'Tesla Model 3',
    color: 'White',
    plate: 'EV RIDE',
    rating: 4.9
  },
  pickup: {
    location: '123 Main St, San Francisco, CA',
    time: '2023-06-20T15:30:00',
    eta: '2 min'
  },
  dropoff: {
    location: 'SF International Airport, Terminal 3',
    eta: '25 min',
    arrivalTime: '2023-06-20T16:00:00'
  },
  route: {
    distance: '14.5 miles',
    duration: '25 min',
    currentLocation: {
      latitude: 37.7749,
      longitude: -122.4194
    }
  },
  fare: {
    estimate: '42.50',
    currency: 'USD',
    paymentMethod: 'Visa ***1234'
  }
}; 