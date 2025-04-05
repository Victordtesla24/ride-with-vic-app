import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create the icons directory if it doesn't exist
const iconsDir = path.join(__dirname);
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Simple 1x1 blue pixel PNG (base64 encoded)
const pixelData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEhgJAi5qj4AAAAABJRU5ErkJggg==';

// Write the files if they don't exist
const icon192Path = path.join(iconsDir, 'icon-192.png');
const icon512Path = path.join(iconsDir, 'icon-512.png');

if (!fs.existsSync(icon192Path)) {
  fs.writeFileSync(icon192Path, Buffer.from(pixelData, 'base64'));
  console.log('Created icon-192.png');
}

if (!fs.existsSync(icon512Path)) {
  fs.writeFileSync(icon512Path, Buffer.from(pixelData, 'base64'));
  console.log('Created icon-512.png');
}

console.log('Icon generation complete'); 