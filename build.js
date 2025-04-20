const fs = require('fs');
const path = require('path');

// Ensure the dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy PWA files to dist directory
const pwaFiles = [
  'icon-192x192.png',
  'icon-512x512.png',
  'screenshot-desktop.png',
  'screenshot-mobile.png',
  'favicon.ico',
  'site.webmanifest'
];

pwaFiles.forEach(file => {
  const sourcePath = path.join(__dirname, 'public', file);
  const destPath = path.join(distDir, file);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied ${file} to dist directory`);
  } else {
    console.warn(`Warning: ${file} not found in public directory`);
  }
}); 