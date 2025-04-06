import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  TextField,
  Grid,
  Divider,
  Autocomplete,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonIcon from '@mui/icons-material/Person';
import MapIcon from '@mui/icons-material/Map';
import Head from 'next/head';
import Layout from 'components/layout/Layout';
import BasicMap from 'components/map/BasicMap';
import VehicleSelector from 'components/vehicle/VehicleSelector';
import LiveTripCard from 'components/trip/LiveTripCard';
import { getVehicles } from 'models/vehicle';

// Import mock data
import { savedAddresses, popularDestinations } from 'lib/mockData';

export default function BookPage() {
  const router = useRouter();
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [tripStarted, setTripStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Combine saved addresses and popular destinations for location options
  const locationOptions = useMemo(() => [...savedAddresses, ...popularDestinations], [savedAddresses, popularDestinations]);

  useEffect(() => {
    // Fetch saved addresses
    const fetchSavedAddresses = async () => {
      try {
        const response = await fetch('/api/customer/addresses');
        const data = await response.json();
        if (data.success) {
          setSavedAddresses(data.addresses.map(address => ({
            value: address.id,
            label: address.name,
            address: address.full,
            type: 'saved',
            icon: 'home'
          })));
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    };

    // Fetch popular destinations
    const fetchPopularDestinations = async () => {
      try {
        const response = await fetch('/api/destinations/popular');
        const data = await response.json();
        if (data.success) {
          setPopularDestinations(data.destinations.map(dest => ({
            value: dest.id,
            label: dest.name,
            address: dest.address,
            type: 'popular',
            icon: 'place'
          })));
        }
      } catch (error) {
        console.error('Error fetching popular destinations:', error);
      }
    };
    
    // Fetch Tesla vehicles
    const fetchVehicles = async () => {
      try {
        // First check localStorage
        const cachedVehicles = getVehicles();
        if (cachedVehicles.length > 0) {
          setVehicles(cachedVehicles);
          return;
        }
        
        // If no cached vehicles, fetch from API
        const response = await fetch('/api/vehicle/list');
        const data = await response.json();
        if (data.success) {
          setVehicles(data.vehicles);
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      }
    };

    fetchSavedAddresses();
    fetchPopularDestinations();
    fetchVehicles();
  }, []);

  useEffect(() => {
    // Ensure locations have valid values when options are loaded
    if (locationOptions.length > 0) {
      if (!pickupLocation && locationOptions.length > 0) {
        setPickupLocation(locationOptions[0]);
      }
      if (!dropoffLocation && locationOptions.length > 1) {
        setDropoffLocation(locationOptions[1]);
      }
    }
  }, [locationOptions, pickupLocation, dropoffLocation]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStartTrip = async () => {
    if (!selectedVehicle) {
      alert('Please select a vehicle first');
      return;
    }
    
    setLoading(true);
    
    try {
      // Call the API to start a trip
      const response = await fetch('/api/trip/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicleId: selectedVehicle.id,
          startLocation: {
            address: pickupLocation.address,
            label: pickupLocation.label
          },
          endLocation: {
            address: dropoffLocation.address,
            label: dropoffLocation.label
          }
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTripStarted(true);
        // Advance to final step
        setActiveStep(3);
      } else {
        alert(data.error || 'Failed to start trip');
      }
    } catch (error) {
      console.error('Error starting trip:', error);
      alert('An error occurred while starting the trip');
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const steps = ['Select locations', 'Select vehicle', 'Review trip'];

  return (
    <Layout>
      <Head>
        <title>Book a Ride | Ride with Vic</title>
      </Head>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Book a Ride
          </Typography>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Select Pickup and Dropoff Locations
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    value={pickupLocation}
                    onChange={(event, newValue) => {
                      setPickupLocation(newValue);
                    }}
                    disablePortal
                    options={locationOptions}
                    getOptionLabel={(option) => option ? option.label : ''}
                    isOptionEqualToValue={(option, value) => option.value === value?.value}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Grid container alignItems="center">
                          <Grid item>
                            <Box component={LocationOnIcon} sx={{ color: 'text.secondary', mr: 2 }} />
                          </Grid>
                          <Grid item xs>
                            <Typography variant="body1">{option.label}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {option.address}
                            </Typography>
                          </Grid>
                        </Grid>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Pickup Location"
                        placeholder="Select a pickup location"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <LocationOnIcon color="action" sx={{ ml: 1, mr: 0.5 }} />
                          )
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    value={dropoffLocation}
                    onChange={(event, newValue) => {
                      setDropoffLocation(newValue);
                    }}
                    disablePortal
                    options={locationOptions}
                    getOptionLabel={(option) => option ? option.label : ''}
                    isOptionEqualToValue={(option, value) => option.value === value?.value}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Grid container alignItems="center">
                          <Grid item>
                            <Box component={LocationOnIcon} sx={{ color: 'text.secondary', mr: 2 }} />
                          </Grid>
                          <Grid item xs>
                            <Typography variant="body1">{option.label}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {option.address}
                            </Typography>
                          </Grid>
                        </Grid>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Dropoff Location"
                        placeholder="Select a dropoff location"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <LocationOnIcon color="action" sx={{ ml: 1, mr: 0.5 }} />
                          )
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <BasicMap
                    pickup={pickupLocation?.address}
                    dropoff={dropoffLocation?.address}
                    height="300px"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Select a Tesla Vehicle
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="vehicle-select-label">Vehicle</InputLabel>
                    <Select
                      labelId="vehicle-select-label"
                      id="vehicle-select"
                      value={selectedVehicle?.id || ''}
                      label="Vehicle"
                      onChange={(e) => {
                        const vehicle = vehicles.find(v => v.id === e.target.value);
                        setSelectedVehicle(vehicle);
                      }}
                    >
                      {vehicles.map((vehicle) => (
                        <MenuItem key={vehicle.id} value={vehicle.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <DirectionsCarIcon sx={{ mr: 1 }} />
                            <Box>
                              <Typography variant="body1">
                                {vehicle.display_name || vehicle.name || vehicle.model}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {vehicle.vin} · {vehicle.state === 'online' ? 'Online' : 'Offline'}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <BasicMap
                    pickup={pickupLocation?.address}
                    dropoff={dropoffLocation?.address}
                    vehicleLocation={selectedVehicle?.location}
                    height="300px"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Trip Summary
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Customer Details
                    </Typography>
                    <Typography variant="body1">
                      John Doe
                    </Typography>
                    <Typography variant="body2">
                      john.doe@example.com
                    </Typography>
                    <Typography variant="body2">
                      +1 (555) 123-4567
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Trip Details
                    </Typography>
                    <Box display="flex" alignItems="center" mb={1}>
                      <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body1">
                        {pickupLocation?.label} ({pickupLocation?.address})
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ ml: 4, mb: 1 }}>
                      Pickup Location
                    </Typography>
                    <Box display="flex" alignItems="center" mb={1}>
                      <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body1">
                        {dropoffLocation?.label} ({dropoffLocation?.address})
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ ml: 4 }}>
                      Dropoff Location
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Vehicle Information
                    </Typography>
                    {selectedVehicle ? (
                      <>
                        <Typography variant="body1">
                          {selectedVehicle.display_name || selectedVehicle.name || selectedVehicle.model}
                        </Typography>
                        <Typography variant="body2">
                          VIN: {selectedVehicle.vin}
                        </Typography>
                        <Typography variant="body2" color={selectedVehicle.state === 'online' ? 'success.main' : 'error.main'}>
                          Status: {selectedVehicle.state === 'online' ? 'Online' : 'Offline'}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body1" color="error">
                        No vehicle selected
                      </Typography>
                    )}
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Estimated Time & Fare
                    </Typography>
                    <Typography variant="body1">
                      Estimated Time: 25 minutes
                    </Typography>
                    <Typography variant="body1">
                      Base Fare: $10.00
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="h6" color="primary">
                      Total: $10.00
                    </Typography>
                    <Typography variant="body2">
                      Payment Method: Credit Card
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <BasicMap
                    pickup={pickupLocation?.address}
                    dropoff={dropoffLocation?.address}
                    vehicleLocation={selectedVehicle?.location}
                    height="300px"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {activeStep === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Trip in Progress
              </Typography>
              <LiveTripCard
                trip={{
                  vehicleId: selectedVehicle?.id,
                  startLocation: pickupLocation,
                  endLocation: dropoffLocation
                }}
                autoCenter={true}
              />
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            {activeStep > 0 && activeStep < 3 && (
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
            )}
            {activeStep < 2 ? (
              <Button 
                variant="contained" 
                onClick={handleNext}
                disabled={
                  (activeStep === 0 && (!pickupLocation || !dropoffLocation)) ||
                  (activeStep === 1 && !selectedVehicle)
                }
              >
                Next
              </Button>
            ) : activeStep === 2 ? (
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleStartTrip}
                disabled={loading || !selectedVehicle}
              >
                {loading ? <CircularProgress size={24} /> : 'Start Trip'}
              </Button>
            ) : null}
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
} 