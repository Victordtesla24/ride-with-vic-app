#!/usr/bin/env node

/**
 * Tesla API Integration Test Script
 * 
 * This script tests the Tesla Fleet API integration using cURL
 * to verify authentication, vehicle access, and telemetry data.
 */

import fetch from 'node-fetch';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

async function loadEnv() {
  try {
    // Try to load from .env.local first
    const envLocalPath = path.join(rootDir, '.env.local');
    const envLocalExists = await fs.access(envLocalPath).then(() => true).catch(() => false);
    
    if (envLocalExists) {
      dotenv.config({ path: envLocalPath });
      console.log('Loaded environment variables from .env.local');
    } else {
      // Fall back to .env
      const envPath = path.join(rootDir, '.env');
      dotenv.config({ path: envPath });
      console.log('Loaded environment variables from .env');
    }
  } catch (error) {
    console.error('Error loading environment variables:', error);
    process.exit(1);
  }
}

async function checkRequiredEnvVars() {
  const requiredVars = [
    'NEXT_PUBLIC_TESLA_CLIENT_ID',
    'NEXT_PUBLIC_TESLA_REDIRECT_URI',
    'NEXT_PUBLIC_TESLA_API_BASE_URL',
    'NEXT_PUBLIC_TESLA_AUTH_URL'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars.join(', '));
    console.error('Please add them to your .env.local file');
    process.exit(1);
  }
}

async function authenticateWithTesla() {
  console.log('\n🔄 Authenticating with Tesla API...');
  
  // For testing purposes, we'd need actual credentials
  // In a real scenario, you'd have the token from the OAuth flow
  console.log('⚠️ NOTE: This script requires an access token from the OAuth flow.');
  console.log('Please complete the OAuth flow in the browser first by logging in to your Tesla account.');
  
  // Check if we have a stored token
  const tokenPath = path.join(rootDir, '.tesla-test-token.json');
  try {
    const tokenData = JSON.parse(await fs.readFile(tokenPath, 'utf8'));
    console.log('✅ Found stored token');
    return tokenData.access_token;
  } catch (error) {
    console.error('❌ No stored token found or token is invalid.');
    console.log('Please log in to the application first to generate a token.');
    process.exit(1);
  }
}

async function getVehicles(accessToken) {
  console.log('\n🔄 Retrieving vehicles...');
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_TESLA_API_BASE_URL}/api/1/vehicles`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    console.log(`✅ Retrieved ${data.count} vehicles`);
    
    if (data.count === 0) {
      console.log('No vehicles found in your account.');
      return null;
    }
    
    return data.response[0].id;
  } catch (error) {
    console.error('❌ Error retrieving vehicles:', error.message);
    return null;
  }
}

async function getVehicleData(accessToken, vehicleId) {
  console.log('\n🔄 Retrieving vehicle data...');
  
  try {
    // Wake up the vehicle first if it's asleep
    console.log('⏰ Waking up vehicle...');
    const wakeupResponse = await fetch(`${process.env.NEXT_PUBLIC_TESLA_API_BASE_URL}/api/1/vehicles/${vehicleId}/wake_up`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!wakeupResponse.ok) {
      console.log('⚠️ Could not wake up vehicle, trying to get data anyway...');
    } else {
      console.log('✅ Vehicle wake up command sent');
      
      // Wait for the vehicle to wake up
      console.log('⏳ Waiting for vehicle to wake up (this may take a minute)...');
      let isAwake = false;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!isAwake && attempts < maxAttempts) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        
        const stateResponse = await fetch(`${process.env.NEXT_PUBLIC_TESLA_API_BASE_URL}/api/1/vehicles/${vehicleId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (stateResponse.ok) {
          const stateData = await stateResponse.json();
          if (stateData.response && stateData.response.state === 'online') {
            isAwake = true;
            console.log('✅ Vehicle is now awake');
          } else {
            console.log(`⏳ Vehicle state: ${stateData.response ? stateData.response.state : 'unknown'} (attempt ${attempts}/${maxAttempts})`);
          }
        }
      }
      
      if (!isAwake) {
        console.log('⚠️ Vehicle did not wake up after multiple attempts, trying to get data anyway...');
      }
    }
    
    // Get vehicle data
    const dataResponse = await fetch(`${process.env.NEXT_PUBLIC_TESLA_API_BASE_URL}/api/1/vehicles/${vehicleId}/vehicle_data`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!dataResponse.ok) {
      throw new Error(`HTTP error ${dataResponse.status}: ${await dataResponse.text()}`);
    }
    
    const data = await dataResponse.json();
    console.log('✅ Retrieved vehicle data');
    
    const vehicleData = data.response;
    
    console.log('\n📊 Vehicle Information:');
    console.log(`   Model: ${vehicleData.vehicle_config.car_type}`);
    console.log(`   Display Name: ${vehicleData.vehicle_state.vehicle_name}`);
    console.log(`   VIN: ${vehicleData.vin}`);
    
    console.log('\n🔋 Battery Status:');
    console.log(`   Battery Level: ${vehicleData.charge_state.battery_level}%`);
    console.log(`   Charging State: ${vehicleData.charge_state.charging_state}`);
    
    console.log('\n📍 Location Status:');
    if (vehicleData.drive_state) {
      console.log(`   Latitude: ${vehicleData.drive_state.latitude}`);
      console.log(`   Longitude: ${vehicleData.drive_state.longitude}`);
      console.log(`   Speed: ${vehicleData.drive_state.speed || '0'} mph`);
    } else {
      console.log('   Location data not available');
    }
    
    console.log('\n💻 Software Status:');
    console.log(`   Version: ${vehicleData.vehicle_state.car_version}`);
    
    return vehicleData;
  } catch (error) {
    console.error('❌ Error retrieving vehicle data:', error.message);
    return null;
  }
}

async function main() {
  console.log('🚙 TESLA API INTEGRATION TEST 🚙');
  console.log('===============================');
  
  await loadEnv();
  await checkRequiredEnvVars();
  
  const accessToken = await authenticateWithTesla();
  if (!accessToken) return;
  
  const vehicleId = await getVehicles(accessToken);
  if (!vehicleId) return;
  
  const vehicleData = await getVehicleData(accessToken, vehicleId);
  
  console.log('\n✅ Tesla API Integration Test Completed ✅');
}

main().catch(error => {
  console.error('❌ Test failed with error:', error);
  process.exit(1);
}); 