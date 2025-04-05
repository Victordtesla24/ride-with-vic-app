/**
 * Uber API Client
 * Handles Uber API interaction for fare estimates
 */

class UberAPI {
  constructor() {
    this.clientId = null;
    this.serverToken = null;
    this.baseUrl = 'https://api.uber.com/v1.2';
    this.cachedEstimates = new Map();
    this.cacheExpiry = 15 * 60 * 1000; // 15 minutes
  }

  /**
   * Initialize Uber API with credentials
   * @param {Object} config Configuration object
   * @param {string} config.clientId Uber client ID
   * @param {string} config.serverToken Uber server token
   */
  init({ clientId, serverToken }) {
    this.clientId = clientId;
    this.serverToken = serverToken;
  }

  /**
   * Get fare estimate for a trip
   * @param {Object} params Fare estimate parameters
   * @param {number} params.startLat Starting latitude
   * @param {number} params.startLng Starting longitude
   * @param {number} params.endLat Ending latitude
   * @param {number} params.endLng Ending longitude
   * @returns {Promise<Object>} Fare estimate data
   */
  async getFareEstimate(params) {
    if (!this.serverToken) {
      throw new Error('Uber API not initialized');
    }

    try {
      const { startLat, startLng, endLat, endLng } = params;
      
      // Create cache key based on coordinates
      const cacheKey = `${startLat},${startLng}|${endLat},${endLng}`;
      
      // Check cache first
      const cachedData = this.getCachedEstimate(cacheKey);
      if (cachedData) {
        console.log('Using cached fare estimate');
        return cachedData;
      }
      
      // Build the URL for fare estimates
      const url = new URL(`${this.baseUrl}/estimates/price`);
      url.search = new URLSearchParams({
        start_latitude: startLat,
        start_longitude: startLng,
        end_latitude: endLat,
        end_longitude: endLng
      }).toString();
      
      // Make the API request
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.serverToken}`,
          'Accept-Language': 'en_US',
          'Content-Type': 'application/json'
        },
        timeout: 5000 // 5 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`Uber API returned ${response.status}`);
      }
      
      const data = await response.json();
      
      // Format the response
      const formattedResponse = this.formatApiResponse(data);
      
      // Cache the response
      this.cacheEstimate(cacheKey, formattedResponse);
      
      return formattedResponse;
    } catch (error) {
      console.error('Error getting fare estimate:', error);
      throw new Error('Unable to get fare estimate from Uber API. Please try again later.');
    }
  }

  /**
   * Format the API response to a consistent structure
   * @param {Object} apiResponse Raw API response
   * @returns {Object} Formatted response
   */
  formatApiResponse(apiResponse) {
    // Extract the prices from the response
    const prices = apiResponse.prices || [];
    
    // Map to our internal format
    return {
      fare: {
        value: prices[0]?.estimate || '0.00',
        currency: prices[0]?.currency_code || 'USD',
        breakdown: {
          base: prices[0]?.base || 0,
          distance: prices[0]?.distance_rate || 0,
          time: prices[0]?.time_rate || 0
        }
      },
      trip: {
        distance_km: prices[0]?.distance || 0,
        duration_min: prices[0]?.duration / 60 || 0
      },
      prices: prices.map(price => ({
        service: price.display_name,
        estimate: price.estimate,
        minEstimate: price.low_estimate,
        maxEstimate: price.high_estimate,
        currencyCode: price.currency_code,
        duration: price.duration / 60, // Convert to minutes
        distance: price.distance
      }))
    };
  }

  /**
   * Get cached estimate if available and not expired
   * @param {string} key Cache key
   * @returns {Object|null} Cached estimate or null
   */
  getCachedEstimate(key) {
    if (!this.cachedEstimates.has(key)) return null;
    
    const { data, timestamp } = this.cachedEstimates.get(key);
    const now = Date.now();
    
    // Check if cache is expired
    if (now - timestamp > this.cacheExpiry) {
      this.cachedEstimates.delete(key);
      return null;
    }
    
    return data;
  }

  /**
   * Cache an estimate
   * @param {string} key Cache key
   * @param {Object} data Estimate data
   */
  cacheEstimate(key, data) {
    this.cachedEstimates.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

export default UberAPI; 