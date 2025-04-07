/**
 * Tesla API Connection Test Endpoint
 * 
 * This endpoint tests the connection to the Tesla API without exposing credentials.
 */

import fetch from 'node-fetch';

// Constants
const TESLA_API_BASE_URL = process.env.NEXT_PUBLIC_TESLA_API_BASE_URL || 'https://owner-api.teslamotors.com';

export default async function handler(req, res) {
  try {
    // Simple test request to check if the Tesla API is reachable
    const response = await fetch(`${TESLA_API_BASE_URL}/api/1/vehicles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'RideWithVic/1.0'
      }
    });

    // Verify that the API is responding (401 is expected since we're not authenticated)
    if (response.status === 401) {
      res.status(200).json({
        success: true,
        message: 'Tesla API is reachable and responding with expected authentication requirement',
        statusCode: response.status
      });
    } else {
      res.status(200).json({
        success: false,
        error: `Unexpected response from Tesla API. Status: ${response.status}`,
        statusCode: response.status
      });
    }
  } catch (error) {
    console.error('Tesla API connection test failed:', error);
    res.status(500).json({
      success: false,
      error: `Failed to connect to Tesla API: ${error.message}`
    });
  }
} 