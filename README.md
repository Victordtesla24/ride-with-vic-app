# RIDE WITH VIC

A web-based application to track your rides, get fare estimates, and generate receipts. Works on both desktop and mobile devices.

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

## Running Tests

To run the automated tests that verify the app functionality:

1. Make sure the app is running (using any of the methods above)
2. Run the test script:
   ```
   npm test
   ```

## Privacy

All your ride data is stored only on your device using your browser's localStorage. No data is sent to any server.

## Technical Notes

- This app uses HTML, CSS, and JavaScript and runs entirely in your browser
- Uber API integration is simulated for demonstration purposes
- Data persists between sessions using localStorage
- The app is fully responsive and works on mobile devices 