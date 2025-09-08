const fs = require('fs');
const path = require('path');

console.log('Testing Upload Configuration...\n');

// Check if uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
console.log('Uploads directory:', uploadsDir);
console.log('Uploads directory exists:', fs.existsSync(uploadsDir));

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

// Check environment configuration
console.log('\nEnvironment Configuration:');
console.log('HOST:', process.env.HOST || 'localhost');
console.log('PORT:', process.env.PORT || 5000);
console.log('AWS_BUCKET_NAME:', process.env.AWS_BUCKET_NAME || 'Not set (using local storage)');

// Check if test images exist in your directory
const testImagesDir = 'D:\\Project\\Dicoding\\OpenMusicAPI-V3\\image';
console.log('\nTest Images Directory:', testImagesDir);
console.log('Test images directory exists:', fs.existsSync(testImagesDir));

if (fs.existsSync(testImagesDir)) {
  const files = fs.readdirSync(testImagesDir);
  console.log('Files in test directory:');
  files.forEach(file => {
    const filePath = path.join(testImagesDir, file);
    const stats = fs.statSync(filePath);
    console.log(`- ${file} (${stats.size} bytes)`);
  });
}

console.log('\nPostman Upload Configuration Guide:');
console.log('1. Method: POST');
console.log('2. URL: http://localhost:5000/albums/{albumId}/covers');
console.log('3. Body: form-data');
console.log('4. Key: cover (File type)');
console.log('5. Value: Select your image file');
console.log('6. Make sure Content-Type is automatically set to multipart/form-data');

console.log('\nExpected Responses:');
console.log('- 400: File harus berupa gambar (if not image)');
console.log('- 404: Album tidak ditemukan (if album doesn\'t exist)');
console.log('- 413: Ukuran file terlalu besar (if > 512KB)');
console.log('- 201: Sampul berhasil diunggah (success)');

console.log('\nDebugging Tips:');
console.log('1. First create an album: POST /albums');
console.log('2. Use the album ID in the upload URL');
console.log('3. Check file size is under 512KB');
console.log('4. Use proper image files (JPG, PNG, etc.)');
console.log('5. Don\'t set Content-Type manually in Postman');
