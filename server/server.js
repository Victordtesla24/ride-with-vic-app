import http from 'http';
import fs from 'fs';
import path from 'path';
import net from 'net';

// Default port with fallbacks
const DEFAULT_PORT = 3000;
const PORT = parseInt(process.env.PORT || DEFAULT_PORT, 10);

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

// Start the server asynchronously
async function startServer() {
    try {
        // Find an available port starting from the requested port
        const availablePort = await findAvailablePort(PORT);
        
        // Start the server on the available port
        server.listen(availablePort, () => {
            console.log(`Server running at http://localhost:${availablePort}/`);
            console.log('Press Ctrl+C to stop the server');
        });
        
        // Handle server errors after startup
        server.on('error', (error) => {
            console.error('Server error:', error);
            process.exit(1);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer(); 