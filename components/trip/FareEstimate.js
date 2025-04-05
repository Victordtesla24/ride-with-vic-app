import { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText,
  ListItemIcon,
  Divider,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';

// Mock service types
const SERVICE_TYPES = [
  { 
    id: 'economy', 
    name: 'Economy',
    description: 'Affordable rides for everyday use',
    icon: LocalTaxiIcon,
    multiplier: 1.0
  },
  { 
    id: 'comfort', 
    name: 'Comfort',
    description: 'More legroom and amenities',
    icon: DirectionsCarIcon,
    multiplier: 1.3
  },
  { 
    id: 'premium', 
    name: 'Premium',
    description: 'Luxury vehicles with top-rated drivers',
    icon: AirportShuttleIcon,
    multiplier: 1.8
  },
  { 
    id: 'express', 
    name: 'Express',
    description: 'Motorbike for quick trips through traffic',
    icon: TwoWheelerIcon,
    multiplier: 0.8
  }
];

// Base fare calculation constants
const BASE_FARE = 2.50;
const COST_PER_KM = 1.25;
const COST_PER_MINUTE = 0.35;

export default function FareEstimate() {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [estimates, setEstimates] = useState([]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!pickup || !dropoff) {
      setError('Please enter both pickup and dropoff locations');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, we would call an API to get distance and duration
      // For now, we'll simulate with random values
      const distance = Math.random() * 15 + 1; // 1-16 km
      const duration = Math.random() * 30 + 5; // 5-35 minutes
      
      // Calculate fare estimates for each service type
      const fareEstimates = SERVICE_TYPES.map(service => {
        const baseFare = BASE_FARE;
        const distanceCost = distance * COST_PER_KM;
        const timeCost = duration * COST_PER_MINUTE;
        const subtotal = (baseFare + distanceCost + timeCost) * service.multiplier;
        const total = subtotal.toFixed(2);
        
        // Estimated time of arrival (2-15 minutes)
        const eta = Math.floor(Math.random() * 13) + 2;
        
        return {
          ...service,
          fare: total,
          eta: eta,
          distance: distance.toFixed(1),
          duration: Math.round(duration)
        };
      });
      
      setEstimates(fareEstimates);
      setIsLoading(false);
    } catch (error) {
      console.error('Error calculating fare estimate:', error);
      setError('Failed to calculate fare estimate. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Get Fare Estimate
      </Typography>
      
      <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Pickup Location"
                fullWidth
                required
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="Enter pickup address"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Drop-off Location"
                fullWidth
                required
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                placeholder="Enter destination address"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Calculate Estimate'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {estimates.length > 0 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Estimates
          </Typography>
          
          <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
            {estimates.map((estimate, index) => {
              const Icon = estimate.icon;
              
              return (
                <Box key={estimate.id}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem alignItems="flex-start">
                    <ListItemIcon>
                      <Icon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="subtitle1">
                            {estimate.name}
                          </Typography>
                          <Typography variant="subtitle1" fontWeight="bold">
                            ${estimate.fare}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {estimate.description}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            ETA: {estimate.eta} min • {estimate.distance} km • ~{estimate.duration} min trip
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </Box>
              );
            })}
          </List>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            * Estimates are based on current traffic conditions and may vary.
          </Typography>
        </Box>
      )}
    </Box>
  );
} 