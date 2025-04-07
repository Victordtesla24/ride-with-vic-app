import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, Button, Alert } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';

/**
 * BasicMap component that displays a Google Map
 * Handles errors gracefully when API key is missing or invalid
 */
const BasicMap = ({ 
  width = '100%', 
  height = '300px'}) => {
  const [mapError] = useState(null);

  // Check if the Google Maps API is loaded
  const isGoogleMapsLoaded = typeof window !== 'undefined' && window.google && window.google.maps;

  // Handle Google Maps API loading error

  // Function to reload the page after setting the API key
  const handleReload = () => {
    window.location.reload();
  };

  // If there's an error or Google Maps isn't loaded
  if (mapError || !isGoogleMapsLoaded) {
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          width, 
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

  // If all is well, render the map
  return (
    <Box 
      sx={{ 
        width, 
        height,
        position: 'relative',
        '& .map-container': {
          width: '100%',
          height: '100%'
        }
      }}
    >
      <div id="map" className="map-container" />
      {/* Map will be rendered here by Google Maps API */}
    </Box>
  );
};

export default BasicMap; 