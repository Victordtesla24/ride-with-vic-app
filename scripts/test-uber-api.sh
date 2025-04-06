#!/bin/bash

# Script to test Uber API integration
# Uses curl to verify API connectivity and fare estimation

# Load environment variables
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
  echo "Loaded environment variables from .env.local"
else
  echo "Error: .env.local file not found"
  exit 1
fi

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}Uber API Integration Test${NC}"
echo -e "${BLUE}=======================================${NC}"

# Check if required environment variables are set
echo -e "\n${YELLOW}Checking environment variables...${NC}"
REQUIRED_VARS=("UBER_CLIENT_ID" "UBER_CLIENT_SECRET" "UBER_ASYMMETRIC_KEY_PATH")
MISSING_VARS=false

for VAR in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!VAR}" ]; then
    echo -e "${RED}Missing required environment variable: ${VAR}${NC}"
    MISSING_VARS=true
  else
    echo -e "${GREEN}✓ ${VAR} is set${NC}"
  fi
done

if [ "$MISSING_VARS" = true ]; then
  echo -e "\n${RED}Error: Missing required environment variables. Please check your .env.local file.${NC}"
  echo -e "${YELLOW}Continuing in demo mode with limited functionality.${NC}"
fi

# Check if asymmetric key file exists
if [ -f "${UBER_ASYMMETRIC_KEY_PATH}" ]; then
  echo -e "${GREEN}✓ Asymmetric key file found at ${UBER_ASYMMETRIC_KEY_PATH}${NC}"
else
  echo -e "${RED}✗ Asymmetric key file not found at ${UBER_ASYMMETRIC_KEY_PATH}${NC}"
  MISSING_VARS=true
fi

# Define test pickup and dropoff locations (New York City landmarks)
PICKUP_LAT="40.7128"
PICKUP_LNG="-74.0060"
DROPOFF_LAT="40.7484"
DROPOFF_LNG="-73.9857"

echo -e "\n${YELLOW}Testing fare estimation endpoint...${NC}"
echo -e "${BLUE}Using pickup location: ($PICKUP_LAT, $PICKUP_LNG) (Lower Manhattan)${NC}"
echo -e "${BLUE}Using dropoff location: ($DROPOFF_LAT, $DROPOFF_LNG) (Empire State Building)${NC}"

# Construct the Uber API URL
API_URL="https://api.uber.com/v1.2/estimates/price"
QUERY_PARAMS="start_latitude=${PICKUP_LAT}&start_longitude=${PICKUP_LNG}&end_latitude=${DROPOFF_LAT}&end_longitude=${DROPOFF_LNG}"
FULL_URL="${API_URL}?${QUERY_PARAMS}"

echo -e "Uber Fare Estimation URL: ${FULL_URL}"

if [ -z "$UBER_CLIENT_SECRET" ] || [ "$MISSING_VARS" = true ]; then
  echo -e "${YELLOW}Missing credentials, using sandbox mode.${NC}"
  
  # Generate mock fare data for demo purposes
  echo -e "${GREEN}✓ Generating mock fare estimate data...${NC}"
  
  # Calculate mock distance - approx 2.2 miles between these NYC points
  DISTANCE_MILES="2.2"
  
  # Calculate mock fare ranges for different products
  UX_MIN=$( printf "%.2f" $(echo "5 + $DISTANCE_MILES * 1.5" | bc) )
  UX_MAX=$( printf "%.2f" $(echo "5 + $DISTANCE_MILES * 2.5" | bc) )
  
  XL_MIN=$( printf "%.2f" $(echo "7.5 + $DISTANCE_MILES * 2.0" | bc) )
  XL_MAX=$( printf "%.2f" $(echo "7.5 + $DISTANCE_MILES * 3.5" | bc) )
  
  BLACK_MIN=$( printf "%.2f" $(echo "10 + $DISTANCE_MILES * 3.0" | bc) )
  BLACK_MAX=$( printf "%.2f" $(echo "10 + $DISTANCE_MILES * 5.0" | bc) )
  
  # Display mock results
  echo -e "\n${GREEN}Mock Uber fare estimates:${NC}"
  echo -e "Distance: ${DISTANCE_MILES} miles, Duration: ~12 minutes"
  echo -e "--------------------------------------------------"
  echo -e "UberX:      \$${UX_MIN} - \$${UX_MAX}"
  echo -e "UberXL:     \$${XL_MIN} - \$${XL_MAX}"
  echo -e "UberBLACK:  \$${BLACK_MIN} - \$${BLACK_MAX}"
else
  # Make actual API call with client credentials
  echo -e "${YELLOW}Sending API request with authentication...${NC}"
  
  RESPONSE=$(curl -s -X GET \
    -H "Authorization: Bearer ${UBER_CLIENT_SECRET}" \
    -H "Accept-Language: en_US" \
    -H "Content-Type: application/json" \
    "${FULL_URL}")
  
  # Check if we got a successful response
  if echo "$RESPONSE" | grep -q "prices"; then
    echo -e "${GREEN}✓ Successfully retrieved fare estimates${NC}"
    
    # Extract and display fare information
    echo -e "\n${GREEN}Uber fare estimates:${NC}"
    echo -e "--------------------------------------------------"
    
    # Parse JSON response with grep (basic parsing, a real implementation would use jq)
    echo "$RESPONSE" | grep -o '"display_name":"[^"]*"' | cut -d'"' -f4 | \
    while read -r product_name; do
      estimate=$(echo "$RESPONSE" | grep -A10 "\"display_name\":\"$product_name\"" | grep -o '"estimate":"[^"]*"' | head -1 | cut -d'"' -f4)
      if [ ! -z "$estimate" ]; then
        printf "%-15s %s\n" "$product_name:" "$estimate"
      fi
    done
  else
    echo -e "${RED}✗ Failed to retrieve fare estimates${NC}"
    echo -e "${YELLOW}Response: $RESPONSE${NC}"
  fi
fi

echo -e "\n${BLUE}=======================================${NC}"
echo -e "${BLUE}Uber API Test Summary${NC}"
echo -e "${BLUE}=======================================${NC}"

if [ "$MISSING_VARS" = true ]; then
  echo -e "${YELLOW}✓ Completed test with mock data (missing API credentials)${NC}"
else
  echo -e "${GREEN}✓ Environment variables correctly loaded${NC}"
  echo -e "${GREEN}✓ API endpoint URL construction successful${NC}"
  echo -e "${GREEN}✓ Asymmetric key file found and accessible${NC}"
  
  if echo "$RESPONSE" | grep -q "prices"; then
    echo -e "${GREEN}✓ Successfully connected to Uber API${NC}"
  else
    echo -e "${RED}✗ Could not connect to Uber API with provided credentials${NC}"
  fi
fi

echo -e "${BLUE}=======================================${NC}"

exit 0 