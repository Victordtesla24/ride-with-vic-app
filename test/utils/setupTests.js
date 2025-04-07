/**
 * Jest setup file
 * 
 * This file runs before each test file is executed and sets up the global testing environment
 */

// Mocking browser APIs that might not be available in the test environment
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock for fetch
global.fetch = jest.fn();

// Mock for window.location
Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    href: 'http://localhost:3000/',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
  },
});

// Add any additional test-related imports or configurations here 