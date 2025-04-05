# RIDE WITH VIC

Track your rides, get fare estimates, and create receipts with Tesla Fleet API integration.

## Directory Structure

This project follows a strict directory structure to maintain code organization and prevent duplication:

```
RIDE-WITH-VIC-APP
├── api/                      # API routes for backend services
│   ├── auth/                 # Authentication endpoints
│   ├── vehicle/              # Vehicle-related endpoints
│   └── trip/                 # Trip management endpoints
├── components/               # React components
│   ├── layout/               # Layout components
│   ├── customer/             # Customer-related components
│   ├── trip/                 # Trip tracking components
│   ├── vehicle/              # Vehicle-related components
│   └── receipt/              # Receipt/PDF generation components
├── lib/                      # Shared utilities
├── models/                   # Data models
├── pages/                    # Pages for frontend router
├── public/                   # Static assets
├── styles/                   # CSS styles
├── scripts/                  # Helper scripts
├── test/                     # Test files
└── docker/                   # Docker configuration
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Setup environment variables:
   Copy `.env.example` to `.env.local` and fill in your API keys

4. Start the development server:
   ```
   npm run dev
   ```

## Creating New Files

To ensure files are created in the correct location and follow the proper structure, use the provided CLI tool:

```
npm run create
```

This interactive tool will guide you through creating new components, API endpoints, utilities, or models in the correct locations.

## Directory Structure Enforcement

This project enforces a strict directory structure to maintain code organization and prevent duplication. The structure is enforced through several mechanisms:

1. **ESLint Rules**: Import paths are checked to ensure they follow the correct pattern
2. **Git Hooks**: Files are checked before commit to ensure they're in the correct location
3. **CLI Tool**: A helper tool for creating files in the correct location

### Checking for Structure Issues

To manually check for structure issues:

```
npm run check-structure
```

### Finding Duplicate Files

To find duplicate files in the project:

```
npm run clean-duplicates
```

## Project Structure Rules

- **Components**: Should be in `components/[type]` directory with PascalCase names
- **API Routes**: Should be in `api/[type]` directory
- **Utilities**: Should be in `lib/` directory
- **Models**: Should be in `models/` directory
- **Styles**: Should be in `styles/` directory
- **Static Assets**: Should be in `public/` directory
- **Test Files**: Should be in `test/` directory

## Development

During development, follow these best practices:

1. Use the CLI to create new files: `npm run create`
2. Run ESLint before committing: `npm run lint`
3. Make sure tests pass before committing: `npm test`
4. Check directory structure compliance: `npm run check-structure`

## Environment Variables

The following environment variables are required:

```
# Tesla API credentials
TESLA_CLIENT_ID=your_client_id
TESLA_REDIRECT_URI=http://localhost:3000/api/auth/callback
TESLA_API_BASE_URL=https://owner-api.teslamotors.com
TESLA_AUTH_URL=https://auth.tesla.com/oauth2/v3
TESLA_PRIVATE_KEY=base64_encoded_private_key

# Google Maps API key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Uber API for fare estimates (optional)
UBER_CLIENT_ID=your_uber_client_id
UBER_SERVER_TOKEN=your_uber_server_token
```

## License

MIT

## Features

- Record ride details including date, time, locations, fare, and more
- Apply discounts to rides
- Get Uber fare estimates based on pickup and drop-off locations
- View all your saved rides
- Generate professional PDF receipts for rides
- Delete individual rides
- Export your ride data to CSV format
- Responsive design for both desktop and mobile use
- Works offline with data stored locally
- Tesla API integration for real-time tracking of Tesla vehicles

## Tesla API Integration

The app now includes integration with the Tesla Fleet API, allowing Tesla owners to:

- Connect their Tesla account securely via OAuth
- Select from available Tesla vehicles
- Track real-time location during trips
- Wake sleeping vehicles remotely
- Automatically calculate fares based on actual distance traveled
- View trip routes on an interactive map
- Generate detailed receipts with Tesla trip data

To use the Tesla integration:

1. Navigate to the "Tesla Tracking" tab
2. Click "Connect Tesla" to authenticate with your Tesla account
3. Select a vehicle from your Tesla fleet
4. Click "Start New Trip" to begin tracking
5. Select a customer for the trip
6. View real-time location, distance, and fare information
7. Click "End Trip" when the ride is complete
8. View the trip details and generate a receipt

## How to Use

### Method 1: Direct File Access (Simplest)

1. **Open the App**: 
   - Simply open the `index.html` file in any modern web browser
   - No installation or internet connection required after initial load

### Method 2: Using a Local Server (Optional)

If you have Node.js installed, you can run the app using a local server:

1. **Install dependencies**:
   ```
   npm install
   ```
2. **Start the server**:
   ```
   npm start
   ```
3. **Access the app**:
   - Open your browser and go to `http://localhost:3000`

### Method 3: Using Docker (Recommended)

If you have Docker installed, you can easily run the app in a container:

1. **Build and start the container**:
   ```
   docker-compose up -d
   ```
2. **Access the app**:
   - On your computer: Open your browser and go to `http://localhost:3000`
   - On your mobile device: Connect to the same network as your computer and go to `http://<COMPUTER_IP>:3000`
     (Replace `<COMPUTER_IP>` with your computer's local IP address)
3. **Stop the container**:
   ```
   docker-compose down
   ```

## Using the App

1. **Get a Fare Estimate**:
   - Click on the "Fare Estimate" tab
   - Enter pickup and drop-off locations
   - Click "Get Estimate" to see available options
   - Click on an option to use those details in a new ride

2. **Add a New Ride**:
   - Fill in the form fields with your ride details
   - Add a discount percentage if applicable
   - Click "Save Ride" to store the information

3. **View Your Rides**:
   - Click on the "Your Rides" tab to see all saved rides
   - Rides are sorted by date with the most recent at the top

4. **Generate a Receipt**:
   - Click the "Receipt" button on any ride card
   - View the receipt details in the modal
   - Click "Download PDF" to save a professional PDF receipt

5. **Export Your Data**:
   - Click the "Export Data" button to download all your rides as a CSV file
   - This file can be opened in any spreadsheet program like Excel or Google Sheets

6. **Tesla Trip Tracking**:
   - Click on the "Tesla Tracking" tab
   - Connect your Tesla account
   - Select a vehicle and start a new trip
   - View real-time trip data and mapping
   - End the trip to generate a receipt and save trip details

7. **Trip History Visualization**:
   - Click on the "Trip History" tab
   - View detailed trip information including map routes
   - Search and filter past trips
   - Generate receipts for any past trip

## Environment Configuration

For Tesla API integration, copy the `.env.example` file to `.env.local` and update the values:

```
# Tesla API credentials
TESLA_CLIENT_ID=your_tesla_client_id
TESLA_REDIRECT_URI=http://localhost:3000/api/auth/callback
TESLA_API_BASE_URL=https://owner-api.teslamotors.com
TESLA_AUTH_URL=https://auth.tesla.com/oauth2/v3

# Google Maps API key (required for mapping)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Running Tests

To run the automated tests that verify the app functionality:

1. Make sure the app is running (using any of the methods above)
2. Run the test script:
   ```
   npm test
   ```

## Privacy

All your ride data is stored only on your device using your browser's localStorage. Tesla API authentication tokens are also stored locally and are never sent to any third-party server.

## Technical Notes

- This app uses HTML, CSS, and JavaScript and runs entirely in your browser
- Tesla API integration uses OAuth 2.0 for secure authentication
- Uber API integration with graceful degradation for reliability
- Data persists between sessions using localStorage
- The app is fully responsive and works on mobile devices 