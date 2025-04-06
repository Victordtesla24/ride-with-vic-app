/**
 * Tesla API Client
 * Handles authentication and API calls to the Tesla Fleet API
 */

class TeslaAPI {
  constructor() {
    // Use Next.js public environment variables if available
    this.baseUrl = typeof window !== 'undefined' 
      ? (localStorage.getItem('TESLA_API_BASE_URL') || process.env.NEXT_PUBLIC_TESLA_API_BASE_URL || 'https://fleet-api.prd.eu.vn.cloud.tesla.com')
      : (process.env.NEXT_PUBLIC_TESLA_API_BASE_URL || 'https://fleet-api.prd.eu.vn.cloud.tesla.com');
    
    this.authUrl = typeof window !== 'undefined'
      ? (localStorage.getItem('TESLA_AUTH_URL') || process.env.NEXT_PUBLIC_TESLA_AUTH_URL || 'https://auth.tesla.com/oauth2/v3')
      : (process.env.NEXT_PUBLIC_TESLA_AUTH_URL || 'https://auth.tesla.com/oauth2/v3');
    
    this.clientId = typeof window !== 'undefined'
      ? (localStorage.getItem('TESLA_CLIENT_ID') || process.env.NEXT_PUBLIC_TESLA_CLIENT_ID || '')
      : (process.env.NEXT_PUBLIC_TESLA_CLIENT_ID || '');
    
    this.redirectUri = typeof window !== 'undefined'
      ? (localStorage.getItem('TESLA_REDIRECT_URI') || process.env.NEXT_PUBLIC_TESLA_REDIRECT_URI || '')
      : (process.env.NEXT_PUBLIC_TESLA_REDIRECT_URI || '');
    
    // Client-side only properties
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('tesla_access_token') || null;
      this.refreshToken = localStorage.getItem('tesla_refresh_token') || null;
      this.tokenExpiry = localStorage.getItem('tesla_token_expiry') || null;
      this.privateKey = localStorage.getItem('TESLA_PRIVATE_KEY') || null;
    } else {
      this.accessToken = null;
      this.refreshToken = null;
      this.tokenExpiry = null;
      this.privateKey = null;
    }
  }

  /**
   * Initializes the Tesla API client with environment variables
   * @param {Object} config Configuration object
   */
  init(config = {}) {
    // Handle server-side rendering
    if (typeof window === 'undefined') {
      if (config.clientId) this.clientId = config.clientId;
      if (config.redirectUri) this.redirectUri = config.redirectUri;
      if (config.baseUrl) this.baseUrl = config.baseUrl;
      if (config.authUrl) this.authUrl = config.authUrl;
      if (config.clientSecret) this.clientSecret = config.clientSecret;
      
      // Load private key from file path if provided, otherwise use direct key
      if (config.privateKeyPath) {
        try {
          // Use dynamic import for fs in ESM
          import('fs').then(fs => {
            fs.readFile(config.privateKeyPath, 'utf8', (err, data) => {
              if (err) {
                console.error('Error loading private key file:', err);
              } else {
                this.privateKey = data;
              }
            });
          }).catch(err => {
            console.error('Error importing fs module:', err);
          });
        } catch (error) {
          console.error('Error loading private key file:', error);
        }
      } else if (config.privateKey) {
        this.privateKey = config.privateKey;
      }
      
      return;
    }
    
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
    
    if (config.clientSecret) {
      this.clientSecret = config.clientSecret;
      localStorage.setItem('TESLA_CLIENT_SECRET', config.clientSecret);
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
    // Handle server-side rendering
    if (typeof window === 'undefined') {
      return false;
    }
    
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
      scope: 'openid offline_access vehicle_device_data vehicle_cmds vehicle_charging_cmds',
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
    // Handle server-side rendering
    if (typeof window === 'undefined') {
      return;
    }
    
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
    // Handle server-side rendering
    if (typeof window === 'undefined') {
      return;
    }
    
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
   * Makes an API request with proper authentication
   * @param {String} endpoint API endpoint to call
   * @param {Object} options Request options
   * @returns {Promise<Object>} API response
   */
  async request(endpoint, options = {}) {
    // Ensure we have a valid token
    if (this.tokenExpiry && new Date(this.tokenExpiry) <= new Date()) {
      await this.refreshAccessToken();
    }

    if (!this.accessToken) {
      throw new Error('Not authenticated with Tesla API');
    }

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    const requestOptions = {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': options.headers?.['Content-Type'] || 'application/json'
      }
    };

    try {
      const response = await fetch(url, requestOptions);
      
      // Check if token expired during request
      if (response.status === 401) {
        // Try to refresh token
        await this.refreshAccessToken();
        
        // Retry request with new token
        requestOptions.headers['Authorization'] = `Bearer ${this.accessToken}`;
        const retryResponse = await fetch(url, requestOptions);
        
        if (!retryResponse.ok) {
          const errorData = await retryResponse.json();
          throw new Error(errorData.error || `Tesla API request failed: ${retryResponse.status}`);
        }
        
        return await retryResponse.json();
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Tesla API request failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Tesla API request failed:', error);
      throw error;
    }
  }

  /**
   * Get the list of vehicles
   * @returns {Promise<Array>} List of vehicles
   */
  async getVehicles() {
    return this.request('/api/1/vehicles');
  }

  /**
   * Get data for a specific vehicle
   * @param {String} vehicleId Vehicle ID
   * @returns {Promise<Object>} Vehicle data
   */
  async getVehicleData(vehicleId) {
    return this.request(`/api/1/vehicles/${vehicleId}/vehicle_data`);
  }

  /**
   * Get the current location of a vehicle
   * @param {String} vehicleId Vehicle ID
   * @returns {Promise<Object>} Vehicle location
   */
  async getVehicleLocation(vehicleId) {
    try {
      const data = await this.request(`/api/1/vehicles/${vehicleId}/vehicle_data`);
      
      if (data && data.response && data.response.drive_state) {
        const { latitude, longitude, heading, timestamp } = data.response.drive_state;
        
        return {
          latitude,
          longitude,
          heading,
          timestamp,
          success: true
        };
      }
      
      throw new Error('Location data not available');
    } catch (error) {
      console.error('Error getting vehicle location:', error);
      throw error;
    }
  }

  /**
   * Wake up a sleeping vehicle
   * @param {String} vehicleId Vehicle ID
   * @returns {Promise<Object>} Wake up response
   */
  async wakeUpVehicle(vehicleId) {
    return this.request(`/api/1/vehicles/${vehicleId}/wake_up`, { method: 'POST' });
  }

  /**
   * Check if a vehicle is online
   * @param {String} vehicleId Vehicle ID
   * @returns {Promise<Boolean>} Whether the vehicle is online
   */
  async isVehicleOnline(vehicleId) {
    try {
      const data = await this.request(`/api/1/vehicles/${vehicleId}`);
      
      if (data && data.response) {
        return data.response.state === 'online';
      }
      
      return false;
    } catch (error) {
      console.error('Error checking vehicle online status:', error);
      return false;
    }
  }

  /**
   * Get vehicle telemetry data
   * @param {String} vehicleId Vehicle ID
   * @returns {Promise<Object>} Telemetry data
   */
  async getVehicleTelemetry(vehicleId) {
    try {
      const data = await this.request(`/api/1/vehicles/${vehicleId}/vehicle_data`);
      
      if (data && data.response) {
        return {
          drive_state: data.response.drive_state,
          climate_state: data.response.climate_state,
          charge_state: data.response.charge_state,
          vehicle_state: data.response.vehicle_state,
          success: true
        };
      }
      
      throw new Error('Telemetry data not available');
    } catch (error) {
      console.error('Error getting vehicle telemetry:', error);
      throw error;
    }
  }

  /**
   * Start a telemetry stream for a vehicle
   * @param {String} vehicleId Vehicle ID
   * @param {Function} callback Callback function for data updates
   * @returns {Object} Stream controller
   */
  startTelemetryStream(vehicleId, callback) {
    const controller = {
      interval: null,
      isRunning: false,
      stop: () => {
        if (controller.interval) {
          clearInterval(controller.interval);
          controller.interval = null;
          controller.isRunning = false;
        }
      }
    };
    
    const pollTelemetry = async () => {
      try {
        const data = await this.getVehicleTelemetry(vehicleId);
        callback(data, null);
      } catch (error) {
        callback(null, error);
      }
    };
    
    // Poll every 5 seconds
    controller.interval = setInterval(pollTelemetry, 5000);
    controller.isRunning = true;
    
    // First poll immediately
    pollTelemetry();
    
    return controller;
  }
}

// Create a singleton instance
const teslaApi = new TeslaAPI();

export default teslaApi; 