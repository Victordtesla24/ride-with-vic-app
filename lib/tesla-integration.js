/**
 * Tesla API Integration
 * Handles Tesla API authentication and vehicle interaction
 */

import { VehicleSelector } from 'components/vehicle/VehicleSelector.js';
import { CustomerSelector } from 'components/customer/CustomerSelector.js';
import { LiveTripCard, TripHistoryViewer } from 'components/trip/index.js';
import TeslaAPI from 'lib/tesla-api.js';

// Initialize Tesla API client
const teslaApi = new TeslaAPI();

// Initialize components
let vehicleSelector = null;
let customerSelector = null;
let liveTripCard = null;
let tripHistoryViewer = null;
let selectedVehicleId = null;
let customerSelectorVisible = false;

// DOM elements
let teslaAuthBtn = null;
let newTripBtn = null;
let authIndicator = null;
let authText = null;
let vehicleSelectorContainer = null;
let liveTripContainer = null;
let customerSelectorContainer = null;
let customerSelectorModal = null;
let tripHistoryContainer = null;

/**
 * Initialize Tesla API with environment variables
 * @param {Object} env Environment variables
 */
export function initTeslaEnvironment(env) {
  teslaApi.init({
    clientId: env.TESLA_CLIENT_ID,
    redirectUri: env.TESLA_REDIRECT_URI,
    baseUrl: env.TESLA_API_BASE_URL,
    authUrl: env.TESLA_AUTH_URL,
    privateKey: env.TESLA_PRIVATE_KEY
  });
}

/**
 * Initialize Tesla integration
 */
export function initTeslaIntegration() {
  // Get DOM elements
  teslaAuthBtn = document.getElementById('tesla-auth-btn');
  newTripBtn = document.getElementById('new-trip-btn');
  authIndicator = document.querySelector('.auth-indicator');
  authText = document.querySelector('.auth-text');
  vehicleSelectorContainer = document.getElementById('vehicle-selector-container');
  liveTripContainer = document.getElementById('live-trip-container');
  customerSelectorContainer = document.getElementById('customer-selector-container');
  customerSelectorModal = document.querySelector('.customer-selector-modal');
  tripHistoryContainer = document.getElementById('trip-history-container');
  
  // Initialize components
  initializeComponents();
  
  // Update authentication status
  updateAuthStatus();
  
  // Attach event listeners
  attachEventListeners();
  
  // Expose the environment initialization function to the window
  window.initTeslaEnvironment = initTeslaEnvironment;
}

/**
 * Initialize UI components
 */
function initializeComponents() {
  // Initialize vehicle selector
  vehicleSelector = new VehicleSelector(vehicleSelectorContainer);
  
  // Initialize customer selector
  customerSelector = new CustomerSelector(customerSelectorModal);
  customerSelector.hide();
  
  // Initialize live trip card
  liveTripCard = new LiveTripCard(liveTripContainer, {
    autoCenter: true
  });
  
  // Initialize trip history viewer
  tripHistoryViewer = new TripHistoryViewer(tripHistoryContainer);
  
  // Hide customer selector container initially
  customerSelectorContainer.style.display = 'none';
}

/**
 * Update authentication status UI
 */
function updateAuthStatus() {
  const isAuthenticated = teslaApi.isAuthenticated();
  
  if (isAuthenticated) {
    authIndicator.classList.add('authenticated');
    authText.textContent = 'Connected to Tesla';
    teslaAuthBtn.textContent = 'Disconnect';
    
    // Load vehicles
    loadVehicles();
  } else {
    authIndicator.classList.remove('authenticated');
    authText.textContent = 'Not connected to Tesla';
    teslaAuthBtn.textContent = 'Connect Tesla';
    
    // Clear vehicle selector
    vehicleSelector.clearVehicles();
    
    // Disable new trip button
    newTripBtn.disabled = true;
  }
}

/**
 * Load vehicles from Tesla API
 */
async function loadVehicles() {
  try {
    const vehicles = await teslaApi.getVehicles();
    vehicleSelector.setVehicles(vehicles);
    
    // Enable new trip button if vehicles are available
    newTripBtn.disabled = vehicles.length === 0;
  } catch (error) {
    console.error('Error loading vehicles:', error);
    alert('Failed to load vehicles. Please try again.');
  }
}

/**
 * Handle Tesla authentication
 */
async function handleTeslaAuth() {
  const isAuthenticated = teslaApi.isAuthenticated();
  
  if (isAuthenticated) {
    // Disconnect from Tesla
    teslaApi.clearTokens();
    updateAuthStatus();
  } else {
    // Connect to Tesla
    const authUrl = teslaApi.getAuthorizationUrl();
    window.open(authUrl, '_blank', 'width=800,height=600');
    
    // Poll for authentication status
    const checkAuth = setInterval(() => {
      if (teslaApi.isAuthenticated()) {
        clearInterval(checkAuth);
        updateAuthStatus();
      }
    }, 1000);
    
    // Stop checking after 5 minutes
    setTimeout(() => {
      clearInterval(checkAuth);
    }, 5 * 60 * 1000);
  }
}

/**
 * Show customer selector modal
 */
function showCustomerSelector() {
  customerSelectorContainer.style.display = 'block';
  customerSelector.show();
  customerSelectorVisible = true;
}

/**
 * Hide customer selector modal
 */
function hideCustomerSelector() {
  customerSelectorContainer.style.display = 'none';
  customerSelectorVisible = false;
}

/**
 * Start a new trip
 */
async function startNewTrip() {
  const selectedVehicle = vehicleSelector.getSelectedVehicle();
  
  if (!selectedVehicle) {
    alert('Please select a vehicle first');
    return;
  }
  
  // Check if vehicle is online
  const isOnline = await teslaApi.isVehicleOnline(selectedVehicle.id);
  if (!isOnline) {
    const wakeUpConfirm = confirm('Vehicle is offline. Would you like to wake it up?');
    if (wakeUpConfirm) {
      try {
        await teslaApi.wakeUpVehicle(selectedVehicle.id);
        alert('Vehicle is waking up. This may take a few seconds.');
        
        // Check if vehicle is online after wake attempt
        let wakeAttempts = 0;
        const checkWake = setInterval(async () => {
          const online = await teslaApi.isVehicleOnline(selectedVehicle.id);
          if (online) {
            clearInterval(checkWake);
            showCustomerSelector();
          } else if (wakeAttempts >= 10) {
            clearInterval(checkWake);
            alert('Unable to wake vehicle. Please try again later.');
          }
          wakeAttempts++;
        }, 2000);
      } catch (error) {
        console.error('Error waking vehicle:', error);
        alert('Failed to wake vehicle. Please try again later.');
      }
    }
    return;
  }
  
  selectedVehicleId = selectedVehicle.id;
  showCustomerSelector();
}

/**
 * Start trip with selected customer and vehicle
 */
async function startTripWithCustomer(customer) {
  if (!customer || !selectedVehicleId) return;
  
  hideCustomerSelector();
  
  // Start trip
  try {
    await liveTripCard.startTrip(customer.id, selectedVehicleId);
  } catch (error) {
    console.error('Error starting trip:', error);
    alert(`Failed to start trip: ${error.message}`);
  }
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
  // Tesla auth button
  teslaAuthBtn.addEventListener('click', handleTeslaAuth);
  
  // New trip button
  newTripBtn.addEventListener('click', startNewTrip);
  
  // Customer selection events
  customerSelector.on('customerSelected', (e) => {
    startTripWithCustomer(e.detail.customer);
  });
  
  customerSelector.on('customerCreated', (e) => {
    startTripWithCustomer(e.detail.customer);
  });
  
  customerSelector.on('customerSelectionCancelled', () => {
    hideCustomerSelector();
  });
  
  // Live trip events
  liveTripCard.on('requestStartTrip', () => {
    startNewTrip();
  });
  
  liveTripCard.on('tripEnded', (e) => {
    alert('Trip completed successfully!');
    
    // Reload trip history
    tripHistoryViewer.reload();
  });
  
  // Modal overlay click to close
  customerSelectorContainer.querySelector('.modal-overlay').addEventListener('click', () => {
    if (customerSelectorVisible) {
      hideCustomerSelector();
    }
  });
  
  // Trip history receipt button
  tripHistoryViewer.on('viewReceipt', (e) => {
    const trip = e.detail.trip;
    if (trip) {
      // Show receipt modal - assuming a global function to do this
      window.showReceiptModal(trip);
    }
  });
}

export default {
  initTeslaIntegration
}; 