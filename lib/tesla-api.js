/**
 * Tesla API Client
 * Handles authentication and API calls to the Tesla Fleet API
 */

class TeslaAPI {
  constructor() {
    this.baseUrl = localStorage.getItem('TESLA_API_BASE_URL') || 'https://owner-api.teslamotors.com';
    this.authUrl = localStorage.getItem('TESLA_AUTH_URL') || 'https://auth.tesla.com/oauth2/v3';
    this.clientId = localStorage.getItem('TESLA_CLIENT_ID') || '';
    this.redirectUri = localStorage.getItem('TESLA_REDIRECT_URI') || '';
    this.accessToken = localStorage.getItem('tesla_access_token') || null;
    this.refreshToken = localStorage.getItem('tesla_refresh_token') || null;
    this.tokenExpiry = localStorage.getItem('tesla_token_expiry') || null;
    this.privateKey = localStorage.getItem('TESLA_PRIVATE_KEY') || null;
  }

  /**
   * Initializes the Tesla API client with environment variables
   * @param {Object} config Configuration object
   */
  init(config = {}) {
    if (config.clientId) {
      this.clientId = config.clientId;
      localStorage.setItem('TESLA_CLIENT_ID', config.clientId);
    }
    
    if (config.redirectUri) {
      this.redirectUri = config.redirectUri;
      localStorage.setItem('TESLA_REDIRECT_URI', config.redirectUri);
    }
    
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
      localStorage.setItem('TESLA_API_BASE_URL', config.baseUrl);
    }
    
    if (config.authUrl) {
      this.authUrl = config.authUrl;
      localStorage.setItem('TESLA_AUTH_URL', config.authUrl);
    }
    
    if (config.privateKey) {
      this.privateKey = config.privateKey;
      localStorage.setItem('TESLA_PRIVATE_KEY', config.privateKey);
    }
  }

  /**
   * Check if the user is authenticated with Tesla
   * @returns {Boolean} Whether the user is authenticated
   */
  isAuthenticated() {
    return !!this.accessToken && !!this.tokenExpiry && new Date(this.tokenExpiry) > new Date();
  }

  /**
   * Get the authorization URL for Tesla OAuth
   * @returns {String} Authorization URL
   */
  getAuthorizationUrl() {
    if (!this.clientId || !this.redirectUri) {
      throw new Error('Tesla API client ID and redirect URI must be set');
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid offline_access vehicle_device_data vehicle_cmds',
      state: Math.random().toString(36).substring(2, 15)
    });

    return `${this.authUrl}/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   * @param {String} code Authorization code
   * @returns {Promise<Object>} Token response
   */
  async exchangeCodeForTokens(code) {
    if (!code) {
      throw new Error('Authorization code is required');
    }

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.clientId,
      code,
      redirect_uri: this.redirectUri
    });

    try {
      const response = await fetch(`${this.authUrl}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error_description || 'Failed to exchange code for tokens');
      }
      
      this.setTokens(data);
      return data;
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw error;
    }
  }

  /**
   * Refresh the access token
   * @returns {Promise<Object>} Token response
   */
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('Refresh token is not available');
    }

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.clientId,
      refresh_token: this.refreshToken
    });

    try {
      const response = await fetch(`${this.authUrl}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error_description || 'Failed to refresh access token');
      }
      
      this.setTokens(data);
      return data;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      // Clear tokens if refresh fails
      this.clearTokens();
      throw error;
    }
  }

  /**
   * Set tokens in storage
   * @param {Object} tokens Token object
   */
  setTokens(tokens) {
    if (tokens.access_token) {
      this.accessToken = tokens.access_token;
      localStorage.setItem('tesla_access_token', tokens.access_token);
    }
    
    if (tokens.refresh_token) {
      this.refreshToken = tokens.refresh_token;
      localStorage.setItem('tesla_refresh_token', tokens.refresh_token);
    }
    
    if (tokens.expires_in) {
      const expiryDate = new Date();
      expiryDate.setSeconds(expiryDate.getSeconds() + tokens.expires_in);
      this.tokenExpiry = expiryDate.toISOString();
      localStorage.setItem('tesla_token_expiry', this.tokenExpiry);
    }
  }

  /**
   * Clear tokens from storage
   */
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    localStorage.removeItem('tesla_access_token');
    localStorage.removeItem('tesla_refresh_token');
    localStorage.removeItem('tesla_token_expiry');
  }

  /**
   * Sign a request payload with the private key
   * @param {Object|String} payload The payload to sign
   * @returns {String} Base64-encoded signature
   */
  async signRequest(payload) {
    if (!this.privateKey) {
      throw new Error('Private key is required for signing requests');
    }

    try {
      // Convert the privateKey from base64 to ArrayBuffer
      const privateKeyBase64 = this.privateKey;
      const binaryString = window.atob(privateKeyBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Import the private key
      const privateKey = await window.crypto.subtle.importKey(
        'pkcs8',
        bytes.buffer,
        {
          name: 'ECDSA',
          namedCurve: 'P-256',
        },
        false,
        ['sign']
      );
      
      // Prepare the payload
      const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
      const encoder = new TextEncoder();
      const data = encoder.encode(payloadStr);
      
      // Sign the payload
      const signature = await window.crypto.subtle.sign(
        {
          name: 'ECDSA',
          hash: {name: 'SHA-256'},
        },
        privateKey,
        data
      );
      
      // Convert signature to base64
      const signatureArray = new Uint8Array(signature);
      let signatureBase64 = '';
      for (let i = 0; i < signatureArray.length; i++) {
        signatureBase64 += String.fromCharCode(signatureArray[i]);
      }
      
      return btoa(signatureBase64);
    } catch (error) {
      console.error('Error signing request:', error);
      throw new Error('Failed to sign the request');
    }
  }

  /**
   * Make an authenticated request to the Tesla API with signature
   * @param {String} endpoint API endpoint
   * @param {Object} options Fetch options
   * @param {Boolean} requiresSignature Whether the request requires signature
   * @returns {Promise<Object>} API response
   */
  async requestWithSignature(endpoint, options = {}, requiresSignature = true) {
    // Ensure authentication
    if (!this.isAuthenticated()) {
      if (this.refreshToken) {
        await this.refreshAccessToken();
      } else {
        throw new Error('Not authenticated with Tesla');
      }
    }
    
    // Prepare request headers
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    // Sign request if required
    if (requiresSignature && this.privateKey) {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const requestBody = options.body ? JSON.parse(options.body) : {};
      
      const signaturePayload = {
        method: options.method || 'GET',
        endpoint,
        timestamp,
        body: requestBody
      };
      
      const signature = await this.signRequest(signaturePayload);
      
      headers['X-Tesla-Signature'] = signature;
      headers['X-Tesla-Timestamp'] = timestamp;
    }
    
    // Prepare full URL
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    // Make the request
    try {
      const response = await fetch(url, {
        ...options,
        headers
      });
      
      // Handle unauthorized errors
      if (response.status === 401) {
        // Try refreshing token
        await this.refreshAccessToken();
        
        // Retry request with new token
        return this.requestWithSignature(endpoint, options, requiresSignature);
      }
      
      // Parse response
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('Error making API request:', error);
      throw error;
    }
  }

  /**
   * Get a list of vehicles
   * @returns {Promise<Array>} List of vehicles
   */
  async getVehicles() {
    const response = await this.request('/api/1/vehicles');
    return response.response;
  }

  /**
   * Get vehicle data
   * @param {String} vehicleId Tesla vehicle ID
   * @returns {Promise<Object>} Vehicle data
   */
  async getVehicleData(vehicleId) {
    const response = await this.request(`/api/1/vehicles/${vehicleId}/vehicle_data`);
    return response.response;
  }

  /**
   * Get vehicle location
   * @param {String} vehicleId Tesla vehicle ID
   * @returns {Promise<Object>} Vehicle location
   */
  async getVehicleLocation(vehicleId) {
    const response = await this.request(`/api/1/vehicles/${vehicleId}/vehicle_data`);
    return response.response.drive_state;
  }

  /**
   * Wake up a vehicle
   * @param {String} vehicleId Tesla vehicle ID
   * @returns {Promise<Object>} Vehicle data
   */
  async wakeUpVehicle(vehicleId) {
    const response = await this.request(`/api/1/vehicles/${vehicleId}/wake_up`, {
      method: 'POST'
    });
    return response.response;
  }

  /**
   * Check if a vehicle is online
   * @param {String} vehicleId Tesla vehicle ID
   * @returns {Promise<Boolean>} Whether the vehicle is online
   */
  async isVehicleOnline(vehicleId) {
    try {
      const vehicle = await this.request(`/api/1/vehicles/${vehicleId}`);
      return vehicle.response.state === 'online';
    } catch (error) {
      console.error('Error checking vehicle status:', error);
      return false;
    }
  }

  /**
   * Get telemetry data for a vehicle
   * @param {String} vehicleId Vehicle ID
   * @returns {Promise<Object>} Telemetry data
   */
  async getVehicleTelemetry(vehicleId) {
    return this.requestWithSignature(`/api/1/vehicles/${vehicleId}/vehicle_data`, {
      method: 'GET'
    });
  }

  /**
   * Start streaming telemetry data
   * @param {String} vehicleId Vehicle ID
   * @param {Function} callback Callback function for data updates
   * @returns {Object} Stream controller object
   */
  startTelemetryStream(vehicleId, callback) {
    // Stream controller to manage the subscription
    const controller = {
      isActive: true,
      stop: () => {
        controller.isActive = false;
      }
    };
    
    // Set up polling interval
    const pollInterval = 5000; // 5 seconds by default
    
    const pollTelemetry = async () => {
      if (!controller.isActive) return;
      
      try {
        const data = await this.getVehicleTelemetry(vehicleId);
        
        if (callback && typeof callback === 'function') {
          callback(data);
        }
        
        // Schedule next poll if still active
        if (controller.isActive) {
          setTimeout(pollTelemetry, pollInterval);
        }
      } catch (error) {
        console.error('Error polling telemetry:', error);
        
        // Retry after a delay
        if (controller.isActive) {
          setTimeout(pollTelemetry, pollInterval * 2);
        }
      }
    };
    
    // Start polling
    pollTelemetry();
    
    return controller;
  }
}

// Create a singleton instance
const teslaApi = new TeslaAPI();

export default teslaApi; 