/**
 * Main Layout Component
 * Provides consistent layout structure for the application
 */

class MainLayout {
  constructor(container) {
    this.container = container;
    this.initLayout();
  }

  /**
   * Initialize the layout
   */
  initLayout() {
    if (!this.container) return;
    
    // Create header
    this.header = document.createElement('header');
    this.header.className = 'main-header';
    
    // Create logo and app title
    const logoContainer = document.createElement('div');
    logoContainer.className = 'logo-container';
    
    const logo = document.createElement('img');
    logo.src = '/public/icons/logo.svg';
    logo.alt = 'Ride With Vic';
    
    const appTitle = document.createElement('h1');
    appTitle.textContent = 'Ride With Vic';
    
    logoContainer.appendChild(logo);
    logoContainer.appendChild(appTitle);
    
    // Create auth section
    const authSection = document.createElement('div');
    authSection.className = 'auth-section';
    
    const authIndicator = document.createElement('div');
    authIndicator.className = 'auth-indicator';
    
    const authText = document.createElement('span');
    authText.className = 'auth-text';
    authText.textContent = 'Not connected to Tesla';
    
    const authButton = document.createElement('button');
    authButton.id = 'tesla-auth-btn';
    authButton.textContent = 'Connect Tesla';
    
    authSection.appendChild(authIndicator);
    authSection.appendChild(authText);
    authSection.appendChild(authButton);
    
    // Append to header
    this.header.appendChild(logoContainer);
    this.header.appendChild(authSection);
    
    // Create main content area
    this.mainContent = document.createElement('main');
    this.mainContent.className = 'main-content';
    
    // Create vehicle section
    this.vehicleSection = document.createElement('section');
    this.vehicleSection.className = 'vehicle-section';
    this.vehicleSection.innerHTML = `
      <h2>Your Vehicles</h2>
      <div id="vehicle-selector-container" class="vehicle-selector"></div>
    `;
    
    // Create trip controls
    this.tripControls = document.createElement('div');
    this.tripControls.className = 'trip-controls';
    
    const newTripBtn = document.createElement('button');
    newTripBtn.id = 'new-trip-btn';
    newTripBtn.className = 'primary-btn';
    newTripBtn.textContent = 'Start New Trip';
    newTripBtn.disabled = true;
    
    this.tripControls.appendChild(newTripBtn);
    this.vehicleSection.appendChild(this.tripControls);
    
    // Create customer selector
    this.customerSection = document.createElement('div');
    this.customerSection.id = 'customer-selector-container';
    this.customerSection.className = 'customer-selector-container';
    this.customerSection.style.display = 'none';
    
    const customerModal = document.createElement('div');
    customerModal.className = 'customer-selector-modal';
    
    this.customerSection.appendChild(customerModal);
    
    // Create trip section
    this.tripSection = document.createElement('section');
    this.tripSection.className = 'trip-section';
    
    const liveTripContainer = document.createElement('div');
    liveTripContainer.id = 'live-trip-container';
    liveTripContainer.className = 'live-trip-container';
    
    const tripHistoryContainer = document.createElement('div');
    tripHistoryContainer.id = 'trip-history-container';
    tripHistoryContainer.className = 'trip-history-container';
    
    this.tripSection.appendChild(liveTripContainer);
    this.tripSection.appendChild(tripHistoryContainer);
    
    // Create footer
    this.footer = document.createElement('footer');
    this.footer.className = 'main-footer';
    this.footer.innerHTML = `
      <p>Ride With Vic &copy; ${new Date().getFullYear()}</p>
      <div class="footer-links">
        <a href="#privacy">Privacy Policy</a>
        <a href="#terms">Terms of Service</a>
        <a href="#help">Help Center</a>
      </div>
    `;
    
    // Append all sections to the main container
    this.mainContent.appendChild(this.vehicleSection);
    this.mainContent.appendChild(this.tripSection);
    
    // Append all to container
    this.container.appendChild(this.header);
    this.container.appendChild(this.mainContent);
    this.container.appendChild(this.footer);
    this.container.appendChild(this.customerSection);
  }

  /**
   * Get the customer selector container
   * @returns {HTMLElement} Customer selector container
   */
  getCustomerSelectorContainer() {
    return this.customerSection;
  }

  /**
   * Get the vehicle selector container
   * @returns {HTMLElement} Vehicle selector container
   */
  getVehicleSelectorContainer() {
    return document.getElementById('vehicle-selector-container');
  }

  /**
   * Get the live trip container
   * @returns {HTMLElement} Live trip container
   */
  getLiveTripContainer() {
    return document.getElementById('live-trip-container');
  }

  /**
   * Get the trip history container
   * @returns {HTMLElement} Trip history container
   */
  getTripHistoryContainer() {
    return document.getElementById('trip-history-container');
  }
}

export default MainLayout; 