import React, { useState, useEffect } from 'react';
import { Button, Card, Text, Flex, Spinner, Alert, Box } from '@chakra-ui/react';
import { FaTesla } from 'react-icons/fa';
import teslaApi from '../../lib/tesla-api.js';

/**
 * Tesla Connect component for authenticating with Tesla API
 * and connecting Tesla vehicles to the app
 */
const TeslaConnect = ({ onConnected, debug = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = teslaApi.isAuthenticated();
        setIsConnected(connected);
        
        // Collect debug information
        setDebugInfo({
          clientId: process.env.NEXT_PUBLIC_TESLA_CLIENT_ID?.substring(0, 8) + '...',
          redirectUri: process.env.NEXT_PUBLIC_TESLA_REDIRECT_URI,
          baseUrl: process.env.NEXT_PUBLIC_TESLA_API_BASE_URL,
          authUrl: process.env.NEXT_PUBLIC_TESLA_AUTH_URL,
          isAuthenticated: connected
        });
        
        if (connected && onConnected) {
          onConnected(true);
        }
      } catch (err) {
        console.error('Error checking Tesla connection:', err);
        setDebugInfo(prev => ({
          ...prev,
          connectionError: err.message
        }));
      }
    };
    
    checkConnection();
  }, [onConnected]);

  // Handle the Tesla connect button click
  const handleConnectTesla = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Initialize the Tesla API client with all necessary parameters
      teslaApi.init({
        clientId: process.env.NEXT_PUBLIC_TESLA_CLIENT_ID,
        redirectUri: process.env.NEXT_PUBLIC_TESLA_REDIRECT_URI,
        baseUrl: process.env.NEXT_PUBLIC_TESLA_API_BASE_URL,
        authUrl: process.env.NEXT_PUBLIC_TESLA_AUTH_URL
      });
      
      // Generate the authorization URL
      const authUrl = teslaApi.getAuthorizationUrl();
      
      // Log debug information
      console.log('Tesla OAuth Debug:', {
        clientId: process.env.NEXT_PUBLIC_TESLA_CLIENT_ID?.substring(0, 8) + '...',
        redirectUri: process.env.NEXT_PUBLIC_TESLA_REDIRECT_URI,
        baseUrl: process.env.NEXT_PUBLIC_TESLA_API_BASE_URL,
        authUrl: process.env.NEXT_PUBLIC_TESLA_AUTH_URL,
        authorizationUrl: authUrl.replace(/client_id=([^&]+)/, 'client_id=[REDACTED]')
                              .replace(/state=([^&]+)/, 'state=[REDACTED]')
      });
      
      // Save auth debug info
      setDebugInfo(prev => ({
        ...prev,
        authUrlGenerated: true,
        authUrlParams: new URL(authUrl).search
          .replace(/client_id=([^&]+)/, 'client_id=[REDACTED]')
          .replace(/state=([^&]+)/, 'state=[REDACTED]')
      }));
      
      // Redirect to Tesla auth page
      window.location.href = authUrl;
    } catch (err) {
      console.error('Error connecting to Tesla:', err);
      setError(err.message || 'Failed to connect to Tesla');
      setDebugInfo(prev => ({
        ...prev,
        connectError: err.message,
        connectErrorStack: err.stack
      }));
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
      setDebugInfo(prev => ({
        ...prev,
        isAuthenticated: false,
        disconnected: true
      }));
    } catch (err) {
      console.error('Error disconnecting Tesla:', err);
      setError(err.message || 'Failed to disconnect Tesla');
      setDebugInfo(prev => ({
        ...prev,
        disconnectError: err.message
      }));
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
        
        {debug && (
          <Box mt={4} p={2} borderRadius="md" bg="gray.50" fontSize="xs" width="100%" overflowX="auto">
            <Text fontWeight="bold">Debug Info:</Text>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </Box>
        )}
      </Flex>
    </Card>
  );
};

export default TeslaConnect; 