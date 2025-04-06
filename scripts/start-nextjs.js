#!/usr/bin/env node

/**
 * Script to start Next.js directly using next dev
 * 
 * This script starts Next.js in development mode, which properly handles API routes
 */

import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default port
const PORT = process.env.PORT || 3000;

console.log(`Starting Next.js server on port ${PORT}...`);

// Path to next command
const nextBin = path.join(__dirname, '../node_modules/.bin/next');

// Start Next.js dev server
const nextProcess = exec(`${nextBin} dev -p ${PORT}`);

// Log output
nextProcess.stdout.on('data', (data) => {
  console.log(data.toString().trim());
});

nextProcess.stderr.on('data', (data) => {
  console.error(data.toString().trim());
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down Next.js server...');
  nextProcess.kill();
  process.exit(0);
});

console.log(`Next.js server started. Press Ctrl+C to stop.`); 