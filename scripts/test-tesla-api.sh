#!/bin/bash

# Tesla API Integration Test Script
# This script tests the Tesla Fleet API integration using cURL

set -e  # Exit on error

# Load environment variables from .env.local
if [ -f .env.local ]; then
  echo "Loading environment variables from .env.local"
  export $(grep -v '^#' .env.local | xargs)
else
  echo "Error: .env.local file not found"
  exit 1
fi

# Check required environment variables
if [ -z "$NEXT_PUBLIC_TESLA_CLIENT_ID" ] || [ -z "$NEXT_PUBLIC_TESLA_REDIRECT_URI" ] || [ -z "$NEXT_PUBLIC_TESLA_API_BASE_URL" ] || [ -z "$NEXT_PUBLIC_TESLA_AUTH_URL" ]; then
  echo "Error: Missing required environment variables"
  echo "Make sure the following variables are set in .env.local:"
  echo "  - NEXT_PUBLIC_TESLA_CLIENT_ID"
  echo "  - NEXT_PUBLIC_TESLA_REDIRECT_URI"
  echo "  - NEXT_PUBLIC_TESLA_API_BASE_URL"
  echo "  - NEXT_PUBLIC_TESLA_AUTH_URL"
  exit 1
fi

# Set variables
TESLA_CLIENT_ID="$NEXT_PUBLIC_TESLA_CLIENT_ID"
TESLA_REDIRECT_URI="$NEXT_PUBLIC_TESLA_REDIRECT_URI"
TESLA_AUTH_URL="$NEXT_PUBLIC_TESLA_AUTH_URL"
TESLA_API_BASE_URL="$NEXT_PUBLIC_TESLA_API_BASE_URL"
TOKEN_FILE=".tesla-test-token.json"

echo "🚀 Starting Tesla API Integration Test"
echo "======================================="

# Step 1: Test Partner API Authentication (client credentials)
echo -e "\n🔐 Step 1: Testing Tesla Partner API Authentication"
echo "------------------------------------------------"

AUTH_RESPONSE=$(curl -s -X POST \
  "${TESLA_AUTH_URL}/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=${TESLA_CLIENT_ID}&scope=openid vehicle_device_data offline_access")

# Check if we got an access token
if echo "$AUTH_RESPONSE" | grep -q "access_token"; then
  echo "✅ Authentication successful"
  ACCESS_TOKEN=$(echo "$AUTH_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
  EXPIRES_IN=$(echo "$AUTH_RESPONSE" | grep -o '"expires_in":[0-9]*' | cut -d':' -f2)
  echo "🔑 Received access token (expires in ${EXPIRES_IN} seconds)"
  
  # Save token to file for later use
  echo "$AUTH_RESPONSE" > "$TOKEN_FILE"
  echo "💾 Saved token to $TOKEN_FILE"
else
  echo "❌ Authentication failed"
  echo "Response: $AUTH_RESPONSE"
  exit 1
fi

# Step 2: Test Vehicle Listing
echo -e "\n🚗 Step 2: Testing Vehicle Listing"
echo "--------------------------------"

VEHICLES_RESPONSE=$(curl -s \
  "${TESLA_API_BASE_URL}/api/1/vehicles" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

# Check if we got a valid response
if echo "$VEHICLES_RESPONSE" | grep -q '"count":'; then
  VEHICLE_COUNT=$(echo "$VEHICLES_RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
  echo "✅ Successfully retrieved vehicle list"
  echo "🚗 Found $VEHICLE_COUNT vehicles"
  
  # If vehicles were found, get the first vehicle ID for further tests
  if [ "$VEHICLE_COUNT" -gt 0 ]; then
    VEHICLE_ID=$(echo "$VEHICLES_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    VEHICLE_NAME=$(echo "$VEHICLES_RESPONSE" | grep -o '"display_name":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "🚗 Selected vehicle: $VEHICLE_NAME (ID: $VEHICLE_ID)"
    
    # Step 3: Test Vehicle Data API
    echo -e "\n📊 Step 3: Testing Vehicle Data API"
    echo "--------------------------------"
    
    VEHICLE_DATA_RESPONSE=$(curl -s \
      "${TESLA_API_BASE_URL}/api/1/vehicles/${VEHICLE_ID}/vehicle_data" \
      -H "Authorization: Bearer ${ACCESS_TOKEN}")
    
    if echo "$VEHICLE_DATA_RESPONSE" | grep -q '"response":'; then
      echo "✅ Successfully retrieved vehicle data"
      
      # Extract some key data points
      BATTERY_LEVEL=$(echo "$VEHICLE_DATA_RESPONSE" | grep -o '"battery_level":[0-9]*' | head -1 | cut -d':' -f2)
      if [ ! -z "$BATTERY_LEVEL" ]; then
        echo "🔋 Battery level: ${BATTERY_LEVEL}%"
      fi
      
      CHARGING_STATE=$(echo "$VEHICLE_DATA_RESPONSE" | grep -o '"charging_state":"[^"]*"' | head -1 | cut -d'"' -f4)
      if [ ! -z "$CHARGING_STATE" ]; then
        echo "🔌 Charging state: $CHARGING_STATE"
      fi
      
      SOFTWARE_VERSION=$(echo "$VEHICLE_DATA_RESPONSE" | grep -o '"car_version":"[^"]*"' | head -1 | cut -d'"' -f4)
      if [ ! -z "$SOFTWARE_VERSION" ]; then
        echo "💻 Software version: $SOFTWARE_VERSION"
      fi
    else
      echo "❌ Failed to retrieve vehicle data"
      echo "Response: $VEHICLE_DATA_RESPONSE"
    fi
  else
    echo "ℹ️ No vehicles found to test with"
  fi
else
  echo "❌ Failed to retrieve vehicles"
  echo "Response: $VEHICLES_RESPONSE"
fi

echo -e "\n🏁 Tesla API Integration Test Complete"
echo "=========================================" 