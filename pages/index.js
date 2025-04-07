import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Box, Button, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { FaLocationArrow, FaStar, FaHistory } from 'react-icons/fa';

import AddressInput from 'components/address/AddressInput';
import PopularDestinations from 'components/destinations/PopularDestinations';
import SavedAddresses from 'components/address/SavedAddresses';
import MainLayout from 'components/layout/MainLayout';

import { getPopularDestinations } from 'lib/data/destinations';
import { getSavedAddresses } from 'lib/data/addresses';
import { initializeDataStores } from 'lib/data';

export default function HomePage() {
  const router = useRouter();
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize data stores for development
    if (process.env.NODE_ENV !== 'production') {
      initializeDataStores();
    }
    
    // Load data from services
    const loadData = () => {
      try {
        // Get popular destinations
        const destinations = getPopularDestinations();
        setPopularDestinations(destinations);
        
        // Get saved addresses
        const addresses = getSavedAddresses();
        setSavedAddresses(addresses);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Set up interval to refresh data periodically
    const refreshInterval = setInterval(loadData, 30000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  const handleDestinationSelect = (destination) => {
    router.push({
      pathname: '/book',
      query: { destination: destination.address }
    });
  };

  const handleAddressSelect = (address) => {
    router.push({
      pathname: '/book',
      query: { destination: address.full }
    });
  };

  const handleHistoryClick = () => {
    router.push('/trips');
  };

  return (
    <MainLayout>
      <Head>
        <title>Ride with Vic - Book a Ride</title>
        <meta name="description" content="Book a ride with your Tesla" />
      </Head>

      <VStack spacing={6} align="stretch" width="100%" px={4}>
        <Heading as="h1" size="xl" my={4}>
          Where to?
        </Heading>

        <AddressInput 
          placeholder="Enter destination" 
          onAddressSelect={handleAddressSelect}
        />

        <Box mt={8}>
          <Flex justify="space-between" align="center" mb={2}>
            <Heading as="h2" size="md" display="flex" alignItems="center">
              <FaStar color="#FFD700" style={{ marginRight: '8px' }} /> Popular Destinations
            </Heading>
          </Flex>
          <PopularDestinations
            destinations={popularDestinations}
            isLoading={isLoading}
            onSelect={handleDestinationSelect}
          />
        </Box>

        <Box mt={6}>
          <Flex justify="space-between" align="center" mb={2}>
            <Heading as="h2" size="md" display="flex" alignItems="center">
              <FaLocationArrow style={{ marginRight: '8px' }} /> Saved Addresses
            </Heading>
          </Flex>
          <SavedAddresses
            addresses={savedAddresses}
            isLoading={isLoading}
            onSelect={handleAddressSelect}
          />
        </Box>

        <Box mt={6}>
          <Button 
            leftIcon={<FaHistory />} 
            colorScheme="gray" 
            variant="outline" 
            width="100%"
            onClick={handleHistoryClick}
          >
            View Trip History
          </Button>
        </Box>
      </VStack>
    </MainLayout>
  );
} 