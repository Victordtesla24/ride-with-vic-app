/**
 * CommonJS version of the server for Vercel deployment
 * Ensures consistent application across dev, docker, and Vercel environments
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const net = require('net');
const { exec } = require('child_process');

// Default port with fallbacks
const DEFAULT_PORT = process.env.PORT || 3000;
const PORT = parseInt(DEFAULT_PORT, 10);

// Detect environment
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Function to check if Next.js is installed
function isNextJsInstalled() {
    try {
        return require.resolve('next');
    } catch (e) {
        return false;
    }
}

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

// Function to find an available port
async function findAvailablePort(startPort) {
    let port = startPort;
    while (await isPortInUse(port)) {
        console.log(`Port ${port} is in use, trying next port...`);
        port++;
    }
    return port;
}

// Use Next.js server if available, otherwise use custom server
async function startServer() {
    // Check if Next.js is installed
    const nextJsInstalled = isNextJsInstalled();
    
    // Find an available port
    const availablePort = await findAvailablePort(PORT);
    
    if (nextJsInstalled) {
        // Start Next.js server
        console.log(`Starting Next.js server in ${NODE_ENV} mode...`);
        
        // Run the Next.js server
        if (IS_PRODUCTION) {
            // In production, we should already have the build files
            // Start Next.js with production config
            const { default: next } = require('next');
            const app = next({ dev: false });
            const handle = app.getRequestHandler();
            
            await app.prepare();
            
            const server = http.createServer((req, res) => {
                handle(req, res);
            });
            
            server.listen(availablePort, () => {
                console.log(`Next.js server running at http://localhost:${availablePort}/`);
                console.log('Press Ctrl+C to stop the server');
            });
        } else {
            // In development, start Next.js dev server
            const nextDev = path.join(process.cwd(), 'node_modules/.bin/next');
            const nextDevProcess = exec(`${nextDev} dev -p ${availablePort}`);
            
            nextDevProcess.stdout.on('data', (data) => {
                console.log(data.toString());
            });
            
            nextDevProcess.stderr.on('data', (data) => {
                console.error(data.toString());
            });
            
            // Handle server exit
            process.on('SIGINT', () => {
                nextDevProcess.kill();
                process.exit(0);
            });
        }
    } else {
        // Fall back to custom server
        console.log(`Starting custom server on port ${availablePort}...`);
        
        const server = http.createServer((req, res) => {
            // Handle the request
            let filePath = '.' + req.url;
            
            // Map URLs to the new directory structure
            if (filePath === './') {
                filePath = './pages/index.html';
            } else if (filePath === './sw.js') {
                // Special case for service worker
                filePath = './public/sw.js';
            } else if (filePath.startsWith('./styles/')) {
                // No change needed, already pointing to styles directory
            } else if (filePath.startsWith('./lib/')) {
                // No change needed, already pointing to lib directory
            } else if (filePath.match(/\.(js|css|html)$/)) {
                // Check if should be in pages
                if (filePath.endsWith('.html')) {
                    filePath = './pages' + req.url;
                } 
                // Check if should be in public
                else if (filePath.match(/\.(png|jpg|jpeg|gif|svg|ico|json)$/)) {
                    filePath = './public' + req.url;
                }
            } else if (filePath.match(/\/public\//)) {
                filePath = '.' + req.url;
            }

            const extname = String(path.extname(filePath)).toLowerCase();
            const contentType = MIME_TYPES[extname] || 'application/octet-stream';

            fs.readFile(filePath, (error, content) => {
                if (error) {
                    if (error.code === 'ENOENT') {
                        // Page not found
                        fs.readFile('./pages/index.html', (err, content) => {
                            if (err) {
                                res.writeHead(500, {'Connection': 'close'});
                                res.end('Error loading index.html');
                            } else {
                                res.writeHead(200, { 
                                    'Content-Type': 'text/html',
                                    'Connection': 'close'
                                });
                                res.end(content, 'utf-8');
                            }
                        });
                    } else {
                        // Server error
                        res.writeHead(500, {'Connection': 'close'});
                        res.end(`Server Error: ${error.code}`);
                    }
                } else {
                    // Success
                    res.writeHead(200, { 
                        'Content-Type': contentType,
                        'Connection': 'close'  // Add this to help with timeout issues
                    });
                    res.end(content, 'utf-8');
                }
            });
        });
        
        // Start the server
        server.listen(availablePort, () => {
            console.log(`Server running at http://localhost:${availablePort}/`);
            console.log('Press Ctrl+C to stop the server');
        });
        
        // Handle server errors
        server.on('error', (error) => {
            console.error('Server error:', error);
            process.exit(1);
        });
    }
}

// Start the server
startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

// For Vercel compatibility
const server = {
    // Dummy server for Vercel
};

module.exports = server; 