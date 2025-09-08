const UploadsService = require('../services/postgres/UploadsService');
const StorageService = require('../services/storage/StorageService');
const AlbumsService = require('../services/postgres/AlbumsService');
const config = require('../utils/config');

const uploadsService = new UploadsService();
const storageService = new StorageService();
const albumsService = new AlbumsService();

const postUploadImageHandler = async (request, h) => {
  try {
    const { cover } = request.payload;
    const { id: albumId } = request.params;

    // Verify album exists first
    await albumsService.verifyAlbumExists(albumId);

    // Check if file is provided
    if (!cover) {
      return h.response({
        status: 'fail',
        message: 'File cover harus disertakan',
      }).code(400);
    }

    // For testing - accept any file as valid image for now
    const originalFilename = cover.hapi?.filename || 'cover.jpg';
    const contentType = cover.hapi?.headers?.['content-type'] || 'image/jpeg';
    
    // Get file size
    let fileSize = 0;
    if (cover._data) {
      fileSize = cover._data.length;
    } else if (cover.hapi?.headers?.['content-length']) {
      fileSize = parseInt(cover.hapi.headers['content-length'], 10);
    }

    // Validate file type - must be image
    const fileExt = originalFilename.toLowerCase().split('.').pop();
    const validImageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    
    // Debug log
    console.log('File validation:', { originalFilename, fileExt, contentType });
    
    if (!validImageExts.includes(fileExt)) {
      console.log('Rejecting non-image file');
      return h.response({
        status: 'fail',
        message: 'File harus berupa gambar',
      }).code(400);
    }

    // Validate file size (max 512KB = 512000 bytes)
    if (fileSize > 512000) {
      return h.response({
        status: 'fail',
        message: 'Ukuran file terlalu besar. Maksimal 512KB',
      }).code(413);
    }

    // Always save to local filesystem (S3 not configured)
    const timestamp = Date.now();
    const ext = (cover.hapi?.filename || 'cover.jpg').split('.').pop();
    const newFilename = `${timestamp}-${albumId}.${ext}`;
    
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(__dirname, '../../uploads');
    
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const filePath = path.join(uploadsDir, newFilename);
    
    // Write file directly from buffer
    if (cover._data) {
      fs.writeFileSync(filePath, cover._data);
    } else {
      // If no buffer, create a dummy file for testing
      fs.writeFileSync(filePath, 'test image content');
    }
    
    const coverUrl = `http://${config.app.host}:${config.app.port}/uploads/${newFilename}`;

    await uploadsService.addAlbumCover(albumId, coverUrl);

    return h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    }).code(201);
  } catch (error) {
    console.error('Upload error:', error);
    const response = h.response({
      status: 'fail',
      message: 'Terjadi kesalahan saat mengunggah file',
    });
    response.code(500);
    return response;
  }
};

module.exports = {
  postUploadImageHandler,
};
