const fs = require('fs');
const path = require('path');

console.log('Upload Handler Debug Test\n');

// Check if the uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
console.log('Uploads directory path:', uploadsDir);
console.log('Uploads directory exists:', fs.existsSync(uploadsDir));

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

// Test file permissions
try {
  const testFile = path.join(uploadsDir, 'test.txt');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  console.log('Upload directory is writable');
} catch (error) {
  console.error('Upload directory permission issue:', error.message);
}

// Check test files
const imageDir = path.join(__dirname, '..', 'image');
console.log('\nTest files directory:', imageDir);
console.log('Test files directory exists:', fs.existsSync(imageDir));

if (fs.existsSync(imageDir)) {
  const files = fs.readdirSync(imageDir);
  console.log('Available test files:');
  files.forEach(file => {
    const filePath = path.join(imageDir, file);
    const stats = fs.statSync(filePath);
    const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file);
    console.log(`- ${file}: ${stats.size} bytes (${isImage ? 'IMAGE' : 'NOT IMAGE'})`);
  });
}

console.log('\nCurrent working directory:', process.cwd());
console.log('Node version:', process.version);

// Test if config is loaded properly
try {
  const config = require('../src/utils/config');
  console.log('\nConfig test:');
  console.log('App host:', config.app.host);
  console.log('App port:', config.app.port);
  console.log('S3 bucket:', config.s3.bucketName || 'Not configured (using local storage)');
} catch (error) {
  console.error('Config loading error:', error.message);
}
