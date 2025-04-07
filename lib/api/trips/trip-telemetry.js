/**
 * Trip Telemetry API
 * 
 * Retrieves telemetry data for a specific trip
 */

import { getTripById, addTripTelemetry } from '../../data/trips';

export default async function handler(req, res) {
  // Handle GET - retrieve telemetry for a trip
  if (req.method === 'GET') {
    try {
      const { tripId } = req.query;
      
      // Validate required parameters
      if (!tripId) {
        return res.status(400).json({ error: 'Trip ID is required' });
      }
      
      // Get the trip
      const trip = getTripById(tripId);
      
      if (!trip) {
        return res.status(404).json({ error: 'Trip not found' });
      }
      
      // Return the telemetry data
      return res.status(200).json({
        success: true,
        telemetry: trip.telemetryData || []
      });
    } catch (error) {
      console.error('Error retrieving trip telemetry:', error);
      return res.status(500).json({ 
        error: 'Failed to retrieve trip telemetry',
        message: error.message 
      });
    }
  } 
  // Handle POST - add telemetry data to a trip
  else if (req.method === 'POST') {
    try {
      const { tripId } = req.query;
      const telemetryData = req.body;
      
      // Validate required parameters
      if (!tripId) {
        return res.status(400).json({ error: 'Trip ID is required' });
      }
      
      if (!telemetryData || Object.keys(telemetryData).length === 0) {
        return res.status(400).json({ error: 'Telemetry data is required' });
      }
      
      // Add the telemetry data
      const success = addTripTelemetry(tripId, telemetryData);
      
      if (!success) {
        return res.status(404).json({ error: 'Failed to add telemetry data' });
      }
      
      // Return success
      return res.status(200).json({
        success: true,
        message: 'Telemetry data added successfully'
      });
    } catch (error) {
      console.error('Error adding trip telemetry:', error);
      return res.status(500).json({ 
        error: 'Failed to add trip telemetry',
        message: error.message 
      });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
} 