const sharp = require('sharp');
const path = require('path');

const inputPath = path.join(__dirname, 'public', 'logo192.png');
const tempPath = path.join(__dirname, 'public', 'temp_logo.png');
const outputPath = path.join(__dirname, 'public', 'logo192.png');

sharp(inputPath)
  .resize(192, 192, {
    fit: 'contain',
    background: { r: 255, g: 255, b: 255, alpha: 0 }
  })
  .toFile(tempPath)
  .then(() => {
    // Move temp file to final destination
    require('fs').renameSync(tempPath, outputPath);
    console.log('Image resized successfully');
  })
  .then(() => console.log('Image resized successfully'))
  .catch(err => console.error('Error resizing image:', err));