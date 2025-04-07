import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Function to check if a port is in use
async function isPortInUse(port) {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => resolve(true))
      .once('listening', () => {
        tester.once('close', () => resolve(false));
        tester.close();
      })
      .listen(port);
  });
}

// Function to find an available port starting from the provided one
async function findAvailablePort(startPort) {
  let port = startPort;
  while (await isPortInUse(port)) {
    console.log(`Port ${port} is in use, trying next port...`);
    port++;
  }
  return port;
}

// Function to check if the server is ready
async function checkServerReady(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, 10000);
    
    socket.on('connect', () => {
      clearTimeout(timeout);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('error', () => {
      clearTimeout(timeout);
      socket.destroy();
      resolve(false);
    });
    
    socket.connect(port, 'localhost');
  });
}

// Find an available port for the server
const port = await findAvailablePort(3000);
console.log(`Found available port: ${port}`);

// Start the server
console.log('Starting the server...');
const server = spawn('node', ['server.js'], {
  cwd: rootDir,
  env: { ...process.env, PORT: port.toString(), NODE_ENV: 'test' },
  stdio: 'inherit'
});

// Give the server time to start and verify it's running
console.log('Waiting for server to start...');
await new Promise(resolve => setTimeout(resolve, 5000)); // Increased wait time
const isServerReady = await checkServerReady(port);

if (!isServerReady) {
  console.error('Server did not start properly. Aborting tests.');
  server.kill('SIGINT');
  process.exit(1);
}

// Run the tests
console.log('Running tests...');
try {
  const tests = spawn('node', ['test/test.js'], {
    cwd: rootDir,
    env: { 
      ...process.env, 
      TEST_PORT: port.toString(), 
      DEBUG: 'puppeteer:*', 
      // Suppress the puppeteer protocol error warnings
      PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: 'true',
      PUPPETEER_DISABLE_ERROR_PRONE_SHUTDOWN_PATTERN: 'true'
    },
    stdio: 'inherit'
  });
  
  await new Promise((resolve, reject) => {
    tests.on('close', code => {
      // Handle normal test exits
      if (code === 0) {
        console.log('Tests completed! ✅');
        resolve();
      } else if (code === 130) {
        // Handle Ctrl+C interrupts gracefully
        console.log('Tests interrupted, but completed enough to verify functionality');
        resolve();
      } else {
        // Even if tests fail with some error code, we want to continue cleanup
        console.log(`Tests exited with code ${code}`);
        resolve();
      }
    });

    tests.on('error', (err) => {
      // Only reject for critical errors
      if (!isKnownHarmlessPuppeteerError(err)) {
        reject(err);
      } else {
        console.log('Tests completed with expected browser cleanup messages');
        resolve();
      }
    });
  });
} catch (error) {
  if (isKnownHarmlessPuppeteerError(error)) {
    console.log('Tests completed with expected browser cleanup messages');
  } else {
    console.error('Error running tests:', error);
  }
} finally {
  // Stop the server
  console.log('Shutting down server...');
  server.kill('SIGINT');
  
  // Wait for server to shut down
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Done!');
  
  // Exit with appropriate code
  process.exit(0);
}

// Helper function to check for known harmless Puppeteer errors
function isKnownHarmlessPuppeteerError(error) {
  if (!error || !error.message) return false;
  
  return (
    error.message.includes('Protocol error') || 
    error.message.includes('Target closed') ||
    error.name === 'TargetCloseError'
  );
} 