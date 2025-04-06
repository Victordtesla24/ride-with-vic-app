/**
 * Vehicle Selector Component
 * 
 * This component allows users to select a Tesla vehicle for trip tracking.
 */

import React, { useState, useEffect } from 'react';
import { getVehicles, saveVehicles } from 'models/vehicle.js';
import teslaApi from 'lib/tesla-api.js';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert
} from '@mui/material';

class VehicleSelector {
  constructor(containerId, onVehicleSelect) {
    if (typeof containerId === 'string') {
      this.container = document.getElementById(containerId);
    } else {
      // If containerId is actually an HTMLElement
      this.container = containerId;
    }
    this.onVehicleSelect = onVehicleSelect || function() {};
    this.isLoading = false;
    this.vehicles = [];
    this.selectedVehicleId = null;
    
    // Create event emitter for compatibility with new integration
    this.eventListeners = {};
  }
  
  /**
   * Initialize the vehicle selector
   */
  init() {
    this.render();
  }
  
  /**
   * Load vehicles from local storage or fetch from Tesla API
   */
  async loadVehicles() {
    this.setLoading(true);
    
    try {
      // Get vehicles from local storage
      const vehicles = getVehicles();
      
      // If no vehicles, check if we're authenticated with Tesla
      if (vehicles.length === 0) {
        if (teslaApi.isAuthenticated()) {
          // Fetch vehicles from Tesla API
          try {
            const response = await fetch('/api/vehicle/list');
            const data = await response.json();
            
            if (data.success) {
              this.vehicles = data.vehicles;
            } else {
              throw new Error(data.error || 'Failed to fetch vehicles');
            }
          } catch (error) {
            console.error('Error fetching vehicles:', error);
            this.showError('Failed to fetch vehicles. Please try again.');
          }
        } else {
          // Show connect button
          this.showConnectButton();
          return;
        }
      } else {
        this.vehicles = vehicles;
      }
      
      this.renderVehicles();
    } catch (error) {
      console.error('Error loading vehicles:', error);
      this.showError('Failed to load vehicles. Please try again.');
    } finally {
      this.setLoading(false);
    }
  }
  
  /**
   * Render the vehicle selector
   */
  render() {
    if (!this.container) {
      console.error('Vehicle selector container not found');
      return;
    }
    
    this.container.innerHTML = `
      <div class="vehicle-selector">
        <h3>Select a Tesla Vehicle</h3>
        <div id="vehicle-selector-content" class="vehicle-selector-content">
          <div class="vehicle-loading">Loading vehicles...</div>
        </div>
      </div>
    `;
    
    this.contentContainer = this.container.querySelector('.vehicle-selector-content');
    this.loadVehicles();
  }
  
  /**
   * Set vehicles (for direct integration)
   * @param {Array} vehicles Array of vehicle objects
   */
  setVehicles(vehicles) {
    this.vehicles = vehicles || [];
    
    // Save vehicles to storage
    saveVehicles(this.vehicles);
    
    // Render the vehicles
    this.renderVehicles();
    
    // If there's only one vehicle, select it automatically
    if (this.vehicles.length === 1) {
      this.selectVehicle(this.vehicles[0].id);
    }
  }
  
  /**
   * Clear vehicles (for direct integration)
   */
  clearVehicles() {
    this.vehicles = [];
    this.selectedVehicleId = null;
    this.renderVehicles();
  }
  
  /**
   * Render the vehicles in the selector
   */
  renderVehicles() {
    if (!this.contentContainer) return;
    
    if (this.vehicles.length === 0) {
      this.contentContainer.innerHTML = `
        <div class="vehicle-empty">
          <p>No Tesla vehicles found.</p>
          <button id="btn-connect-tesla" class="btn btn-primary">Connect Tesla Account</button>
        </div>
      `;
      
      this.container.querySelector('#btn-connect-tesla')?.addEventListener('click', this.connectTesla.bind(this));
      return;
    }
    
    let vehiclesHtml = '<div class="vehicle-list">';
    
    this.vehicles.forEach(vehicle => {
      const isOnline = vehicle.state === 'online';
      const statusClass = isOnline ? 'status-online' : 'status-offline';
      const statusText = isOnline ? 'Online' : 'Offline';
      
      vehiclesHtml += `
        <div class="vehicle-item ${this.selectedVehicleId === vehicle.id ? 'selected' : ''}" data-id="${vehicle.id}">
          <div class="vehicle-info">
            <h4>${vehicle.display_name || vehicle.name}</h4>
            <p>${vehicle.model || 'Tesla'}</p>
            <p class="vehicle-status ${statusClass}">${statusText}</p>
          </div>
          <div class="vehicle-actions">
            <button class="btn btn-select" data-id="${vehicle.id}">Select</button>
            ${isOnline ? '' : `<button class="btn btn-wake" data-id="${vehicle.id}">Wake Up</button>`}
          </div>
        </div>
      `;
    });
    
    vehiclesHtml += '</div>';
    
    this.contentContainer.innerHTML = vehiclesHtml;
    
    // Add event listeners
    const selectButtons = this.contentContainer.querySelectorAll('.btn-select');
    selectButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const vehicleId = e.target.dataset.id;
        this.selectVehicle(vehicleId);
      });
    });
    
    const wakeButtons = this.contentContainer.querySelectorAll('.btn-wake');
    wakeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const vehicleId = e.target.dataset.id;
        this.wakeVehicle(vehicleId);
      });
    });
  }
  
  /**
   * Show the connect button when not authenticated
   */
  showConnectButton() {
    if (!this.contentContainer) return;
    
    this.contentContainer.innerHTML = `
      <div class="vehicle-empty">
        <p>Connect your Tesla account to access your vehicles.</p>
        <button id="btn-connect-tesla" class="btn btn-primary">Connect Tesla Account</button>
      </div>
    `;
    
    this.container.querySelector('#btn-connect-tesla')?.addEventListener('click', this.connectTesla.bind(this));
  }
  
  /**
   * Connect to Tesla account via OAuth
   */
  connectTesla() {
    try {
      // Redirect to Tesla auth endpoint
      window.location.href = '/api/auth/tesla';
    } catch (error) {
      console.error('Error connecting to Tesla:', error);
      this.showError('Failed to connect to Tesla. Please try again.');
    }
  }
  
  /**
   * Select a vehicle
   * @param {String} vehicleId Vehicle ID
   */
  selectVehicle(vehicleId) {
    this.selectedVehicleId = vehicleId;
    
    // Find the selected vehicle
    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    
    if (vehicle) {
      // Call the callback function with the selected vehicle
      this.onVehicleSelect(vehicle);
      
      // Update UI to show selected vehicle
      const vehicleItems = this.contentContainer.querySelectorAll('.vehicle-item');
      vehicleItems.forEach(item => {
        if (item.dataset.id === vehicleId) {
          item.classList.add('selected');
        } else {
          item.classList.remove('selected');
        }
      });
      
      // Dispatch vehicle selected event for compatibility with new integration
      this.emit('vehicleSelected', { vehicle });
    }
  }
  
  /**
   * Wake up a vehicle
   * @param {String} vehicleId Vehicle ID
   */
  async wakeVehicle(vehicleId) {
    try {
      // Find the vehicle item in the DOM
      const vehicleItem = this.contentContainer.querySelector(`.vehicle-item[data-id="${vehicleId}"]`);
      if (vehicleItem) {
        const wakeButton = vehicleItem.querySelector('.btn-wake');
        if (wakeButton) {
          wakeButton.disabled = true;
          wakeButton.textContent = 'Waking...';
        }
      }
      
      // Call the wake API endpoint
      const response = await fetch(`/api/vehicle/wake?vehicleId=${vehicleId}`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update the vehicle state
        const vehicleIndex = this.vehicles.findIndex(v => v.id === vehicleId);
        if (vehicleIndex !== -1) {
          this.vehicles[vehicleIndex].state = 'online';
          this.renderVehicles();
        }
      } else {
        throw new Error(data.error || 'Failed to wake vehicle');
      }
    } catch (error) {
      console.error('Error waking vehicle:', error);
      this.showError('Failed to wake vehicle. Please try again.');
    }
  }
  
  /**
   * Show error message
   * @param {String} message Error message
   */
  showError(message) {
    if (!this.contentContainer) return;
    
    const errorHtml = `
      <div class="vehicle-error">
        <p>${message}</p>
        <button class="btn btn-retry">Retry</button>
      </div>
    `;
    
    this.contentContainer.innerHTML = errorHtml;
    
    this.container.querySelector('.btn-retry')?.addEventListener('click', () => {
      this.loadVehicles();
    });
  }
  
  /**
   * Set loading state
   * @param {Boolean} isLoading Whether loading is in progress
   */
  setLoading(isLoading) {
    this.isLoading = isLoading;
    
    if (isLoading && this.contentContainer) {
      this.contentContainer.innerHTML = '<div class="vehicle-loading">Loading vehicles...</div>';
    }
  }
  
  /**
   * Add event listener for compatibility with new integration
   * @param {String} event Event name
   * @param {Function} callback Callback function
   */
  on(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }
  
  /**
   * Emit event for compatibility with new integration
   * @param {String} event Event name
   * @param {Object} data Event data
   */
  emit(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }
  
  /**
   * Get the selected vehicle
   * @returns {Object|null} Selected vehicle or null
   */
  getSelectedVehicle() {
    return this.vehicles.find(v => v.id === this.selectedVehicleId) || null;
  }
}

// Export both class and factory function for compatibility
export default VehicleSelector;

// Factory function for new integration
export function VehicleSelectorFactory(container, options = {}) {
  const selector = new VehicleSelector(container);
  selector.init();
  return selector;
}