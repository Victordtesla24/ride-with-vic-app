/**
 * TripHistoryViewer Component
 * Displays trip history with route visualization
 */

/**
 * Initialize TripHistoryViewer component
 * @param {HTMLElement} container The container element
 * @param {Object} options Configuration options
 * @returns {Object} Component API
 */
export function TripHistoryViewer(container, options = {}) {
  // Private variables
  let trips = [];
  let selectedTripId = null;
  let map = null;
  let marker = null;
  let path = null;
  
  // Create component structure
  const componentEl = document.createElement('div');
  componentEl.className = 'trip-history-viewer';
  componentEl.innerHTML = `
    <div class="trip-list-wrapper">
      <h3>Trip History</h3>
      <div class="trip-filter">
        <input type="text" placeholder="Search trips..." class="trip-search">
        <select class="trip-sort">
          <option value="date-desc">Date (Newest)</option>
          <option value="date-asc">Date (Oldest)</option>
          <option value="fare-desc">Fare (Highest)</option>
          <option value="fare-asc">Fare (Lowest)</option>
          <option value="distance-desc">Distance (Longest)</option>
          <option value="distance-asc">Distance (Shortest)</option>
        </select>
      </div>
      <div class="trip-list"></div>
    </div>
    <div class="trip-details">
      <div class="trip-details-map"></div>
      <div class="trip-details-info">
        <div class="trip-details-header">
          <h3>Trip Details</h3>
          <button class="btn btn-receipt">View Receipt</button>
        </div>
        <div class="trip-details-content">
          <p class="no-trip-selected">Select a trip to view details</p>
          <div class="trip-details-data" style="display: none;">
            <div class="detail-item">
              <span class="detail-label">Date:</span>
              <span class="detail-value date"></span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Start:</span>
              <span class="detail-value start-location"></span>
            </div>
            <div class="detail-item">
              <span class="detail-label">End:</span>
              <span class="detail-value end-location"></span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Duration:</span>
              <span class="detail-value duration"></span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Distance:</span>
              <span class="detail-value distance"></span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Fare:</span>
              <span class="detail-value fare"></span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Customer:</span>
              <span class="detail-value customer"></span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Vehicle:</span>
              <span class="detail-value vehicle"></span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Payment:</span>
              <span class="detail-value payment"></span>
            </div>
            <div class="detail-item notes-item">
              <span class="detail-label">Notes:</span>
              <span class="detail-value notes"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Append to container
  container.appendChild(componentEl);
  
  // Get element references
  const tripListEl = componentEl.querySelector('.trip-list');
  const tripSearchEl = componentEl.querySelector('.trip-search');
  const tripSortEl = componentEl.querySelector('.trip-sort');
  const tripDetailsMapEl = componentEl.querySelector('.trip-details-map');
  const noTripSelectedEl = componentEl.querySelector('.no-trip-selected');
  const tripDetailsDataEl = componentEl.querySelector('.trip-details-data');
  const receiptButton = componentEl.querySelector('.btn-receipt');
  
  // Detail field references
  const dateEl = componentEl.querySelector('.detail-value.date');
  const startLocationEl = componentEl.querySelector('.detail-value.start-location');
  const endLocationEl = componentEl.querySelector('.detail-value.end-location');
  const durationEl = componentEl.querySelector('.detail-value.duration');
  const distanceEl = componentEl.querySelector('.detail-value.distance');
  const fareEl = componentEl.querySelector('.detail-value.fare');
  const customerEl = componentEl.querySelector('.detail-value.customer');
  const vehicleEl = componentEl.querySelector('.detail-value.vehicle');
  const paymentEl = componentEl.querySelector('.detail-value.payment');
  const notesEl = componentEl.querySelector('.detail-value.notes');
  
  // Initialize map if Google Maps is available
  function initMap() {
    if (window.google && window.google.maps) {
      map = new google.maps.Map(tripDetailsMapEl, {
        center: { lat: 40.7128, lng: -74.0060 }, // Default to NYC
        zoom: 14,
        disableDefaultUI: true,
        styles: [
          { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
        ]
      });
      
      marker = new google.maps.Marker({
        map: map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: "#3498db",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2
        }
      });
      
      path = new google.maps.Polyline({
        map: map,
        path: [],
        strokeColor: '#3498db',
        strokeOpacity: 0.8,
        strokeWeight: 3
      });
      
      return true;
    }
    
    return false;
  }
  
  // Format date
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Format duration in HH:MM:SS
  function formatDuration(startDateStr, endDateStr) {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const durationMs = end - start;
    
    const seconds = Math.floor(durationMs / 1000) % 60;
    const minutes = Math.floor(durationMs / (1000 * 60)) % 60;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  }
  
  // Calculate total distance from location points
  function calculateTotalDistance(locationPoints) {
    if (!locationPoints || locationPoints.length < 2) return 0;
    
    let total = 0;
    for (let i = 1; i < locationPoints.length; i++) {
      const prev = locationPoints[i-1];
      const curr = locationPoints[i];
      
      if (prev.latitude && prev.longitude && curr.latitude && curr.longitude) {
        total += calculateDistance(
          prev.latitude, 
          prev.longitude, 
          curr.latitude, 
          curr.longitude
        );
      }
    }
    
    return total;
  }
  
  // Calculate distance between two points (haversine formula)
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3958.8; // Earth's radius in miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  }
  
  // Convert degrees to radians
  function toRad(degrees) {
    return degrees * Math.PI / 180;
  }
  
  // Render trip list
  function renderTripList(filteredTrips = null) {
    const tripsToRender = filteredTrips || trips;
    
    tripListEl.innerHTML = '';
    
    if (tripsToRender.length === 0) {
      tripListEl.innerHTML = '<p class="no-trips">No trips found</p>';
      return;
    }
    
    tripsToRender.forEach(trip => {
      const tripEl = document.createElement('div');
      tripEl.className = 'trip-item';
      if (selectedTripId === trip.id) {
        tripEl.classList.add('selected');
      }
      
      const date = new Date(trip.startTime);
      const formattedDate = date.toLocaleDateString();
      const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const distance = trip.telemetryData ? 
        calculateTotalDistance(trip.telemetryData).toFixed(1) + ' mi' : 
        'N/A';
      
      tripEl.innerHTML = `
        <div class="trip-item-header">
          <span class="trip-date">${formattedDate}</span>
          <span class="trip-fare">$${(trip.actualFare || trip.estimatedFare || 0).toFixed(2)}</span>
        </div>
        <div class="trip-item-details">
          <div class="trip-location">
            <div class="trip-time">${formattedTime}</div>
            <div class="trip-from">${trip.startLocation?.address || 'Unknown'}</div>
            <div class="trip-to">${trip.endLocation?.address || 'Unknown'}</div>
          </div>
          <div class="trip-stats">
            <div class="trip-distance">${distance}</div>
          </div>
        </div>
      `;
      
      tripEl.addEventListener('click', () => {
        selectTrip(trip.id);
      });
      
      tripListEl.appendChild(tripEl);
    });
  }
  
  // Select a trip
  function selectTrip(tripId) {
    selectedTripId = tripId;
    
    // Get trip data
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    
    // Update UI
    noTripSelectedEl.style.display = 'none';
    tripDetailsDataEl.style.display = 'block';
    
    // Update details
    dateEl.textContent = formatDate(trip.startTime);
    startLocationEl.textContent = trip.startLocation?.address || 'Unknown';
    endLocationEl.textContent = trip.endLocation?.address || 'Unknown';
    durationEl.textContent = formatDuration(trip.startTime, trip.endTime);
    
    const distance = trip.telemetryData ? 
      calculateTotalDistance(trip.telemetryData).toFixed(1) + ' mi' : 
      'N/A';
    distanceEl.textContent = distance;
    
    fareEl.textContent = `$${(trip.actualFare || trip.estimatedFare || 0).toFixed(2)}`;
    customerEl.textContent = trip.customerName || 'Unknown';
    vehicleEl.textContent = trip.vehicleName || trip.vehicleId || 'Unknown';
    paymentEl.textContent = trip.paymentMethod || 'N/A';
    notesEl.textContent = trip.notes || 'N/A';
    
    // Initialize map if not already done
    if (!map) {
      initMap();
    }
    
    // Render route on map
    renderRouteOnMap(trip);
    
    // Highlight selected trip in list
    document.querySelectorAll('.trip-item').forEach(el => {
      el.classList.remove('selected');
    });
    
    document.querySelector(`.trip-item[data-id="${tripId}"]`)?.classList.add('selected');
  }
  
  // Render route on map
  function renderRouteOnMap(trip) {
    if (!map || !trip || !trip.telemetryData || trip.telemetryData.length === 0) return;
    
    const pathCoords = [];
    
    // Convert telemetry data to LatLng points
    trip.telemetryData.forEach(point => {
      if (point.latitude && point.longitude) {
        pathCoords.push(new google.maps.LatLng(point.latitude, point.longitude));
      }
    });
    
    if (pathCoords.length === 0) return;
    
    // Set path on map
    path.setPath(pathCoords);
    
    // Set marker at the end point
    marker.setPosition(pathCoords[pathCoords.length - 1]);
    
    // Fit bounds to show entire route
    const bounds = new google.maps.LatLngBounds();
    pathCoords.forEach(point => bounds.extend(point));
    map.fitBounds(bounds);
    
    // If only one point, zoom in appropriately
    if (pathCoords.length === 1) {
      map.setZoom(14);
    }
  }
  
  // Filter trips
  function filterTrips(searchText) {
    if (!searchText || searchText.trim() === '') {
      return trips;
    }
    
    const query = searchText.toLowerCase().trim();
    
    return trips.filter(trip => {
      // Search by date
      const date = new Date(trip.startTime).toLocaleDateString();
      if (date.toLowerCase().includes(query)) return true;
      
      // Search by location
      const startLocation = trip.startLocation?.address || '';
      const endLocation = trip.endLocation?.address || '';
      if (startLocation.toLowerCase().includes(query) || endLocation.toLowerCase().includes(query)) {
        return true;
      }
      
      // Search by customer name
      const customerName = trip.customerName || '';
      if (customerName.toLowerCase().includes(query)) return true;
      
      // Search by vehicle
      const vehicleName = trip.vehicleName || trip.vehicleId || '';
      if (vehicleName.toLowerCase().includes(query)) return true;
      
      // Search by fare
      const fare = (trip.actualFare || trip.estimatedFare || 0).toFixed(2);
      if (fare.includes(query)) return true;
      
      return false;
    });
  }
  
  // Sort trips
  function sortTrips(tripList, sortOption) {
    const sortedTrips = [...tripList];
    
    switch (sortOption) {
      case 'date-desc':
        sortedTrips.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        break;
      case 'date-asc':
        sortedTrips.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        break;
      case 'fare-desc':
        sortedTrips.sort((a, b) => {
          const fareA = a.actualFare || a.estimatedFare || 0;
          const fareB = b.actualFare || b.estimatedFare || 0;
          return fareB - fareA;
        });
        break;
      case 'fare-asc':
        sortedTrips.sort((a, b) => {
          const fareA = a.actualFare || a.estimatedFare || 0;
          const fareB = b.actualFare || b.estimatedFare || 0;
          return fareA - fareB;
        });
        break;
      case 'distance-desc':
        sortedTrips.sort((a, b) => {
          const distanceA = a.telemetryData ? calculateTotalDistance(a.telemetryData) : 0;
          const distanceB = b.telemetryData ? calculateTotalDistance(b.telemetryData) : 0;
          return distanceB - distanceA;
        });
        break;
      case 'distance-asc':
        sortedTrips.sort((a, b) => {
          const distanceA = a.telemetryData ? calculateTotalDistance(a.telemetryData) : 0;
          const distanceB = b.telemetryData ? calculateTotalDistance(b.telemetryData) : 0;
          return distanceA - distanceB;
        });
        break;
      default:
        // Default to newest first
        sortedTrips.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    }
    
    return sortedTrips;
  }
  
  // Load trips from storage
  async function loadTrips() {
    try {
      let tripsData = JSON.parse(localStorage.getItem('trips')) || [];
      
      // Sort by date (newest first)
      tripsData = tripsData.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
      
      trips = tripsData;
      renderTripList();
      
      if (trips.length > 0 && !selectedTripId) {
        selectTrip(trips[0].id);
      }
      
      return trips;
    } catch (error) {
      console.error('Error loading trips:', error);
      return [];
    }
  }
  
  // Attach event listeners
  tripSearchEl.addEventListener('input', (e) => {
    const searchText = e.target.value;
    const filteredTrips = filterTrips(searchText);
    const sortOption = tripSortEl.value;
    const sortedTrips = sortTrips(filteredTrips, sortOption);
    renderTripList(sortedTrips);
  });
  
  tripSortEl.addEventListener('change', (e) => {
    const sortOption = e.target.value;
    const searchText = tripSearchEl.value;
    const filteredTrips = filterTrips(searchText);
    const sortedTrips = sortTrips(filteredTrips, sortOption);
    renderTripList(sortedTrips);
  });
  
  receiptButton.addEventListener('click', () => {
    const trip = trips.find(t => t.id === selectedTripId);
    if (trip) {
      const event = new CustomEvent('viewReceipt', {
        detail: { trip }
      });
      componentEl.dispatchEvent(event);
    }
  });
  
  // Initialize component
  loadTrips();
  initMap();
  
  // Public API
  return {
    reload: loadTrips,
    selectTrip,
    getTripById: (id) => trips.find(trip => trip.id === id),
    getAllTrips: () => [...trips],
    el: componentEl,
    
    // Add event listeners
    on: (event, callback) => {
      componentEl.addEventListener(event, callback);
    },
    
    // Clean up resources
    destroy: () => {
      if (componentEl.parentNode) {
        componentEl.parentNode.removeChild(componentEl);
      }
    }
  };
}

export default TripHistoryViewer; 