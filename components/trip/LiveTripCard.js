/**
 * LiveTripCard Component
 * Real-time display of active trip information
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Chip,
  Grid,
  Avatar,
  IconButton,
  Tooltip,
  LinearProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material';

/**
 * Initialize LiveTripCard component
 * @param {HTMLElement} container The container element
 * @param {Object} options Configuration options
 * @returns {Object} Component API
 */
export function LiveTripCard(container, options = {}) {
  // Private variables
  let tripData = null;
  let intervalId = null;
  let mapElement = null;
  let map = null;
  let marker = null;
  let path = null;
  let locationPoints = [];
  let isTracking = false;
  
  // Create component structure
  const componentEl = document.createElement('div');
  componentEl.className = 'live-trip-card';
  componentEl.innerHTML = `
    <div class="live-trip-header">
      <h3>Live Trip</h3>
      <div class="status-indicator">
        <span class="status-dot"></span>
        <span class="status-text">Inactive</span>
      </div>
    </div>
    <div class="live-trip-map"></div>
    <div class="live-trip-info">
      <div class="info-item">
        <span class="info-label">Duration</span>
        <span class="info-value duration">00:00:00</span>
      </div>
      <div class="info-item">
        <span class="info-label">Distance</span>
        <span class="info-value distance">0.0 mi</span>
      </div>
      <div class="info-item">
        <span class="info-label">Current Fare</span>
        <span class="info-value fare">$0.00</span>
      </div>
    </div>
    <div class="live-trip-customer">
      <span class="customer-label">Customer:</span>
      <span class="customer-name">None selected</span>
    </div>
    <div class="live-trip-actions">
      <button class="btn btn-start">Start Trip</button>
      <button class="btn btn-end" disabled>End Trip</button>
    </div>
  `;
  
  // Append to container
  container.appendChild(componentEl);
  
  // Get element references
  mapElement = componentEl.querySelector('.live-trip-map');
  const durationEl = componentEl.querySelector('.info-value.duration');
  const distanceEl = componentEl.querySelector('.info-value.distance');
  const fareEl = componentEl.querySelector('.info-value.fare');
  const customerNameEl = componentEl.querySelector('.customer-name');
  const statusDotEl = componentEl.querySelector('.status-dot');
  const statusTextEl = componentEl.querySelector('.status-text');
  const startButton = componentEl.querySelector('.btn-start');
  const endButton = componentEl.querySelector('.btn-end');
  
  // Initialize map if Google Maps is available
  function initMap() {
    if (window.google && window.google.maps) {
      map = new google.maps.Map(mapElement, {
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
  
  // Format duration in HH:MM:SS
  function formatDuration(durationMs) {
    const seconds = Math.floor(durationMs / 1000) % 60;
    const minutes = Math.floor(durationMs / (1000 * 60)) % 60;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
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
  
  // Calculate total distance from location points
  function calculateTotalDistance() {
    if (locationPoints.length < 2) return 0;
    
    let total = 0;
    for (let i = 1; i < locationPoints.length; i++) {
      const prev = locationPoints[i-1];
      const curr = locationPoints[i];
      total += calculateDistance(
        prev.latitude, 
        prev.longitude, 
        curr.latitude, 
        curr.longitude
      );
    }
    
    return total;
  }
  
  // Calculate fare based on distance and time
  function calculateFare(distance, durationMs) {
    // Base fare: $2.50
    // Per mile: $1.50
    // Per minute: $0.30
    const baseFare = 2.50;
    const perMile = 1.50;
    const perMinute = 0.30;
    
    const minutes = durationMs / (1000 * 60);
    
    return baseFare + (distance * perMile) + (minutes * perMinute);
  }
  
  // Update trip info display
  function updateTripInfo() {
    if (!tripData || !isTracking) return;
    
    const now = new Date();
    const durationMs = now - new Date(tripData.startTime);
    const distance = calculateTotalDistance();
    const fare = calculateFare(distance, durationMs);
    
    durationEl.textContent = formatDuration(durationMs);
    distanceEl.textContent = `${distance.toFixed(1)} mi`;
    fareEl.textContent = `$${fare.toFixed(2)}`;
    
    // Update trip data
    tripData.telemetryData = locationPoints;
    tripData.estimatedFare = fare;
  }
  
  // Update vehicle location on map
  async function updateVehicleLocation() {
    if (!isTracking || !tripData || !tripData.vehicleId) return;
    
    try {
      const response = await fetch(`/api/vehicle/telemetry?vehicleId=${tripData.vehicleId}`);
      const data = await response.json();
      
      if (data.success && data.location) {
        const { latitude, longitude, timestamp } = data.location;
        
        // Update map position
        if (map && marker) {
          const position = { lat: latitude, lng: longitude };
          marker.setPosition(position);
          
          // Center map if auto-center is enabled
          if (options.autoCenter) {
            map.setCenter(position);
          }
          
          // Add point to path
          if (path) {
            const currentPath = path.getPath();
            currentPath.push(new google.maps.LatLng(latitude, longitude));
          }
        }
        
        // Add to location points array
        locationPoints.push({
          latitude,
          longitude,
          timestamp,
          speed: data.speed || 0
        });
        
        // Update trip info
        updateTripInfo();
        
        // Upload telemetry point to server
        await fetch(`/api/trip/update?tripId=${tripData.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            telemetryPoint: {
              latitude,
              longitude,
              timestamp,
              speed: data.speed || 0
            }
          })
        });
      }
    } catch (error) {
      console.error('Error updating vehicle location:', error);
    }
  }
  
  // Start tracking
  async function startTracking(customerId, vehicleId) {
    if (isTracking) return;
    
    try {
      // Initialize map if not already initialized
      if (!map) {
        const mapInitialized = initMap();
        if (!mapInitialized) {
          throw new Error('Google Maps could not be initialized');
        }
      }
      
      // Check if vehicle is online
      const vehicleResponse = await fetch(`/api/vehicle/wake?vehicleId=${vehicleId}`);
      const vehicleData = await vehicleResponse.json();
      
      if (!vehicleData.success) {
        throw new Error('Failed to wake up vehicle');
      }
      
      // Get initial location
      const locationResponse = await fetch(`/api/vehicle/location?vehicleId=${vehicleId}`);
      const locationData = await locationResponse.json();
      
      if (!locationData.success || !locationData.location) {
        throw new Error('Failed to get vehicle location');
      }
      
      // Start a new trip on the server
      const startResponse = await fetch('/api/trip/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerId,
          vehicleId,
          startLocation: locationData.location
        })
      });
      
      const startData = await startResponse.json();
      
      if (!startData.success || !startData.trip) {
        throw new Error('Failed to start trip');
      }
      
      // Store trip data
      tripData = startData.trip;
      
      // Update customer display
      if (tripData.customerName) {
        customerNameEl.textContent = tripData.customerName;
      }
      
      // Clear previous location points
      locationPoints = [];
      
      // Add initial location point
      locationPoints.push(locationData.location);
      
      // Update map
      if (map && marker) {
        const position = { 
          lat: locationData.location.latitude, 
          lng: locationData.location.longitude 
        };
        marker.setPosition(position);
        map.setCenter(position);
        map.setZoom(16);
        
        // Clear previous path
        if (path) {
          path.setPath([]);
          path.getPath().push(new google.maps.LatLng(
            locationData.location.latitude,
            locationData.location.longitude
          ));
        }
      }
      
      // Set up telemetry streaming
      let telemetryController = await fetch(`/api/vehicle/telemetry?vehicleId=${vehicleId}&stream=true`, {
        method: 'POST'
      }).then(res => res.json());
      
      // Set tracking state
      isTracking = true;
      
      // Update UI state
      statusDotEl.classList.add('active');
      statusTextEl.textContent = 'Active';
      startButton.disabled = true;
      endButton.disabled = false;
      
      // Start periodic updates
      intervalId = setInterval(updateTripInfo, 1000);
    } catch (error) {
      console.error('Error starting trip:', error);
      alert('Failed to start trip: ' + error.message);
    }
  }
  
  // End tracking
  async function endTracking() {
    if (!isTracking || !tripData) return;
    
    try {
      // Stop location updates
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      
      // Final location update
      await updateVehicleLocation();
      
      // End trip
      const response = await fetch('/api/trip/end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tripId: tripData.id,
          telemetryData: locationPoints,
          finalLocation: locationPoints[locationPoints.length - 1] || {}
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to end trip');
      }
      
      const endedTrip = await response.json();
      
      // Update UI
      isTracking = false;
      statusDotEl.classList.remove('active');
      statusTextEl.textContent = 'Inactive';
      startButton.disabled = false;
      endButton.disabled = true;
      
      // Clear trip data
      tripData = null;
      locationPoints = [];
      
      // Reset info displays
      durationEl.textContent = '00:00:00';
      distanceEl.textContent = '0.0 mi';
      fareEl.textContent = '$0.00';
      customerNameEl.textContent = 'None selected';
      
      return endedTrip;
    } catch (error) {
      console.error('Error ending trip:', error);
      alert(`Failed to end trip: ${error.message}`);
      return null;
    }
  }
  
  // Attach event listeners
  startButton.addEventListener('click', () => {
    // Dispatch custom event for parent components to handle
    const event = new CustomEvent('requestStartTrip');
    componentEl.dispatchEvent(event);
  });
  
  endButton.addEventListener('click', async () => {
    const endedTrip = await endTracking();
    
    if (endedTrip) {
      // Dispatch custom event with trip data
      const event = new CustomEvent('tripEnded', {
        detail: { trip: endedTrip }
      });
      componentEl.dispatchEvent(event);
    }
  });
  
  // Public API
  return {
    startTrip: startTracking,
    endTrip: endTracking,
    isTracking: () => isTracking,
    getCurrentTrip: () => tripData,
    el: componentEl,
    
    // Add event listeners
    on: (event, callback) => {
      componentEl.addEventListener(event, callback);
    },
    
    // Clean up resources
    destroy: () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      
      if (componentEl.parentNode) {
        componentEl.parentNode.removeChild(componentEl);
      }
    }
  };
}

export default LiveTripCard; 