import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import teslaApi from 'lib/tesla-api';
import { getVehicles } from 'models/vehicle';

// React wrapper for the VehicleSelector class
const VehicleSelector = ({ onVehicleSelect }) => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  
  useEffect(() => {
    // Load vehicles on component mount
    loadVehicles();
  }, []);
  
  const loadVehicles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First check localStorage
      const cachedVehicles = getVehicles();
      
      if (cachedVehicles && cachedVehicles.length > 0) {
        setVehicles(cachedVehicles);
        setLoading(false);
        return;
      }
      
      // Check if authenticated with Tesla
      if (teslaApi.isAuthenticated()) {
        // Fetch vehicles from API
        const response = await fetch('/api/vehicle/list');
        const data = await response.json();
        
        if (data.success) {
          setVehicles(data.vehicles);
        } else {
          throw new Error(data.error || 'Failed to fetch vehicles');
        }
      } else {
        // Not authenticated, show connect button
        setVehicles([]);
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
      setError('Failed to load vehicles. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    if (onVehicleSelect) {
      onVehicleSelect(vehicle);
    }
  };
  
  const handleConnectTesla = () => {
    setAuthDialogOpen(true);
  };
  
  const confirmConnectTesla = () => {
    // Redirect to Tesla authentication
    window.location.href = '/api/auth/tesla';
  };
  
  const handleWakeVehicle = async (vehicleId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/vehicle/wake?vehicleId=${vehicleId}`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh the vehicle list after waking
        await loadVehicles();
      } else {
        setError(data.error || 'Failed to wake vehicle');
      }
    } catch (error) {
      console.error('Error waking vehicle:', error);
      setError('Failed to wake vehicle. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button size="small" onClick={loadVehicles} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }
  
  if (vehicles.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" gutterBottom>
          No Tesla Vehicles Found
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Connect your Tesla account to access your vehicles.
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleConnectTesla}
          startIcon={<DirectionsCarIcon />}
        >
          Connect Tesla Account
        </Button>
        
        {/* Auth Dialog */}
        <Dialog open={authDialogOpen} onClose={() => setAuthDialogOpen(false)}>
          <DialogTitle>Connect Tesla Account</DialogTitle>
          <DialogContent>
            <Typography paragraph>
              You'll be redirected to Tesla to authorize access to your vehicle data. This allows Ride with Vic to:
            </Typography>
            <ul>
              <li>Access vehicle location and state</li>
              <li>Track trip data during rides</li>
              <li>Calculate accurate ride fares</li>
            </ul>
            <Typography variant="body2" color="text.secondary">
              Your data is only used for ride services and never shared with third parties.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAuthDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmConnectTesla} variant="contained">
              Connect Account
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }
  
  return (
    <Grid container spacing={2}>
      {vehicles.map((vehicle) => {
        const isOnline = vehicle.state === 'online';
        const isSelected = selectedVehicle && selectedVehicle.id === vehicle.id;
        
        return (
          <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
            <Card 
              variant={isSelected ? "elevation" : "outlined"}
              elevation={isSelected ? 4 : 1}
              sx={{ 
                borderColor: isSelected ? 'primary.main' : 'divider',
                position: 'relative'
              }}
            >
              <CardActionArea onClick={() => handleVehicleSelect(vehicle)}>
                <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                  <Chip 
                    size="small"
                    label={isOnline ? "Online" : "Offline"} 
                    color={isOnline ? "success" : "default"}
                  />
                </Box>
                <CardMedia
                  component="img"
                  height="140"
                  image={`/images/tesla-${vehicle.model?.toLowerCase() || 'model3'}.jpg`}
                  alt={vehicle.name}
                  sx={{ objectFit: 'contain', bgcolor: '#f5f5f5' }}
                />
                <CardContent>
                  <Typography variant="h6" component="div">
                    {vehicle.display_name || vehicle.name || `Tesla ${vehicle.model}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {vehicle.vin}
                  </Typography>
                  
                  {!isOnline && (
                    <Button 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWakeVehicle(vehicle.id);
                      }}
                      sx={{ mt: 1 }}
                    >
                      Wake Up
                    </Button>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default VehicleSelector; 