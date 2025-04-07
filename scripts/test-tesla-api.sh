#!/bin/bash

# Script to test Tesla API integration
# Uses curl to verify API connectivity and authorization

# Load environment variables
if [ -f .env.local ]; then
  # Use a safer way to load environment variables
  while IFS='=' read -r key value; do
    # Skip comments and empty lines
    if [[ "$key" =~ ^# ]] || [[ -z "$key" ]]; then
      continue
    fi
    
    # Remove any leading/trailing whitespace
    key=$(echo "$key" | xargs)
    
    # Handle multi-line values (like private keys)
    if [[ "$value" == \"* ]] && [[ ! "$value" == *\" ]]; then
      # This is the start of a multi-line value
      multiline=true
      value="${value#\"}"
      export "$key"="$value"
    elif [[ "$multiline" == true ]] && [[ "$value" == *\" ]]; then
      # This is the end of a multi-line value
      value="${value%\"}"
      export "$key"="${!key}
$value"
      multiline=false
    elif [[ "$multiline" == true ]]; then
      # This is the middle of a multi-line value
      export "$key"="${!key}
$value"
    else
      # Regular single-line value
      export "$key"="$value"
    fi
  done < .env.local
  
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
echo -e "${BLUE}Tesla API Integration Test${NC}"
echo -e "${BLUE}=======================================${NC}"

# Check if required environment variables are set
echo -e "\n${YELLOW}Checking environment variables...${NC}"
REQUIRED_VARS=("NEXT_PUBLIC_TESLA_CLIENT_ID" "NEXT_PUBLIC_TESLA_REDIRECT_URI" "NEXT_PUBLIC_TESLA_API_BASE_URL" "NEXT_PUBLIC_TESLA_AUTH_URL" "TESLA_PRIVATE_KEY")
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
  exit 1
fi

echo -e "\n${YELLOW}Testing Tesla OAuth Authentication URL...${NC}"
# Construct and validate the Tesla OAuth URL
AUTH_URL="${NEXT_PUBLIC_TESLA_AUTH_URL}/authorize?client_id=${NEXT_PUBLIC_TESLA_CLIENT_ID}&redirect_uri=${NEXT_PUBLIC_TESLA_REDIRECT_URI}&response_type=code&scope=openid vehicle_device_data vehicle_cmds offline_access"

# Test the URL construction
echo -e "Tesla OAuth URL: ${AUTH_URL}"

# Test the OAuth server response
echo -e "\n${YELLOW}Verifying Tesla OAuth server is reachable...${NC}"
# Test a HEAD request to the authorize endpoint, which should at least return something without parameters
# The response code might be 400 or 302, but that's actually expected as it would redirect or complain about missing params
HTTP_STATUS=$(curl -s -I -o /dev/null -w "%{http_code}" "${NEXT_PUBLIC_TESLA_AUTH_URL}/authorize")

# Any response (even an error) means the server is reachable
if [ "$HTTP_STATUS" -ne 0 ]; then
  echo -e "${GREEN}✓ Tesla OAuth Server is reachable (HTTP ${HTTP_STATUS})${NC}"
  echo -e "${YELLOW}Got expected response - server is up but needs proper authorization parameters${NC}"
else
  echo -e "${RED}✗ Tesla OAuth Server is not reachable (connection failed)${NC}"
fi

# Test Fleet API base URL
echo -e "\n${YELLOW}Verifying Tesla Fleet API base URL is reachable...${NC}"
# Test the vehicles endpoint instead of the base URL as it's a valid endpoint
# The actual response will be a 401 Unauthorized which is expected without authentication
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${NEXT_PUBLIC_TESLA_API_BASE_URL}/api/1/vehicles")

if [ "$HTTP_STATUS" -eq 401 ]; then
  echo -e "${GREEN}✓ Tesla API vehicles endpoint is reachable (HTTP ${HTTP_STATUS} - Unauthorized, as expected)${NC}"
else
  echo -e "${RED}✗ Tesla API vehicles endpoint returned unexpected status (HTTP ${HTTP_STATUS})${NC}"
  echo -e "${YELLOW}Expected 401 Unauthorized without authentication${NC}"
fi

echo -e "\n${YELLOW}Testing vehicle data endpoint (with id_s format)...${NC}"
echo -e "${BLUE}This will not return real data without authentication tokens${NC}"

# Update to use id_s format for vehicle ID
VEHICLE_ID="12345678901234567" # Example id_s format
VEHICLE_ENDPOINT="${NEXT_PUBLIC_TESLA_API_BASE_URL}/api/1/vehicles/${VEHICLE_ID}/vehicle_data"

echo -e "Vehicle Data URL: ${VEHICLE_ENDPOINT}"
echo -e "${YELLOW}Sending API request (expected to fail without real tokens)...${NC}"

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer DUMMY_TOKEN" "${VEHICLE_ENDPOINT}")

if [ "$HTTP_STATUS" -eq 401 ]; then
  echo -e "${YELLOW}✓ Got expected unauthorized response (HTTP ${HTTP_STATUS})${NC}"
  echo -e "${GREEN}This indicates the API endpoint exists but requires proper authentication${NC}"
else
  echo -e "${RED}Unexpected HTTP status code: ${HTTP_STATUS}${NC}"
  echo -e "${YELLOW}Expected 401 Unauthorized. If getting 404, the vehicle ID format may be incorrect (should use id_s format)${NC}"
fi

echo -e "\n${BLUE}=======================================${NC}"
echo -e "${BLUE}Tesla API Test Summary${NC}"
echo -e "${BLUE}=======================================${NC}"
echo -e "${GREEN}✓ Environment variables correctly loaded${NC}"
echo -e "${GREEN}✓ OAuth URL construction successful${NC}"
echo -e "${GREEN}✓ API endpoint URL construction successful${NC}"
echo -e "${YELLOW}Note: Full API functionality requires user authentication${NC}"
echo -e "${YELLOW}To complete authentication flow, run the application and use the Tesla connect button${NC}"
echo -e "${BLUE}=======================================${NC}"

exit 0 