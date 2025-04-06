import React, { useState, useEffect } from 'react';
import { Button, Card, Text, Flex, Spinner, Alert } from '@chakra-ui/react';
import { FaTesla } from 'react-icons/fa';
import teslaApi from '../../lib/tesla-api.js';

/**
 * Tesla Connect component for authenticating with Tesla API
 * and connecting Tesla vehicles to the app
 */
const TeslaConnect = ({ onConnected }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = teslaApi.isAuthenticated();
        setIsConnected(connected);
        
        if (connected && onConnected) {
          onConnected(true);
        }
      } catch (err) {
        console.error('Error checking Tesla connection:', err);
      }
    };
    
    checkConnection();
  }, [onConnected]);

  // Handle the Tesla connect button click
  const handleConnectTesla = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Initialize the Tesla API client
      teslaApi.init({
        clientId: process.env.NEXT_PUBLIC_TESLA_CLIENT_ID,
        redirectUri: process.env.NEXT_PUBLIC_TESLA_REDIRECT_URI
      });
      
      // Generate the authorization URL
      const authUrl = teslaApi.getAuthorizationUrl();
      
      // Redirect to Tesla auth page
      window.location.href = authUrl;
    } catch (err) {
      console.error('Error connecting to Tesla:', err);
      setError(err.message || 'Failed to connect to Tesla');
      setIsLoading(false);
    }
  };

  // Handle disconnect
  const handleDisconnect = () => {
    try {
      teslaApi.clearTokens();
      setIsConnected(false);
      if (onConnected) {
        onConnected(false);
      }
    } catch (err) {
      console.error('Error disconnecting Tesla:', err);
      setError(err.message || 'Failed to disconnect Tesla');
    }
  };

  return (
    <Card p={4} mb={4} borderRadius="md" boxShadow="md">
      <Flex direction="column" align="center">
        <Flex align="center" mb={4}>
          <FaTesla size={24} style={{ marginRight: '8px' }} />
          <Text fontSize="xl" fontWeight="bold">
            Tesla Connection
          </Text>
        </Flex>
        
        {error && (
          <Alert status="error" mb={4} borderRadius="md">
            {error}
          </Alert>
        )}
        
        {isConnected ? (
          <Flex direction="column" align="center" w="100%">
            <Text color="green.500" mb={2}>
              ✓ Connected to Tesla
            </Text>
            <Button
              colorScheme="red"
              variant="outline"
              onClick={handleDisconnect}
              size="sm"
            >
              Disconnect
            </Button>
          </Flex>
        ) : (
          <Button
            leftIcon={<FaTesla />}
            colorScheme="blue"
            onClick={handleConnectTesla}
            isLoading={isLoading}
            loadingText="Connecting..."
            w="100%"
          >
            Connect Tesla
          </Button>
        )}
      </Flex>
    </Card>
  );
};

export default TeslaConnect; 