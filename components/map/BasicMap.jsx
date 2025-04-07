import { useEffect, useRef, useState, useCallback } from 'react';
import { Box, CircularProgress, Typography, Paper, Alert, Button } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';

// Default map settings
const DEFAULT_CENTER = { lat: 40.7128, lng: -74.0060 }; // New York City
const DEFAULT_ZOOM = 12;
const mapStyles = [
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "transit",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  }
];

/**
 * BasicMap Component
 * Renders a map with pickup, dropoff, and optional vehicle location markers
 * Falls back to a placeholder when Google Maps API is not available
 * 
 * @param {Object} props
 * @param {string} props.pickup - Pickup location address
 * @param {string} props.dropoff - Dropoff location address
 * @param {Object} props.vehicleLocation - Optional vehicle location {latitude, longitude}
 * @param {string} props.height - Height of the map container
 * @returns {JSX.Element}
 */
const BasicMap = ({ pickup, dropoff, vehicleLocation, height = '400px' }) => {
  const mapRef = useRef(null);
  const map = useRef(null);
  const pickupMarker = useRef(null);
  const dropoffMarker = useRef(null);
  const vehicleMarker = useRef(null);
  const directionsRenderer = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGoogleMapsAvailable, setIsGoogleMapsAvailable] = useState(false);

  // Initialize map on load
  const initializeMap = useCallback(() => {
    if (!window.google || !window.google.maps) {
      setError('Google Maps is not loaded');
      setLoading(false);
      return;
    }

    try {
      // Create a new map
      map.current = new window.google.maps.Map(mapRef.current, {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: true,
        styles: mapStyles
      });
      
      // Create markers
      pickupMarker.current = new window.google.maps.Marker({
        map: map.current,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
          scaledSize: new window.google.maps.Size(40, 40)
        },
        visible: false,
        animation: window.google.maps.Animation.DROP
      });
      
      dropoffMarker.current = new window.google.maps.Marker({
        map: map.current,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: new window.google.maps.Size(40, 40)
        },
        visible: false,
        animation: window.google.maps.Animation.DROP
      });
      
      vehicleMarker.current = new window.google.maps.Marker({
        map: map.current,
        icon: {
          url: '/images/tesla-icon.png',
          scaledSize: new window.google.maps.Size(40, 40)
        },
        visible: false,
        animation: window.google.maps.Animation.DROP
      });
      
      // Setup directions renderer
      directionsRenderer.current = new window.google.maps.DirectionsRenderer({
        map: map.current,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#3498db',
          strokeWeight: 5,
          strokeOpacity: 0.7
        }
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error initializing map:', error);
      setError('Failed to initialize map');
      setLoading(false);
    }
  }, []);

  // Update map with locations - wrapped in useCallback to use in dependency array
  const updateMapWithLocations = useCallback(async () => {
    if (!map.current || !pickupMarker.current || !dropoffMarker.current || !vehicleMarker.current) return;
    
    setLoading(true);
    
    try {
      const geocoder = new window.google.maps.Geocoder();
      const bounds = new window.google.maps.LatLngBounds();
      
      // Geocode pickup location if provided
      if (pickup) {
        try {
          const result = await geocodeAddress(geocoder, pickup);
          const position = { lat: result.lat, lng: result.lng };
          pickupMarker.current.setPosition(position);
          pickupMarker.current.setVisible(true);
          bounds.extend(position);
        } catch (err) {
          console.error('Error geocoding pickup location:', err);
          pickupMarker.current.setVisible(false);
        }
      } else {
        pickupMarker.current.setVisible(false);
      }
      
      // Geocode dropoff location if provided
      if (dropoff) {
        try {
          const result = await geocodeAddress(geocoder, dropoff);
          const position = { lat: result.lat, lng: result.lng };
          dropoffMarker.current.setPosition(position);
          dropoffMarker.current.setVisible(true);
          bounds.extend(position);
        } catch (err) {
          console.error('Error geocoding dropoff location:', err);
          dropoffMarker.current.setVisible(false);
        }
      } else {
        dropoffMarker.current.setVisible(false);
      }
      
      // Add vehicle location if provided
      if (vehicleLocation && vehicleLocation.latitude && vehicleLocation.longitude) {
        const position = { 
          lat: vehicleLocation.latitude, 
          lng: vehicleLocation.longitude 
        };
        vehicleMarker.current.setPosition(position);
        vehicleMarker.current.setVisible(true);
        bounds.extend(position);
      } else {
        vehicleMarker.current.setVisible(false);
      }
      
      // Calculate route if both pickup and dropoff are provided
      if (pickup && dropoff) {
        try {
          const directionsService = new window.google.maps.DirectionsService();
          const route = await calculateRoute(directionsService, pickup, dropoff);
          directionsRenderer.current.setDirections(route);
        } catch (err) {
          console.error('Error calculating route:', err);
          directionsRenderer.current.setDirections(null);
        }
      } else {
        directionsRenderer.current.setDirections(null);
      }
      
      // Fit map to bounds if there are points to show
      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds);
        // Zoom out slightly for better context
        const listener = window.google.maps.event.addListener(map.current, 'idle', () => {
          if (map.current.getZoom() > 15) map.current.setZoom(15);
          window.google.maps.event.removeListener(listener);
        });
      }
    } catch (error) {
      console.error('Error updating map:', error);
      setError('Failed to update map with locations');
    } finally {
      setLoading(false);
    }
  }, [pickup, dropoff, vehicleLocation]);

  // Check if Google Maps is available on mount
  useEffect(() => {
    const checkGoogleMapsAvailability = () => {
      if (window.google && window.google.maps) {
        setIsGoogleMapsAvailable(true);
        return true;
      }
      return false;
    };

    // Try to check initially
    const isAvailable = checkGoogleMapsAvailability();
    
    if (!isAvailable) {
      // If not initially available, check again after a short delay
      // (in case the script is still loading)
      const checkInterval = setInterval(() => {
        if (checkGoogleMapsAvailability()) {
          clearInterval(checkInterval);
          initializeMap();
          // Call updateMapWithLocations after map is initialized
          if (map.current) {
            updateMapWithLocations();
          }
        }
      }, 500);
      
      // Clear interval after 10 seconds if Google Maps never loads
      setTimeout(() => {
        clearInterval(checkInterval);
        setLoading(false);
        setError('Google Maps could not be loaded. Please check your API key.');
      }, 10000);

      return () => clearInterval(checkInterval);
    } else {
      initializeMap();
      // Call updateMapWithLocations after map is initialized
      if (map.current) {
        updateMapWithLocations();
      }
    }
  }, [initializeMap, updateMapWithLocations]);

  // Update map when pickup, dropoff, or vehicle location changes
  useEffect(() => {
    if (isGoogleMapsAvailable && map.current) {
      updateMapWithLocations();
    }
  }, [pickup, dropoff, vehicleLocation, isGoogleMapsAvailable, updateMapWithLocations]);

  // Helper function to geocode an address
  const geocodeAddress = (geocoder, address) => {
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
            formattedAddress: results[0].formatted_address
          });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  };

  // Helper function to calculate a route
  const calculateRoute = (directionsService, origin, destination) => {
    return new Promise((resolve, reject) => {
      directionsService.route({
        origin,
        destination,
        travelMode: 'DRIVING'
      }, (result, status) => {
        if (status === 'OK') {
          resolve(result);
        } else {
          reject(new Error(`Directions request failed: ${status}`));
        }
      });
    });
  };

  // Function to reload the page
  const handleReload = () => {
    window.location.reload();
  };

  // If there's an error or Google Maps isn't loaded
  if (error || (!loading && !isGoogleMapsAvailable)) {
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          width: '100%', 
          height, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          p: 3,
          textAlign: 'center',
          bgcolor: 'background.default'
        }}
      >
        <MapIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Map Cannot Be Loaded
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
          Please check your Google Maps API key in the environment variables.
        </Typography>
        
        <Alert severity="info" sx={{ mb: 2, width: '100%', maxWidth: '400px' }}>
          Add a valid API key to .env.local:<br />
          <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key</code>
        </Alert>
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleReload}
        >
          Reload Page
        </Button>
      </Paper>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <Paper
        elevation={1}
        sx={{
          width: '100%',
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default'
        }}
      >
        <CircularProgress size={40} />
      </Paper>
    );
  }

  // Render the map
  return (
    <Box
      sx={{
        width: '100%',
        height,
        position: 'relative'
      }}
    >
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '4px'
        }}
      />
    </Box>
  );
};

export default BasicMap; 