# RIDE WITH VIC - Tesla API Integration Requirements

This document outlines the comprehensive requirements for integrating Tesla Fleet API with the existing RIDE WITH VIC application, creating a seamless ride tracking experience for Tesla vehicles.

## Project Overview

The RIDE WITH VIC app currently provides ride tracking, fare estimation, and receipt generation. We'll enhance it with Tesla Fleet API integration to enable real-time location tracking, accurate fare calculation, and automated trip management for Tesla vehicles.

## 1. Project Structure

Following Vercel deployment best practices, we'll organize our project with this directory structure:

```
RIDE-WITH-VIC-APP
├── api/                      # API routes for backend services (Vercel serverless functions)
│   ├── auth/                 # Authentication endpoints
│   │   ├── tesla.js          # Tesla OAuth authentication
│   │   └── callback.js       # OAuth callback handler
│   ├── vehicle/              # Vehicle-related endpoints
│   │   ├── location.js       # Get vehicle location
│   │   └── telemetry.js      # Get vehicle telemetry data
│   └── trip/                 # Trip management endpoints
│       ├── start.js          # Start trip tracking
│       ├── update.js         # Update trip data
│       └── end.js            # End trip and calculate final data
├── components/               # React components
│   ├── layout/               # Layout components
│   ├── customer/             # Customer-related components
│   ├── trip/                 # Trip tracking components
│   ├── vehicle/              # Vehicle-related components
│   └── receipt/              # Receipt/PDF generation components
├── lib/                      # Shared utilities
│   ├── tesla-api.js          # Tesla API client
│   ├── uber-api.js           # Uber API client (for fare estimates)
│   └── database.js           # Database operations (LocalStorage enhanced)
├── models/                   # Data models
│   ├── customer.js           # Customer data model
│   ├── trip.js               # Trip data model
│   └── vehicle.js            # Vehicle data model
├── pages/                    # Pages for frontend router
├── public/                   # Static assets
├── styles/                   # CSS styles
├── .env.local                # Local environment variables
├── .env.example              # Example environment file
├── next.config.js            # Next.js configuration
├── package.json              # Project dependencies
└── vercel.json               # Vercel deployment configuration
```

## 2. Authentication Implementation

### Tesla OAuth 2.0 Implementation

1. **Create EC Key Pair**:
   ```bash
   # Generate EC private key using secp256r1 curve
   openssl ecparam -name prime256r1 -genkey -noout -out private-key.pem
   # Derive public key
   openssl ec -in private-key.pem -pubout -out public-key.pem
   ```

2. **Setup Environment Variables**:
   ```dotenv
   # Tesla API credentials
   TESLA_CLIENT_ID=Obd6ccd5-9d71-49f9-a45d-8a261192c7df
   TESLA_CLIENT_SECRET=your_client_secret
   TESLA_REDIRECT_URI=http://localhost:3000/api/auth/callback
   TESLA_API_BASE_URL=https://owner-api.teslamotors.com
   TESLA_AUTH_URL=https://auth.tesla.com/oauth2/v3
   
   # Private key for signing requests (encoded as base64)
   TESLA_PRIVATE_KEY=base64_encoded_private_key
   
   # Uber API for fare estimates (optional)
   UBER_CLIENT_ID=your_uber_client_id
   UBER_SERVER_TOKEN=your_uber_server_token
   ```

3. **Authorization Flow**:
   - Implement the OAuth 2.0 authorization code flow in `/api/auth/tesla.js`
   - Handle callback in `/api/auth/callback.js`
   - Store tokens securely in localStorage with proper encryption

## 3. Data Model

Extend the current data model with these additional structures:

### Customer Model
```javascript
// models/customer.js
export const CustomerSchema = {
  id: String,         // Unique identifier
  name: String,       // Customer name
  email: String,      // Customer email (optional)
  phone: String,      // Customer phone (optional)
  preferences: Object // Customer preferences (optional)
}
```

### Trip Model
```javascript
// models/trip.js
export const TripSchema = {
  id: String,              // Unique identifier (timestamp)
  customerId: String,      // Reference to customer
  vehicleId: String,       // Tesla vehicle ID
  status: String,          // "pending", "active", "completed", "cancelled"
  startTime: Date,         // Trip start time
  endTime: Date,           // Trip end time
  startLocation: {         // Starting location
    latitude: Number,
    longitude: Number,
    address: String
  },
  endLocation: {           // Ending location
    latitude: Number,
    longitude: Number,
    address: String
  },
  estimatedFare: Number,   // Fare estimate from Uber API
  actualFare: Number,      // Calculated actual fare
  discountPercent: Number, // Discount percentage
  discountAmount: Number,  // Calculated discount amount
  finalFare: Number,       // Final fare after discount
  telemetryData: Array,    // Array of location points during trip
  notes: String,           // Trip notes
  paymentMethod: String,   // Payment method
  receipt: {               // Receipt data
    id: String,
    generated: Boolean,
    url: String
  }
}
```

### Vehicle Model
```javascript
// models/vehicle.js
export const VehicleSchema = {
  id: String,           // Tesla vehicle ID
  name: String,         // Vehicle name
  model: String,        // Tesla model
  vin: String,          // Vehicle identification number
  display_name: String, // Display name
  state: String,        // Online state
  tokens: Array         // Auth tokens
}
```

## 4. Tesla API Integration Features

### Vehicle Data Access
- Fetch vehicle list and details
- Access real-time location and state
- Configure telemetry data streams

### Trip Tracking Implementation
1. **Start Trip Process**:
   - Customer selection from dropdown
   - Fetch current vehicle location from Tesla API
   - Store starting location and timestamp
   - Get fare estimate from Uber API (optional)
   - Begin periodic location tracking

2. **Live Trip Tracking**:
   - Use Fleet API telemetry to stream location updates
   - Store location points with timestamps
   - Calculate current trip duration and distance
   - Update UI with real-time information

3. **End Trip Process**:
   - Capture final vehicle location
   - Calculate total trip distance and duration
   - Determine actual fare based on tracked data
   - Generate receipt with detailed trip information
   - Save all trip data to database

## 5. User Interface Enhancements

### New UI Components
1. **Vehicle Selector**:
   - Display list of authorized Tesla vehicles
   - Show vehicle status (online/offline)
   - Select vehicle for trip tracking

2. **Live Trip Card**:
   - Real-time map displaying vehicle location
   - Trip timer and distance counter
   - Start/Stop trip buttons
   - Fare estimate display

3. **Trip History Enhancements**:
   - Map visualization of trip route
   - Detailed trip metrics (speed, distance, duration)
   - Trip comparison features

## 6. API Endpoints

### Tesla API Endpoints
- Vehicle endpoints: `/api/vehicle/*`
- Telemetry endpoints: `/api/telemetry/*`
- Trip management: `/api/trip/*`

### Local Storage Schema
Enhance the current localStorage implementation with proper indexing and encryption for sensitive data.

## 7. Deployment Configuration

### Vercel Configuration
```json
// vercel.json
{
  "version": 2,
  "builds": [
    { "src": "next.config.js", "use": "@vercel/next" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/" }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## 8. Testing Plan

1. **Unit Tests**:
   - Test each API integration component
   - Validate data models and transformations
   - Verify authentication flows

2. **Integration Tests**:
   - Test full trip lifecycle
   - Verify data persistence
   - Test error handling and recover


## UBER API Integration Tests for Authorisation Code:
Step 1: Select the scopes from the above list. Your selection will be saved for later

Step 2: First, the user has to grant your app permission to access their data or do actions on their behalf. Uber provides an authentication page where users can secure sign in with their Uber username and password to grant permissions to your app. This authorization page is accessible through the below authorization URI:
@https://sandbox-login.uber.com/oauth/v2/authorize?client_id=ebV75pxB6Y9E16-mBWkARRSjPfAXNSPA&redirect_uri=<REDIRECT_URI>&scope=<SPACE_DELIMITED_LIST_OF_SCOPES>&response_type=code 

Step 3: Once the Uber user authenticates and authorizes your app, Uber will issue an HTTP 302 redirect to the redirect_uri passed in previous step (or the first redirect URI in the dashboard if none was explicitly provided in previous step). On that redirect, you will have a single-use authorization code which will expire in 10 minutes. The AUTHORIZATION_CODE query param is the authorization code needed for next step:
GET <REDIRECT_URI>/?code=<AUTHORIZATION_CODE>

Step 4: Use the endpoint below to exchange the authorization code for an access_token which will allow you to make a request on behalf of the user. The access_token is good for a limited period of time described by the expires_in field (in seconds) in response.

Request:
    ```bash
             curl -F 'client_secret=FpjjIEjJ3_DvjLfuSShQ-uzBxO84ceU2HZJMZTSQ'\
                     -F 'client_id=ebV75pxB6Y9E16-mBWkARRSjPfAXNSPA'\
                     -F 'grant_type=authorization_code'\
                     -F 'redirect_uri=<REDIRECT_URI>\
                     -F 'code=<AUTHORIZATION_CODE>'\
              "https://sandbox-login.uber.com/oauth/v2/token"

Response:
        ```bash
                {
                    "access_token": "<ACCESS_TOKEN>",
                     "token_type": "Bearer",
                     "expires_in": "<EXPIRY_IN_EPOCH>",
                     "refresh_token": "xxx",
                     "scope": "<SPACE_DELIMITED_LIST_OF_SCOPES>"
                  }
          ```
Step 5: You can pass the <ACCESS_TOKEN> returned in the previous step as a bearer token in Authorization header, or pass it as a query parameter in the URL. See example below of OAuth sent in the header.
    ```bash
           curl -H "Authorization: Bearer <ACCESS_TOKEN>"\
    https://test-api.uber.com/v1.2/products?latitude=37.7759792-logitude=-122.41823
      ```

-----

## UBER API Integration Tests for Client Credentials:
Step 1: Select the scopes from the above list. Your selection will be saved for later

Step 2: Use the below endpoint to generate the access token.

Request:
 ```basg
     curl\
      -X POST\
      -F 'chient_id=ebV75pxB6Y9E16-mBWkARRSjPfAXNSPA'\
      -F 'client_secret=FpjjIEjJ3_DvjLfuSShQ-uzBxO84ceU2HZJMZTSQ'\
      -F 'grant_type=client_credentials'\
      -F 'scope=<SPACE_DELIMITED_LIST_OF_SCOPES>'\
      "https://sandbox-login.uber.com/oauth/v2/token"
  ```
Response:
   ```bash
      {
           "access_token": "<ACCESS_TOKEN>",
            "token_type": "Bearer",
            "expires_in": "<EXPIRY_IN_EPOCH>",
            "scope": "<SPACE_DELIMITED_LIST_OF_SCOPES>"
       }
    ```
Step 3: You can pass the <ACCESS_TOKEN> returned in the previous step as a bearer token in Authorization header, or pass it as a query parameter in the URL. See example below of OAuth sent in the header.py

-----

3. **UI Tests**:
   - Validate responsive design
   - Test all user interactions
   - Verify real-time updates

## 9. Implementation Phases

### Phase 1: Authentication & Setup
- Implement Tesla OAuth flow
- Set up project structure
- Create data models

### Phase 2: Basic Integration
- Implement vehicle listing and selection
- Basic location tracking
- Trip start/end functionality

### Phase 3: Advanced Features
- Real-time telemetry integration
- Enhanced trip tracking
- Fare calculation improvements

### Phase 4: UI Enhancements & Deployment
- Improve user interface
- Add detailed trip visualizations
- Deploy to Vercel

## 10. Security Considerations

1. **Data Protection**:
   - Encrypt sensitive information in localStorage
   - Implement token refresh mechanism
   - Add session timeout for security

2. **API Security**:
   - Secure API endpoints with proper authentication
   - Implement rate limiting
   - Add request validation

3. **User Privacy**:
   - Clear consent for location tracking
   - Options to delete trip history
   - Transparency about data usage

## 11. Future Enhancements

- Multi-user support
- Trip scheduling
- Advanced analytics dashboard
- Integration with other vehicle APIs
- Offline mode improvements