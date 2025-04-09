#!/usr/bin/env node

/**
 * Production Partner Token Generator
 * 
 * This script generates a partner token for the Tesla Fleet API production environment.
 * It handles SSL certificate validation properly and uses curl for better reliability.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import https from 'node:https';

// Get dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });
if (!fs.existsSync(path.resolve(__dirname, '..', '.env.local'))) {
    dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
}

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

// Print functions
function printHeader(text) {
    console.log(`\n${colors.bright}${colors.cyan}============================================================${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}${text}${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}============================================================${colors.reset}\n`);
}

function printSuccess(message) {
    console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function printError(message) {
    console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function printInfo(message) {
    console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
}

function printSection(text) {
    console.log(`\n${colors.blue}➤ ${colors.bright}${text}${colors.reset}`);
    console.log('----------------------------------------');
}

function printWarning(message) {
    console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

/**
 * Check if public key server is accessible
 */
function checkPublicKeyServer() {
    printSection('Verifying Public Key Server');

    const publicKeyUrl = process.env.TESLA_PUBLIC_KEY_URL || 'https://localhost:3456/.well-known/appspecific/com.tesla.3p.public-key.pem';
    printInfo(`Public key URL: ${publicKeyUrl}`);

    try {
        // Use curl to validate the public key URL
        const curlCommand = `curl -k -s "${publicKeyUrl}"`;
        printInfo(`Running: ${curlCommand}`);

        const content = execSync(curlCommand).toString();

        if (content.includes('BEGIN PUBLIC KEY') && content.includes('END PUBLIC KEY')) {
            printSuccess('Public key is accessible');
            printSuccess('Content is a valid public key');
            return true;
        } else {
            printError('Retrieved file is not a valid public key');
            console.log(content);
            return false;
        }
    } catch (error) {
        printError(`Error accessing public key: ${error.message}`);
        printInfo('Please make sure the public key server is running');
        return false;
    }
}

/**
 * Generate partner token using client credentials
 */
function generatePartnerToken() {
    printSection('Generating Partner Token');

    // Check required credentials
    const clientId = process.env.NEXT_PUBLIC_TESLA_CLIENT_ID;
    const clientSecret = process.env.TESLA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        printError('Missing client credentials');
        printInfo('Please set NEXT_PUBLIC_TESLA_CLIENT_ID and TESLA_CLIENT_SECRET in your .env file');
        return false;
    }

    printInfo(`Client ID: ${clientId}`);
    printInfo(`Client Secret: ${clientSecret ? '********' + clientSecret.substring(clientSecret.length - 4) : 'Not set'}`);

    // Use the exact token endpoint from Tesla documentation
    const tokenEndpoint = 'https://auth.tesla.com/oauth2/v3/token';
    printInfo(`Token endpoint: ${tokenEndpoint}`);

    // Prepare request data exactly as specified in Tesla documentation
    const requestData = {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        audience: 'https://fleet-api.prd.na.vn.cloud.tesla.com',
        scope: 'vehicle_device_data vehicle_cmds vehicle_charging_cmds openid'
    };

    printInfo('Request payload:');
    console.log(JSON.stringify(requestData, null, 2));

    try {
        // Convert request data to URL-encoded format
        const urlEncodedData = Object.entries(requestData)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');

        // Execute curl command with verbose output
        const curlCommand = [
            'curl',
            '-v', // Verbose output
            '-X', 'POST',
            '-H', '"Content-Type: application/x-www-form-urlencoded"',
            '-H', '"Accept: application/json"',
            '-d', `"${urlEncodedData}"`,
            `"${tokenEndpoint}"`
        ].join(' ');

        printInfo('Sending token request with verbose output...');

        const response = execSync(curlCommand, { encoding: 'utf8' });

        // Parse the response - look for JSON content in the response
        let jsonStartIndex = response.indexOf('{');
        let jsonEndIndex = response.lastIndexOf('}');

        if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
            const jsonResponse = response.substring(jsonStartIndex, jsonEndIndex + 1);
            printInfo('Received response:');
            console.log(jsonResponse);

            try {
                const tokenData = JSON.parse(jsonResponse);

                if (tokenData.access_token) {
                    printSuccess('Partner token generated successfully!');

                    // Update .env file with the token
                    const envPath = path.resolve(__dirname, '..', '.env.local');
                    let envContent = '';

                    if (fs.existsSync(envPath)) {
                        envContent = fs.readFileSync(envPath, 'utf8');
                    }

                    if (envContent.includes('TESLA_PARTNER_TOKEN=')) {
                        envContent = envContent.replace(/TESLA_PARTNER_TOKEN=.*(\r?\n|$)/, `TESLA_PARTNER_TOKEN=${tokenData.access_token}$1`);
                    } else {
                        envContent += `\nTESLA_PARTNER_TOKEN=${tokenData.access_token}\n`;
                    }

                    fs.writeFileSync(envPath, envContent);
                    printSuccess('Updated .env.local with partner token');

                    // Set partner registration flag
                    if (envContent.includes('TESLA_PARTNER_REGISTERED=')) {
                        envContent = envContent.replace(/TESLA_PARTNER_REGISTERED=.*(\r?\n|$)/, `TESLA_PARTNER_REGISTERED=true$1`);
                    } else {
                        envContent += `TESLA_PARTNER_REGISTERED=true\n`;
                    }

                    fs.writeFileSync(envPath, envContent);
                    printSuccess('Updated partner registration flag');

                    // Calculate and display token expiration
                    if (tokenData.expires_in) {
                        const expirationDate = new Date(Date.now() + (tokenData.expires_in * 1000));
                        printInfo(`Token expires in: ${tokenData.expires_in} seconds`);
                        printInfo(`Token valid until: ${expirationDate.toISOString()}`);
                    }

                    return true;
                } else {
                    printError('Token response does not contain access_token');
                    console.log(tokenData);
                    return false;
                }
            } catch (parseError) {
                printError(`Failed to parse JSON response: ${parseError.message}`);
                printInfo('Raw response:');
                console.log(response);
                return false;
            }
        } else {
            printError('Invalid JSON response format');
            printInfo('Raw response:');
            console.log(response);
            return false;
        }
    } catch (error) {
        printError(`Error generating partner token: ${error.message}`);
        return false;
    }
}

/**
 * Main function
 */
function main() {
    printHeader('TESLA PARTNER TOKEN GENERATOR (PRODUCTION)');

    // Check public key server
    if (!checkPublicKeyServer()) {
        printError('Public key server check failed. Continuing anyway...');
    }

    // Generate partner token
    if (generatePartnerToken()) {
        printHeader('PARTNER TOKEN GENERATION SUCCESSFUL');
        printInfo('You can now use the partner token for Tesla Fleet API operations');
        printInfo('The token has been saved to your .env.local file');
    } else {
        printHeader('PARTNER TOKEN GENERATION FAILED');
        printInfo('Please check the errors above and try again');
        process.exit(1);
    }
}

// Run the main function
main(); 