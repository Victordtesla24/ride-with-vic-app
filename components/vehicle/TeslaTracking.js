import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import SpeedIcon from '@mui/icons-material/Speed';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import teslaApi from 'lib/tesla-api.js';

export default function TeslaTracking() {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeTripData, setActiveTripData] = useState(null);
  const [error, setError] = useState(null);
  
  // Make checkAuthentication use useCallback
  const checkAuthentication = useCallback(() => {
    try {
      const isAuth = teslaApi.isAuthenticated();
      setIsAuthenticated(isAuth);
      
      if (isAuth) {
        loadVehicles();
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setError('Failed to check Tesla authentication status');
    }
  }, []); // empty dependency array since it doesn't depend on any props or state
  
  // Initialize and check authentication on load
  useEffect(() => {
    // Check if Tesla API is initialized
    checkAuthentication();
    
    // Load customer data from localStorage
    loadCustomers();
  }, [checkAuthentication]);
  
  const loadVehicles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const vehicleData = await teslaApi.getVehicles();
      setVehicles(Array.isArray(vehicleData) ? vehicleData : []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      setError('Failed to load your Tesla vehicles');
      setLoading(false);
    }
  };
  
  const loadCustomers = () => {
    try {
      const storedCustomers = localStorage.getItem('customers');
      if (storedCustomers) {
        setCustomers(JSON.parse(storedCustomers));
      } else {
        // Add demo customer if none exist
        const demoCustomers = [
          { id: '1', name: 'John Doe', email: 'john@example.com', phone: '(555) 123-4567' },
          { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '(555) 987-6543' },
        ];
        setCustomers(demoCustomers);
        localStorage.setItem('customers', JSON.stringify(demoCustomers));
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      setError('Failed to load customer data');
    }
  };
  
  const handleAuthClick = async () => {
    setError(null);
    
    if (isAuthenticated) {
      // Disconnect from Tesla
      try {
        teslaApi.clearTokens();
        setIsAuthenticated(false);
        setVehicles([]);
        setSelectedVehicle(null);
      } catch (error) {
        console.error('Error disconnecting from Tesla:', error);
        setError('Failed to disconnect from Tesla');
      }
    } else {
      // Connect to Tesla
      try {
        window.location.href = teslaApi.getAuthorizationUrl();
      } catch (error) {
        console.error('Error connecting to Tesla:', error);
        setError('Failed to connect to Tesla. Please check your API credentials.');
      }
    }
  };
  
  const selectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
  };
  
  const startNewTrip = () => {
    if (!selectedVehicle) {
      setError('Please select a vehicle first');
      return;
    }
    
    setCustomerDialogOpen(true);
  };
  
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setCustomerDialogOpen(false);
    
    // Start the trip with selected vehicle and customer
    startTrip(customer);
  };
  
  const startTrip = async (customer) => {
    setLoading(true);
    setError(null);
    
    try {
      // Get current vehicle location
      const location = await teslaApi.getVehicleLocation(selectedVehicle.id);
      
      // Create trip data
      const tripData = {
        id: Date.now().toString(),
        vehicleId: selectedVehicle.id,
        vehicleName: selectedVehicle.display_name || selectedVehicle.name,
        customerId: customer.id,
        customerName: customer.name,
        startTime: new Date().toISOString(),
        startLocation: location,
        status: 'active',
        telemetryData: [location]
      };
      
      // Store in localStorage
      localStorage.setItem('activeTrip', JSON.stringify(tripData));
      setActiveTripData(tripData);
      setLoading(false);
      
      // Start polling for location updates
      startLocationTracking(selectedVehicle.id);
    } catch (error) {
      console.error('Error starting trip:', error);
      setError('Failed to start trip. Please try again.');
      setLoading(false);
    }
  };
  
  const startLocationTracking = (vehicleId) => {
    // In a real implementation, this would set up a WebSocket or polling interval
    // For demo purposes, we'll just update the location every 10 seconds
    const trackingInterval = setInterval(async () => {
      try {
        // Get current trip data
        const tripData = JSON.parse(localStorage.getItem('activeTrip'));
        
        if (!tripData || tripData.status !== 'active') {
          clearInterval(trackingInterval);
          return;
        }
        
        // Get updated location
        const location = await teslaApi.getVehicleLocation(vehicleId);
        
        // Update telemetry data
        const updatedTelemetry = [...tripData.telemetryData, location];
        
        // Update trip data
        const updatedTrip = {
          ...tripData,
          telemetryData: updatedTelemetry
        };
        
        // Save updated data
        localStorage.setItem('activeTrip', JSON.stringify(updatedTrip));
        setActiveTripData(updatedTrip);
      } catch (error) {
        console.error('Error updating location:', error);
        // Don't stop tracking on error, just log it
      }
    }, 10000);
    
    // Store interval ID for cleanup
    window.tripTrackingInterval = trackingInterval;
    
    return () => clearInterval(trackingInterval);
  };
  
  const endTrip = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get current trip data
      const tripData = activeTripData || JSON.parse(localStorage.getItem('activeTrip'));
      
      if (!tripData) {
        setError('No active trip found');
        setLoading(false);
        return;
      }
      
      // Get final location
      const endLocation = await teslaApi.getVehicleLocation(tripData.vehicleId);
      
      // Update trip data
      const endTime = new Date().toISOString();
      const updatedTrip = {
        ...tripData,
        status: 'completed',
        endTime,
        endLocation,
        telemetryData: [...tripData.telemetryData, endLocation]
      };
      
      // Calculate trip metrics (distance, duration, etc.)
      const duration = (new Date(endTime) - new Date(tripData.startTime)) / 1000 / 60; // minutes
      const distanceData = calculateTripDistance(updatedTrip.telemetryData);
      
      const finalTrip = {
        ...updatedTrip,
        duration: Math.round(duration),
        distance: distanceData.distance,
        estimatedFare: calculateFare(distanceData.distance, duration)
      };
      
      // Save to trip history
      const tripHistory = JSON.parse(localStorage.getItem('tripHistory') || '[]');
      tripHistory.push(finalTrip);
      localStorage.setItem('tripHistory', JSON.stringify(tripHistory));
      
      // Remove active trip
      localStorage.removeItem('activeTrip');
      setActiveTripData(null);
      
      // Clear tracking interval
      if (window.tripTrackingInterval) {
        clearInterval(window.tripTrackingInterval);
      }
      
      setLoading(false);
      
      // Show success message
      setError({ message: 'Trip completed successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error ending trip:', error);
      setError('Failed to end trip. Please try again.');
      setLoading(false);
    }
  };
  
  const calculateTripDistance = (telemetryData) => {
    // This is a simplified distance calculation
    // In a real app, you would use a more accurate method
    let totalDistance = 0;
    
    for (let i = 1; i < telemetryData.length; i++) {
      const prevPoint = telemetryData[i - 1];
      const currentPoint = telemetryData[i];
      
      // Calculate distance between points using Haversine formula
      const distance = getDistanceFromLatLonInKm(
        prevPoint.latitude,
        prevPoint.longitude,
        currentPoint.latitude,
        currentPoint.longitude
      );
      
      totalDistance += distance;
    }
    
    return {
      distance: totalDistance.toFixed(2),
      unit: 'km'
    };
  };
  
  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1); 
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  };
  
  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };
  
  const calculateFare = (distance, duration) => {
    // Simple fare calculation: base fare + distance rate + time rate
    const baseFare = 2.50;
    const distanceRate = 1.75; // per km
    const timeRate = 0.25; // per minute
    
    const distanceFare = parseFloat(distance) * distanceRate;
    const timeFare = duration * timeRate;
    
    return (baseFare + distanceFare + timeFare).toFixed(2);
  };
  
  const wakeVehicle = async (vehicleId) => {
    setLoading(true);
    setError(null);
    
    try {
      await teslaApi.wakeUpVehicle(vehicleId);
      // Reload vehicle data after wake command
      await loadVehicles();
    } catch (error) {
      console.error('Error waking vehicle:', error);
      setError('Failed to wake vehicle. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Box>
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <Chip
              icon={<ElectricCarIcon />}
              label={isAuthenticated ? "Connected to Tesla" : "Not Connected"}
              color={isAuthenticated ? "success" : "default"}
              variant="outlined"
            />
          </Grid>
          <Grid item>
            <Button
              variant={isAuthenticated ? "outlined" : "contained"}
              color={isAuthenticated ? "error" : "primary"}
              onClick={handleAuthClick}
              startIcon={<PowerSettingsNewIcon />}
            >
              {isAuthenticated ? "Disconnect" : "Connect Tesla Account"}
            </Button>
          </Grid>
          {isAuthenticated && (
            <Grid item>
              <IconButton 
                color="primary" 
                onClick={loadVehicles} 
                disabled={loading}
                title="Refresh vehicles"
              >
                <RefreshIcon />
              </IconButton>
            </Grid>
          )}
        </Grid>
      </Paper>

      {error && (
        <Alert 
          severity={typeof error === 'object' ? error.severity : "error"} 
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          {typeof error === 'object' ? error.message : error}
        </Alert>
      )}

      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {isAuthenticated && vehicles.length > 0 && (
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
            Your Vehicles
          </Typography>
          <Grid container spacing={2}>
            {vehicles.map((vehicle) => (
              <Grid item xs={12} md={6} key={vehicle.id}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    borderColor: selectedVehicle?.id === vehicle.id ? 'primary.main' : 'divider',
                    boxShadow: selectedVehicle?.id === vehicle.id ? 2 : 0
                  }}
                >
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <ElectricCarIcon />
                        </Avatar>
                      </Grid>
                      <Grid item xs>
                        <Typography variant="h6">{vehicle.display_name || vehicle.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {vehicle.model || 'Tesla'}
                        </Typography>
                        <Chip 
                          size="small" 
                          label={vehicle.state === 'online' ? 'Online' : 'Offline'}
                          color={vehicle.state === 'online' ? 'success' : 'default'}
                          sx={{ mt: 1 }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                  <Divider />
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => selectVehicle(vehicle)}
                      disabled={vehicle.state !== 'online'}
                    >
                      Select
                    </Button>
                    {vehicle.state !== 'online' && (
                      <Button 
                        size="small" 
                        onClick={() => wakeVehicle(vehicle.id)}
                        disabled={loading}
                      >
                        Wake Up
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {isAuthenticated && vehicles.length === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No Tesla vehicles found in your account. Make sure your vehicle is added to your Tesla account.
        </Alert>
      )}

      <Box mb={3}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          disabled={!selectedVehicle || activeTripData || loading}
          onClick={startNewTrip}
          startIcon={<SpeedIcon />}
        >
          Start New Trip
        </Button>
      </Box>

      {activeTripData && (
        <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Active Trip
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Customer
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {activeTripData.customerName}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Vehicle
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {activeTripData.vehicleName}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Started At
                </Typography>
                <Typography variant="body1">
                  {new Date(activeTripData.startTime).toLocaleString()}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, height: '100%' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Trip Stats
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">
                    Duration
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {Math.floor((new Date() - new Date(activeTripData.startTime)) / 60000)} minutes
                  </Typography>
                  
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>
                    Points Collected
                  </Typography>
                  <Typography variant="body1">
                    {activeTripData.telemetryData.length}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box textAlign="center" sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={endTrip}
                  disabled={loading}
                  sx={{ px: 4, py: 1 }}
                >
                  End Trip
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Customer Selection Dialog */}
      <Dialog 
        open={customerDialogOpen} 
        onClose={() => setCustomerDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Select Customer
        </DialogTitle>
        <DialogContent>
          <List sx={{ pt: 0 }}>
            {customers.map((customer) => (
              <ListItem 
                button 
                onClick={() => handleCustomerSelect(customer)} 
                key={customer.id}
              >
                <ListItemAvatar>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={customer.name} 
                  secondary={customer.email || customer.phone}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomerDialogOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 