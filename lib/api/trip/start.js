/**
 * API endpoint to start a trip with Tesla vehicle
 * Handles initializing a trip, storing start location and setting up telemetry tracking
 */

import { v4 as uuidv4 } from 'uuid';
import teslaApi from 'lib/tesla-api.js';
import { getVehicleById } from 'models/vehicle.js';
import { saveTrip } from 'models/trip.js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { vehicleId, startLocation, endLocation } = req.body;

    // Validate required fields
    if (!vehicleId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Vehicle ID is required' 
      });
    }

    if (!startLocation || !startLocation.address) {
      return res.status(400).json({ 
        success: false, 
        error: 'Start location is required' 
      });
    }

    if (!endLocation || !endLocation.address) {
      return res.status(400).json({ 
        success: false, 
        error: 'End location is required' 
      });
    }

    // Get vehicle details
    const vehicle = await getVehicleById(vehicleId);
    
    if (!vehicle) {
      return res.status(404).json({ 
        success: false, 
        error: 'Vehicle not found' 
      });
    }

    // Check if vehicle is online
    if (vehicle.state !== 'online') {
      // Try to wake vehicle
      try {
        await teslaApi.wakeUpVehicle(vehicleId);
        
        // Wait for vehicle to wake up (max 20 seconds)
        let isOnline = false;
        for (let i = 0; i < 10; i++) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          isOnline = await teslaApi.isVehicleOnline(vehicleId);
          if (isOnline) break;
        }
        
        if (!isOnline) {
          return res.status(400).json({ 
            success: false, 
            error: 'Vehicle is offline and could not be woken' 
          });
        }
      } catch (error) {
        console.error('Error waking vehicle:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to wake vehicle' 
        });
      }
    }

    // Get current vehicle location
    const locationData = await teslaApi.getVehicleLocation(vehicleId);
    
    if (!locationData || !locationData.latitude || !locationData.longitude) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to get vehicle location' 
      });
    }

    // Create trip object
    const tripId = uuidv4();
    const now = new Date();
    
    const trip = {
      id: tripId,
      customerId: 'guest', // In a real app, this would be the authenticated user's ID
      vehicleId: vehicleId,
      status: 'active',
      startTime: now.toISOString(),
      startLocation: {
        address: startLocation.address,
        label: startLocation.label,
        latitude: locationData.latitude,
        longitude: locationData.longitude
      },
      endLocation: {
        address: endLocation.address,
        label: endLocation.label,
        latitude: null,
        longitude: null
      },
      estimatedFare: 0, // Will be calculated based on distance and time
      telemetryData: [{
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        timestamp: now.toISOString(),
        speed: locationData.speed || 0
      }]
    };

    // Save trip to database
    await saveTrip(trip);

    // Return success response with trip ID
    return res.status(200).json({ 
      success: true, 
      tripId: tripId,
      trip: trip
    });
  } catch (error) {
    console.error('Error starting trip:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to start trip' 
    });
  }
} 