import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Chip,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TimerIcon from '@mui/icons-material/Timer';
import SpeedIcon from '@mui/icons-material/Speed';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StopIcon from '@mui/icons-material/Stop';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

const LiveTripCard = ({ trip, onTripEnd, autoCenter = true }) => {
  const [isTracking, setIsTracking] = useState(true);
  const [tripData, setTripData] = useState({
    ...trip,
    startTime: new Date(),
    elapsedTime: 0,
    distance: 0,
    currentFare: 0,
    vehicleLocation: null,
    telemetryData: []
  });
  const [locationPoints, setLocationPoints] = useState([]);
  const [endTripDialogOpen, setEndTripDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Refs for map components
  const mapRef = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const path = useRef(null);
  const timerRef = useRef(null);
  const telemetryRef = useRef(null);

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapRef.current || !window.google || !window.google.maps) return;
    
    map.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 40.7128, lng: -74.0060 }, // Default NYC
      zoom: 14,
      disableDefaultUI: true,
      styles: [
        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
      ]
    });
    
    marker.current = new window.google.maps.Marker({
      map: map.current,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: "#3498db",
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeWeight: 2
      }
    });
    
    path.current = new window.google.maps.Polyline({
      map: map.current,
      path: [],
      strokeColor: '#3498db',
      strokeOpacity: 0.8,
      strokeWeight: 3
    });
    
    // Start tracking when component mounts
    startTracking();
    
    return () => {
      stopTracking();
    };
  }, [startTracking]);
  
  // Format duration in HH:MM:SS
  const formatDuration = (durationMs) => {
    const seconds = Math.floor(durationMs / 1000) % 60;
    const minutes = Math.floor(durationMs / (1000 * 60)) % 60;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };
  
  // Start tracking timer and location updates
  const startTracking = useCallback(() => {
    setIsTracking(true);
    
    // Convert degrees to radians - moved inside the callback
    const toRad = (degrees) => {
      return degrees * Math.PI / 180;
    };
    
    // Calculate distance between two points (haversine formula) - moved inside the callback
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 3958.8; // Earth's radius in miles
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      return distance;
    };
    
    // Start timer for elapsed time
    timerRef.current = setInterval(() => {
      const now = new Date();
      const elapsed = now - tripData.startTime;
      setTripData(prev => ({
        ...prev,
        elapsedTime: elapsed
      }));
    }, 1000);
    
    // Calculate total distance from location points - moved inside the callback
    const calculateTotalDistance = () => {
      if (locationPoints.length < 2) return 0;
      
      let total = 0;
      for (let i = 1; i < locationPoints.length; i++) {
        const prev = locationPoints[i-1];
        const curr = locationPoints[i];
        total += calculateDistance(
          prev.latitude, 
          prev.longitude, 
          curr.latitude, 
          curr.longitude
        );
      }
      
      return total;
    };
    
    // Calculate fare based on distance and time - moved inside the callback
    const calculateFare = (distance, durationMs) => {
      // Base fare: $2.50
      // Per mile: $1.50
      // Per minute: $0.30
      const baseFare = 2.50;
      const perMile = 1.50;
      const perMinute = 0.30;
      
      const minutes = durationMs / (1000 * 60);
      
      return baseFare + (distance * perMile) + (minutes * perMinute);
    };
    
    // Define updateVehicleLocation inside the callback to avoid dependency issues
    const updateVehicleLocation = async () => {
      if (!trip.vehicleId) return;
      
      try {
        const response = await fetch(`/api/vehicle/telemetry?vehicleId=${trip.vehicleId}`);
        const data = await response.json();
        
        if (data.success && data.location) {
          const { latitude, longitude, timestamp, speed } = data.location;
          
          // Create location point
          const newPoint = {
            latitude,
            longitude,
            timestamp,
            speed: speed || 0
          };
          
          // Update location points
          setLocationPoints(prev => [...prev, newPoint]);
          
          // Update map
          if (map.current && marker.current) {
            const position = { lat: latitude, lng: longitude };
            marker.current.setPosition(position);
            
            // Auto-center map if enabled
            if (autoCenter) {
              map.current.setCenter(position);
            }
            
            // Update path
            if (path.current) {
              const pathCoords = path.current.getPath();
              pathCoords.push(new window.google.maps.LatLng(latitude, longitude));
            }
          }
          
          // Update trip data
          const distance = calculateTotalDistance();
          const fare = calculateFare(distance, tripData.elapsedTime);
          
          setTripData(prev => ({
            ...prev,
            distance,
            currentFare: fare,
            vehicleLocation: { latitude, longitude },
            telemetryData: [...prev.telemetryData, newPoint]
          }));
        }
      } catch (error) {
        console.error('Error updating vehicle location:', error);
      }
    };
    
    // Start telemetry updates
    telemetryRef.current = setInterval(() => {
      updateVehicleLocation();
    }, 5000);
    
  }, [trip.vehicleId, tripData.startTime, tripData.elapsedTime, locationPoints, autoCenter]);
  
  // Stop tracking and clear intervals
  const stopTracking = () => {
    setIsTracking(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (telemetryRef.current) clearInterval(telemetryRef.current);
  };
  
  // Handle end trip button click
  const handleEndTripClick = () => {
    setEndTripDialogOpen(true);
  };
  
  // End the trip and process data
  const handleEndTrip = async () => {
    setLoading(true);
    stopTracking();
    
    try {
      const finalTripData = {
        ...tripData,
        endTime: new Date(),
        finalDistance: tripData.distance,
        finalFare: tripData.currentFare
      };
      
      // Call API to end trip
      const response = await fetch('/api/trip/end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(finalTripData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Call onTripEnd callback with final data
        if (onTripEnd) {
          onTripEnd(data.trip);
        }
      } else {
        console.error('Error ending trip:', data.error);
      }
    } catch (error) {
      console.error('Error ending trip:', error);
    } finally {
      setLoading(false);
      setEndTripDialogOpen(false);
    }
  };
  
  // Use startTracking in useEffect with dependency array
  useEffect(() => {
    if (isTracking) {
      startTracking();
    }
    
    return () => {
      stopTracking();
    };
  }, [isTracking, startTracking]);
  
  return (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DirectionsCarIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Tesla Trip</Typography>
          </Box>
          <Chip 
            label={isTracking ? "Active" : "Inactive"} 
            color={isTracking ? "success" : "default"}
            size="small"
          />
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Box 
          ref={mapRef} 
          sx={{ 
            width: '100%', 
            height: 300, 
            mb: 2, 
            borderRadius: 1, 
            bgcolor: 'background.default' 
          }}
        />
        
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <TimerIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle2">Duration</Typography>
              </Box>
              <Typography variant="h6">
                {formatDuration(tripData.elapsedTime)}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <SpeedIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle2">Distance</Typography>
              </Box>
              <Typography variant="h6">
                {tripData.distance.toFixed(1)} mi
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <AttachMoneyIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle2">Current Fare</Typography>
              </Box>
              <Typography variant="h6">
                ${tripData.currentFare.toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Trip Details</Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                  <LocationOnIcon fontSize="small" sx={{ mt: 0.5, mr: 1, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">From</Typography>
                    <Typography variant="body1">{trip.startLocation?.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {trip.startLocation?.address}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <LocationOnIcon fontSize="small" sx={{ mt: 0.5, mr: 1, color: 'secondary.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">To</Typography>
                    <Typography variant="body1">{trip.endLocation?.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {trip.endLocation?.address}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="contained"
            color="error"
            startIcon={<StopIcon />}
            onClick={handleEndTripClick}
            disabled={!isTracking || loading}
          >
            End Trip
          </Button>
        </Box>
        
        {/* End Trip Dialog */}
        <Dialog
          open={endTripDialogOpen}
          onClose={() => setEndTripDialogOpen(false)}
        >
          <DialogTitle>End Trip</DialogTitle>
          <DialogContent>
            <Typography paragraph>
              Are you sure you want to end this trip? This will:
            </Typography>
            <ul>
              <li>Stop tracking the vehicle</li>
              <li>Calculate the final fare</li>
              <li>Generate a receipt</li>
            </ul>
            <Typography paragraph sx={{ fontWeight: 'bold' }}>
              Current Trip Details:
            </Typography>
            <Typography>
              Duration: {formatDuration(tripData.elapsedTime)}
            </Typography>
            <Typography>
              Distance: {tripData.distance.toFixed(1)} miles
            </Typography>
            <Typography>
              Fare: ${tripData.currentFare.toFixed(2)}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEndTripDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleEndTrip} 
              variant="contained" 
              color="error" 
              disabled={loading}
            >
              End Trip
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default LiveTripCard; 