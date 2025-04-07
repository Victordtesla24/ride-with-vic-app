import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import { getTrips } from 'models/trip';
import RideList from 'components/trip/RideList';

/**
 * TripHistory Component for displaying past rides
 * Shows statistics and a list of rides that can be filtered
 */
function TripHistory() {
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    completed: 0,
    canceled: 0,
    totalSpent: 0,
    averageFare: 0,
  });

  useEffect(() => {
    // Load trips from storage or API
    const loadTrips = async () => {
      try {
        setLoading(true);
        // Get trips from the model
        const tripsData = getTrips();
        setTrips(tripsData);
        
        // Calculate statistics
        if (tripsData.length > 0) {
          const completed = tripsData.filter(t => t.status === 'completed').length;
          const canceled = tripsData.filter(t => t.status === 'canceled').length;
          
          const completedTrips = tripsData.filter(t => t.status === 'completed');
          const totalSpent = completedTrips.reduce((sum, t) => sum + (t.finalFare || 0), 0);
          const averageFare = completed > 0 ? totalSpent / completed : 0;
          
          setStats({
            completed,
            canceled,
            totalSpent,
            averageFare,
          });
        }
      } catch (error) {
        console.error('Error loading trips:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrips();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filterTrips = () => {
    switch (tabValue) {
      case 0: // All trips
        return trips;
      case 1: // Completed trips
        return trips.filter(trip => trip.status === 'completed');
      case 2: // Canceled trips
        return trips.filter(trip => trip.status === 'canceled');
      default:
        return trips;
    }
  };

  const handleTripDeleted = (deletedTripId) => {
    // Update the trips list after deletion
    setTrips(prev => prev.filter(trip => trip.id !== deletedTripId));
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Trip History
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
              <StatsCard title="Completed Rides" value={stats.completed} />
              <StatsCard title="Canceled Rides" value={stats.canceled} />
              <StatsCard 
                title="Total Spent" 
                value={`$${stats.totalSpent.toFixed(2)}`} 
              />
              <StatsCard 
                title="Average Fare" 
                value={`$${stats.averageFare.toFixed(2)}`} 
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
              >
                <Tab label="All Trips" />
                <Tab label="Completed" />
                <Tab label="Canceled" />
              </Tabs>
            </Box>

            <RideList 
              rides={filterTrips()} 
              onTripDeleted={handleTripDeleted}
            />

            {trips.length === 0 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No trips found. Book a ride to get started!
                </Typography>
              </Box>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
}

// Stats card component for displaying trip statistics
function StatsCard({ title, value }) {
  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        minWidth: 140, 
        flex: '1 1 auto',
        textAlign: 'center',
        bgcolor: 'background.default'
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h5" component="div" sx={{ mt: 1 }}>
        {value}
      </Typography>
    </Paper>
  );
}

export default TripHistory; 