import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  useTheme,
  Divider
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import ReceiptIcon from '@mui/icons-material/Receipt';
import TripOriginIcon from '@mui/icons-material/TripOrigin';
import TimelineIcon from '@mui/icons-material/Timeline';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import PeopleIcon from '@mui/icons-material/People';

// Import components
import TripHistory from '../components/trip/TripHistory';
import RideList from '../components/trip/RideList';

// Import mock data
import { rideHistory } from '../lib/mockData';

export default function TripHistoryPage() {
  const [rides, setRides] = useState(rideHistory);
  const theme = useTheme();
  
  // Calculate stats
  const totalRides = rides.length;
  const totalSpent = rides.reduce((sum, ride) => sum + parseFloat(ride.fare), 0).toFixed(2);
  
  // Get the most frequent destination
  const destinations = rides.map(ride => ride.dropoff);
  const destinationCounts = destinations.reduce((acc, dest) => {
    acc[dest] = (acc[dest] || 0) + 1;
    return acc;
  }, {});
  
  let mostFrequentDestination = { name: 'None', count: 0 };
  
  for (const [dest, count] of Object.entries(destinationCounts)) {
    if (count > mostFrequentDestination.count) {
      mostFrequentDestination = { name: dest, count };
    }
  }
  
  // Stats cards
  const statsCards = [
    {
      title: 'Total Rides',
      value: totalRides.toString(),
      icon: <LocalTaxiIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      color: theme.palette.primary.main
    },
    {
      title: 'Total Spent',
      value: `$${totalSpent}`,
      icon: <ReceiptIcon sx={{ fontSize: 40, color: theme.palette.secondary.main }} />,
      color: theme.palette.secondary.main
    },
    {
      title: 'Most Frequent Destination',
      value: mostFrequentDestination.name.length > 20 
        ? mostFrequentDestination.name.substring(0, 20) + '...' 
        : mostFrequentDestination.name,
      subtitle: `${mostFrequentDestination.count} rides`,
      icon: <TripOriginIcon sx={{ fontSize: 40, color: theme.palette.info.main }} />,
      color: theme.palette.info.main
    },
    {
      title: 'Average Ride Cost',
      value: `$${(totalSpent / totalRides).toFixed(2)}`,
      icon: <TimelineIcon sx={{ fontSize: 40, color: theme.palette.success.main }} />,
      color: theme.palette.success.main
    }
  ];
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Trip History
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" color="text.secondary">
                    {card.title}
                  </Typography>
                  {card.icon}
                </Box>
                <Typography variant="h4" sx={{ my: 1, color: card.color }}>
                  {card.value}
                </Typography>
                {card.subtitle && (
                  <Typography variant="body2" color="text.secondary">
                    {card.subtitle}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Divider sx={{ my: 4 }} />
      
      {/* Trip History Section */}
      <Box>
        <Typography variant="h5" gutterBottom>
          Your Rides
        </Typography>
        
        {/* Use both components for different views/functionality */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <TripHistory rides={rides} />
          </Grid>
          
          {/* Uncomment to use RideList as alternate view
          <Grid item xs={12} md={12}>
            <RideList rides={rides} />
          </Grid>
          */}
        </Grid>
      </Box>
    </Container>
  );
} 