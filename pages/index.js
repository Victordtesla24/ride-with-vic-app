import React, { useState, useEffect } from 'react';
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
  Chip,
  alpha,
  Fade
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalculateIcon from '@mui/icons-material/Calculate';
import StarIcon from '@mui/icons-material/Star';
import SpeedIcon from '@mui/icons-material/Speed';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TeslaIcon from '@mui/icons-material/ElectricCar';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import EvStationIcon from '@mui/icons-material/EvStation';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import { useRouter } from 'next/router';

// Import mock data
import { popularDestinations, savedAddresses } from 'lib/mockData';

export default function HomePage({ themeContext }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const router = useRouter();
  
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [activeSection, setActiveSection] = useState(0);
  
  // Effect for section animation
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const sections = document.querySelectorAll('.animated-section');
      
      sections.forEach((section, index) => {
        const sectionTop = section.offsetTop;
        if (scrollPosition > sectionTop - window.innerHeight / 1.5) {
          setActiveSection(index);
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
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
  
  // Handle Tesla option
  const handleTeslaOption = () => {
    router.push('/tesla');
  };
  
  // Features section content
  const features = [
    {
      iconType: SpeedIcon,
      title: 'Fast & Reliable',
      description: 'Our drivers arrive promptly and get you to your destination safely and on time.'
    },
    {
      iconType: AttachMoneyIcon,
      title: 'Competitive Pricing',
      description: 'Enjoy affordable rides with transparent pricing and no hidden fees.'
    },
    {
      iconType: StarIcon,
      title: 'Top-Rated Service',
      description: 'Our drivers maintain an average rating of 4.8 stars from thousands of customers.'
    },
    {
      iconType: SupportAgentIcon,
      title: '24/7 Support',
      description: 'Our customer service team is available around the clock to assist you.'
    }
  ];
  
  // Ride options section content
  const rideOptions = [
    {
      title: 'Tesla Model 3',
      description: 'All-electric sedan with a range of up to 358 miles, perfect for eco-friendly city travel.',
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80',
      price: 'From $15',
      features: ['Electric', 'Autopilot', '5 Seats']
    },
    {
      title: 'Tesla Model Y',
      description: 'Spacious electric SUV with premium interior and advanced technology features.',
      image: 'https://images.unsplash.com/photo-1617704548623-340376564e04?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80',
      price: 'From $20',
      features: ['Electric', 'Autopilot', '7 Seats']
    },
    {
      title: 'Tesla Model X',
      description: 'Luxury electric SUV with falcon-wing doors, ideal for groups and special occasions.',
      image: 'https://images.unsplash.com/photo-1566833816403-1d83080f7dc3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80',
      price: 'From $25',
      features: ['Electric', 'Autopilot', 'Falcon Doors']
    }
  ];
  
  // Tesla benefits section
  const teslaBenefits = [
    {
      icon: <BatteryChargingFullIcon sx={{ fontSize: 40 }} />,
      title: 'Zero Emissions',
      description: 'Electric vehicles produce no tailpipe emissions, helping to reduce air pollution and combat climate change.'
    },
    {
      icon: <EvStationIcon sx={{ fontSize: 40 }} />,
      title: 'Charging Network',
      description: 'Access to Tesla\'s extensive Supercharger network for convenient charging during longer trips.'
    },
    {
      icon: <TeslaIcon sx={{ fontSize: 40 }} />,
      title: 'Advanced Technology',
      description: 'Experience Tesla\'s cutting-edge technology including Autopilot features for a safer, more comfortable ride.'
    },
    {
      icon: <PhoneIphoneIcon sx={{ fontSize: 40 }} />,
      title: 'Mobile Control',
      description: 'Monitor and control your Tesla through the mobile app, including climate control and charging status.'
    }
  ];
  
  // Modify the features rendering to create Icon elements at render time
  const renderFeatures = () => {
    return features.map((feature, index) => {
      const IconComponent = feature.iconType;
      return (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              height: '100%', 
              textAlign: 'center', 
              transition: 'all 0.3s ease', 
              borderRadius: theme.shape.borderRadius,
              '&:hover': { 
                transform: 'translateY(-8px)',
                boxShadow: theme.shadows[8]
              } 
            }}
          >
            <Box 
              sx={{ 
                mb: 2, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: 70,
                height: 70,
                borderRadius: '50%',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                margin: '0 auto 16px'
              }}
            >
              <IconComponent sx={{ fontSize: 35, color: theme.palette.primary.main }} />
            </Box>
            <Typography variant="h6" gutterBottom fontWeight="medium">{feature.title}</Typography>
            <Typography variant="body2" color="text.secondary">{feature.description}</Typography>
          </Paper>
        </Grid>
      );
    });
  };
  
  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1619015483078-6abcf9596ae9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: isMobile ? '80vh' : '90vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={5} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in={true} timeout={1000}>
                <Box
                  sx={{
                    color: 'white',
                    textAlign: isMobile ? 'center' : 'left',
                    mb: 4
                  }}
                >
                  <Typography variant="h2" component="h1" gutterBottom fontWeight="bold" 
                    sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                    Ride with Vic
                  </Typography>
                  <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                    Your premium Tesla ride service
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 2, mb: 4, opacity: 0.9, maxWidth: '600px' }}>
                    Experience the future of transportation with our all-electric Tesla fleet. 
                    Eco-friendly, luxurious, and on-demand — the smarter way to travel.
                  </Typography>
                  <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: isMobile ? 'center' : 'flex-start' }}>
                    <Button 
                      variant="contained" 
                      size="large" 
                      sx={{ 
                        px: 4, 
                        py: 1.5,
                        borderRadius: '30px',
                        boxShadow: '0 8px 20px rgba(52, 152, 219, 0.3)'
                      }}
                    >
                      Book Now
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="large" 
                      sx={{ 
                        px: 4,
                        py: 1.5,
                        color: 'white', 
                        borderColor: 'white',
                        borderRadius: '30px',
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
                    >
                      Learn More
                    </Button>
                  </Box>
                </Box>
              </Fade>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Fade in={true} timeout={1500}>
                <Paper
                  elevation={8}
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: 'blur(20px)',
                    maxWidth: '500px',
                    mx: 'auto',
                    transform: isTablet ? 'none' : 'translateY(-20px)'
                  }}
                >
                  <Typography variant="h5" gutterBottom fontWeight="medium">
                    Book Your Ride
                  </Typography>
                  
                  <Box component="form" sx={{ mt: 3 }}>
                    <Autocomplete
                      value={pickup}
                      onChange={(event, newValue) => setPickup(newValue)}
                      options={locationOptions}
                      groupBy={(option) => option.group}
                      getOptionLabel={(option) => option?.label || ''}
                      isOptionEqualToValue={(option, value) => option?.value === value?.value}
                      renderOption={(props, option) => (
                        <li {...props}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                            <Box>
                              <Typography variant="body1">{option.label}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.value}
                              </Typography>
                            </Box>
                          </Box>
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="Pickup Location" 
                          variant="outlined" 
                          fullWidth 
                          margin="normal"
                          placeholder="Enter pickup address"
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <LocationOnIcon color="primary" sx={{ ml: 1, mr: 0.5 }} />
                                {params.InputProps.startAdornment}
                              </>
                            )
                          }}
                        />
                      )}
                    />
                    
                    <Autocomplete
                      value={dropoff}
                      onChange={(event, newValue) => setDropoff(newValue)}
                      options={locationOptions}
                      groupBy={(option) => option.group}
                      getOptionLabel={(option) => option?.label || ''}
                      isOptionEqualToValue={(option, value) => option?.value === value?.value}
                      renderOption={(props, option) => (
                        <li {...props}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationOnIcon color="secondary" sx={{ mr: 1 }} />
                            <Box>
                              <Typography variant="body1">{option.label}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.value}
                              </Typography>
                            </Box>
                          </Box>
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="Dropoff Location" 
                          variant="outlined" 
                          fullWidth 
                          margin="normal"
                          placeholder="Enter destination address"
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <LocationOnIcon color="secondary" sx={{ ml: 1, mr: 0.5 }} />
                                {params.InputProps.startAdornment}
                              </>
                            )
                          }}
                        />
                      )}
                    />
                    
                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                      <Button 
                        fullWidth 
                        variant="contained" 
                        size="large" 
                        onClick={handleBookRide}
                        disabled={!pickup || !dropoff}
                        sx={{ py: 1.5, borderRadius: theme.shape.borderRadius }}
                      >
                        Book Now
                      </Button>
                      <Button 
                        variant="outlined" 
                        size="large" 
                        onClick={handleGetEstimate}
                        sx={{ py: 1.5, borderRadius: theme.shape.borderRadius }}
                      >
                        <CalculateIcon sx={{ mr: 1 }} />
                        Estimate
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Why Choose Us Section */}
      <Box 
        className="animated-section"
        sx={{ 
          py: { xs: 6, md: 10 },
          backgroundColor: theme.palette.background.default
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="overline" 
              component="div" 
              color="primary" 
              fontWeight="bold"
              sx={{ mb: 1, letterSpacing: 2 }}
            >
              WHY CHOOSE US
            </Typography>
            <Typography 
              variant="h3" 
              component="h2" 
              fontWeight="bold"
              gutterBottom
              sx={{ mb: 2 }}
            >
              The Smarter Way to Travel
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                maxWidth: '700px', 
                mx: 'auto',
                fontSize: '1.1rem',
                lineHeight: 1.6  
              }}
            >
              We combine reliable service with cutting-edge technology to deliver the best ride experience possible.
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {renderFeatures()}
          </Grid>
        </Container>
      </Box>
      
      {/* Tesla Fleet Section */}
      <Box 
        className="animated-section"
        sx={{ 
          py: { xs: 6, md: 10 },
          backgroundColor: alpha(theme.palette.primary.main, 0.05)
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="overline" 
              component="div" 
              color="primary" 
              fontWeight="bold"
              sx={{ mb: 1, letterSpacing: 2 }}
            >
              OUR FLEET
            </Typography>
            <Typography 
              variant="h3" 
              component="h2" 
              fontWeight="bold"
              gutterBottom
              sx={{ mb: 2 }}
            >
              Premium Tesla Vehicles
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                maxWidth: '700px', 
                mx: 'auto',
                fontSize: '1.1rem',
                lineHeight: 1.6  
              }}
            >
              Experience the luxury, performance, and eco-friendly benefits of our all-electric Tesla fleet.
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {rideOptions.map((option, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    borderRadius: theme.shape.borderRadius,
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[8]
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={option.image}
                    alt={option.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h5" component="h3" fontWeight="bold">
                        {option.title}
                      </Typography>
                      <Chip 
                        label={option.price} 
                        color="primary" 
                        size="small"
                        sx={{ fontWeight: 'bold' }} 
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {option.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                      {option.features.map((feature, idx) => (
                        <Chip 
                          key={idx} 
                          label={feature} 
                          size="small" 
                          variant="outlined"
                          sx={{ 
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            borderColor: 'transparent'
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                  <Box sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      color="primary"
                      onClick={handleTeslaOption}
                      endIcon={<ArrowForwardIcon />}
                    >
                      Select This Vehicle
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* Tesla Benefits Section */}
      <Box 
        className="animated-section"
        sx={{ 
          py: { xs: 6, md: 10 },
          backgroundImage: `linear-gradient(to right, ${alpha(theme.palette.primary.dark, 0.9)}, ${alpha(theme.palette.primary.main, 0.9)}), url('https://images.unsplash.com/photo-1617704517338-cc146ce6bc3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="overline" 
              component="div" 
              fontWeight="bold"
              sx={{ mb: 1, letterSpacing: 2, color: 'white' }}
            >
              TESLA ADVANTAGE
            </Typography>
            <Typography 
              variant="h3" 
              component="h2" 
              fontWeight="bold"
              gutterBottom
              sx={{ mb: 2, color: 'white' }}
            >
              Benefits of Tesla
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                maxWidth: '700px', 
                mx: 'auto',
                fontSize: '1.1rem',
                lineHeight: 1.6,
                color: alpha('#ffffff', 0.9)
              }}
            >
              Discover why our Tesla fleet offers the most advanced and sustainable transport experience available.
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {teslaBenefits.map((benefit, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Box sx={{ 
                  display: 'flex', 
                  p: 3, 
                  backgroundColor: alpha('#ffffff', 0.1),
                  backdropFilter: 'blur(10px)',
                  borderRadius: theme.shape.borderRadius,
                  height: '100%',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    backgroundColor: alpha('#ffffff', 0.15)
                  }
                }}>
                  <Box sx={{ 
                    mr: 3, 
                    display: 'flex', 
                    alignItems: 'flex-start',
                    color: 'white' 
                  }}>
                    {benefit.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" gutterBottom fontWeight="medium" sx={{ color: 'white' }}>
                      {benefit.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.9) }}>
                      {benefit.description}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button 
              variant="contained" 
              size="large" 
              color="secondary"
              sx={{ 
                px: 4, 
                py: 1.5,
                borderRadius: '30px',
                backgroundColor: 'white',
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: alpha('white', 0.9)
                }
              }}
              onClick={handleTeslaOption}
            >
              Explore Tesla Options
            </Button>
          </Box>
        </Container>
      </Box>
      
      {/* Call to Action */}
      <Box 
        className="animated-section"
        sx={{ 
          py: { xs: 6, md: 8 },
          backgroundColor: theme.palette.background.paper,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant="h3" 
            component="h2" 
            fontWeight="bold"
            gutterBottom
          >
            Ready to Experience the Future?
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              maxWidth: '600px', 
              mx: 'auto',
              mb: 4,
              fontSize: '1.1rem'
            }}
          >
            Join thousands of satisfied customers who've already made the switch to our eco-friendly, premium Tesla ride service.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              size="large" 
              sx={{ 
                px: 4, 
                py: 1.5,
                borderRadius: '30px'
              }}
              onClick={() => router.push('/book')}
            >
              Book Your Ride Now
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              sx={{ 
                px: 4,
                py: 1.5,
                borderRadius: '30px'
              }}
              onClick={() => router.push('/compare')}
            >
              Compare Options
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
} 