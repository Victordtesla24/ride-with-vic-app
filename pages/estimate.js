import React, { useState  } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import HistoryIcon from '@mui/icons-material/History';

// Import components
import FareEstimate from 'components/trip/FareEstimate';

// Import mock data
import { popularDestinations, savedAddresses } from 'lib/mockData';

export default function EstimatePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedPickup, setSelectedPickup] = useState('');
  const [selectedDropoff, setSelectedDropoff] = useState('');
  
  // Handle selecting a saved address as pickup
  const handleSelectPickup = (address) => {
    setSelectedPickup(address);
  };
  
  // Handle selecting a popular destination as dropoff
  const handleSelectDropoff = (address) => {
    setSelectedDropoff(address);
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Fare Estimate
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Calculate the estimated fare for your ride before booking. Enter your pickup and drop-off locations to get started.
      </Typography>
      
      <Grid container spacing={3}>
        {/* Main Fare Estimate Component */}
        <Grid item xs={12} md={8}>
          <FareEstimate 
            initialPickup={selectedPickup} 
            initialDropoff={selectedDropoff} 
          />
        </Grid>
        
        {/* Sidebar with Addresses & Popular Destinations */}
        <Grid item xs={12} md={4}>
          {/* Saved Addresses */}
          <Card sx={{ mb: 3 }}>
            <CardHeader 
              title="Saved Addresses" 
              titleTypographyProps={{ variant: 'h6' }}
              avatar={<LocationOnIcon color="primary" />}
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              <List sx={{ 
                maxHeight: isMobile ? 200 : 250, 
                overflow: 'auto' 
              }}>
                {savedAddresses.length > 0 ? (
                  savedAddresses.map((address, index) => (
                    <ListItem key={address.id || index} disablePadding>
                      <ListItemButton onClick={() => handleSelectPickup(address.address)}>
                        <ListItemText
                          primary={address.name}
                          secondary={address.address}
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary="No saved addresses"
                      secondary="Save addresses in your profile"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
          
          {/* Popular Destinations */}
          <Card>
            <CardHeader 
              title="Popular Destinations" 
              titleTypographyProps={{ variant: 'h6' }}
              avatar={<StarIcon color="primary" />}
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              <List sx={{ 
                maxHeight: isMobile ? 200 : 250, 
                overflow: 'auto' 
              }}>
                {popularDestinations.map((destination, index) => (
                  <ListItem key={destination.id || index} disablePadding>
                    <ListItemButton onClick={() => handleSelectDropoff(destination.address)}>
                      <ListItemText
                        primary={destination.name}
                        secondary={destination.address}
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
          
          {/* Previous Estimates */}
          <Box mt={3} display="flex" justifyContent="center">
            <Button 
              variant="outlined" 
              color="primary"
              startIcon={<HistoryIcon />}
            >
              View Recent Estimates
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
} 