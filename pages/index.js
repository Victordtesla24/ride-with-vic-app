import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Paper,
  TextField,
  Autocomplete,
  useTheme,
  useMediaQuery,
  Divider
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalculateIcon from '@mui/icons-material/Calculate';
import StarIcon from '@mui/icons-material/Star';
import SpeedIcon from '@mui/icons-material/Speed';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { useRouter } from 'next/router';

// Import mock data
import { popularDestinations, savedAddresses } from '../lib/mockData';

export default function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const router = useRouter();
  
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  
  // Combine saved addresses and popular destinations for suggestions
  const locationOptions = [
    ...savedAddresses.map((addr) => ({ 
      label: addr.name, 
      value: addr.address,
      group: 'Saved Addresses'
    })),
    ...popularDestinations.map((dest) => ({ 
      label: dest.name, 
      value: dest.address,
      group: 'Popular Destinations'
    }))
  ];
  
  // Handle ride booking
  const handleBookRide = () => {
    if (pickup && dropoff) {
      // In a real app, this would navigate to booking page with the pickup/dropoff data
      router.push({
        pathname: '/book',
        query: { pickup: pickup.value, dropoff: dropoff.value }
      });
    }
  };
  
  // Handle fare estimate
  const handleGetEstimate = () => {
    router.push('/estimate');
  };
  
  // Features section content
  const features = [
    {
      icon: <SpeedIcon sx={{ fontSize: 50, color: theme.palette.primary.main }} />,
      title: 'Fast & Reliable',
      description: 'Our drivers arrive promptly and get you to your destination safely and on time.'
    },
    {
      icon: <AttachMoneyIcon sx={{ fontSize: 50, color: theme.palette.primary.main }} />,
      title: 'Competitive Pricing',
      description: 'Enjoy affordable rides with transparent pricing and no hidden fees.'
    },
    {
      icon: <StarIcon sx={{ fontSize: 50, color: theme.palette.primary.main }} />,
      title: 'Top-Rated Service',
      description: 'Our drivers maintain an average rating of 4.8 stars from thousands of customers.'
    },
    {
      icon: <SupportAgentIcon sx={{ fontSize: 50, color: theme.palette.primary.main }} />,
      title: '24/7 Support',
      description: 'Our customer service team is available around the clock to assist you.'
    }
  ];
  
  // Ride options section content
  const rideOptions = [
    {
      title: 'Economy',
      description: 'Affordable rides for everyday travel, comfortably fitting up to 4 passengers.',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80',
      price: 'From $10'
    },
    {
      title: 'Comfort',
      description: 'Newer cars with extra legroom and top-rated drivers for a more comfortable ride.',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80',
      price: 'From $15'
    },
    {
      title: 'Premium',
      description: 'Luxury vehicles with professional drivers for special occasions and important meetings.',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80',
      price: 'From $25'
    }
  ];
  
  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: isMobile ? '70vh' : '80vh',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  color: 'white',
                  textAlign: isMobile ? 'center' : 'left',
                  mb: 4
                }}
              >
                <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                  Ride with Vic
                </Typography>
                <Typography variant="h5" gutterBottom>
                  Your reliable ride, just a tap away
                </Typography>
                <Typography variant="body1" sx={{ mt: 2, mb: 4 }}>
                  Fast, convenient, and affordable rides whenever you need them. Download our app today and experience the difference.
                </Typography>
                <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: isMobile ? 'center' : 'flex-start' }}>
                  <Button variant="contained" size="large" sx={{ px: 4 }}>
                    Download App
                  </Button>
                  <Button variant="outlined" size="large" sx={{ px: 4, color: 'white', borderColor: 'white' }}>
                    Learn More
                  </Button>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper
                elevation={6}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.paper,
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Book Your Ride
                </Typography>
                
                <Box component="form" sx={{ mt: 2 }}>
                  <Autocomplete
                    value={pickup}
                    onChange={(event, newValue) => setPickup(newValue)}
                    options={locationOptions}
                    groupBy={(option) => option.group}
                    getOptionLabel={(option) => option.label}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Pickup Location" 
                        variant="outlined" 
                        fullWidth 
                        margin="normal"
                        placeholder="Enter pickup address"
                      />
                    )}
                  />
                  
                  <Autocomplete
                    value={dropoff}
                    onChange={(event, newValue) => setDropoff(newValue)}
                    options={locationOptions}
                    groupBy={(option) => option.group}
                    getOptionLabel={(option) => option.label}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Dropoff Location" 
                        variant="outlined" 
                        fullWidth 
                        margin="normal"
                        placeholder="Enter destination"
                      />
                    )}
                  />
                  
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={6}>
                      <Button 
                        variant="outlined" 
                        fullWidth
                        startIcon={<CalculateIcon />}
                        onClick={handleGetEstimate}
                      >
                        Get Estimate
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button 
                        variant="contained" 
                        fullWidth
                        color="primary"
                        startIcon={<DirectionsCarIcon />}
                        onClick={handleBookRide}
                        disabled={!pickup || !dropoff}
                      >
                        Book Now
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          Why Ride with Us
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6, maxWidth: 700, mx: 'auto' }}>
          Experience the best ride service in town with our top-rated drivers and exceptional customer service.
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper elevation={1} sx={{ p: 3, height: '100%', textAlign: 'center', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" gutterBottom>{feature.title}</Typography>
                <Typography variant="body2" color="text.secondary">{feature.description}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
      
      {/* Ride Options Section */}
      <Box sx={{ bgcolor: 'background.default', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" align="center" gutterBottom>
            Choose Your Ride
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6, maxWidth: 700, mx: 'auto' }}>
            Select the perfect vehicle for your needs, from economical to premium options.
          </Typography>
          
          <Grid container spacing={4}>
            {rideOptions.map((option, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={option.image}
                    alt={option.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="h3" gutterBottom>
                      {option.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {option.description}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {option.price}
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button variant="contained" fullWidth>
                      Select {option.title}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* CTA Section */}
      <Box sx={{ bgcolor: theme.palette.primary.main, color: 'white', py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Ready to Ride with Vic?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, fontWeight: 'normal' }}>
            Join thousands of satisfied customers who rely on us every day.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: 'white',
              color: theme.palette.primary.main,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
              },
              px: 4,
              py: 1.5,
              fontSize: '1.1rem'
            }}
          >
            Get Started Now
          </Button>
        </Container>
      </Box>
    </Box>
  );
} 