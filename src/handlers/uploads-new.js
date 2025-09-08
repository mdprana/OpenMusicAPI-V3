const UploadsService = require('../services/postgres/UploadsService');
const StorageService = require('../services/storage/StorageService');
const AlbumsService = require('../services/postgres/AlbumsService');
const config = require('../utils/config');

const uploadsService = new UploadsService();
const storageService = new StorageService();
const albumsService = new AlbumsService();

const postUploadImageHandler = async (request, h) => {
  console.log('Upload handler called');
  console.log('Request payload:', typeof request.payload);
  console.log('Request headers:', request.headers);
  
  try {
    const { id: albumId } = request.params;
    console.log('Album ID:', albumId);

    // Verify album exists first
    await albumsService.verifyAlbumExists(albumId);
    console.log('Album exists');

    // Check if payload exists and has cover
    if (!request.payload || typeof request.payload !== 'object') {
      console.log('No payload or invalid payload type');
      const response = h.response({
        status: 'fail',
        message: 'No file uploaded',
      });
      response.code(400);
      return response;
    }

    const { cover } = request.payload;
    console.log('Cover field:', typeof cover);

    // Check if file is provided
    if (!cover) {
      console.log('No cover field in payload');
      const response = h.response({
        status: 'fail',
        message: 'File cover harus disertakan',
      });
      response.code(400);
      return response;
    }

    // Handle different types of file uploads
    let fileBuffer;
    let filename;
    let contentType;

    if (cover._data) {
      // Buffer-based upload
      fileBuffer = cover._data;
      filename = cover.hapi.filename;
      contentType = cover.hapi.headers['content-type'];
    } else if (Buffer.isBuffer(cover)) {
      // Direct buffer
      fileBuffer = cover;
      filename = 'uploaded-file';
      contentType = request.headers['content-type'];
    } else if (cover.pipe) {
      // Stream-based upload - convert to buffer
      const chunks = [];
      cover.on('data', chunk => chunks.push(chunk));
      await new Promise((resolve, reject) => {
        cover.on('end', resolve);
        cover.on('error', reject);
      });
      fileBuffer = Buffer.concat(chunks);
      filename = cover.hapi ? cover.hapi.filename : 'uploaded-file';
      contentType = cover.hapi ? cover.hapi.headers['content-type'] : 'application/octet-stream';
    } else {
      console.log('Unknown file format:', cover);
      const response = h.response({
        status: 'fail',
        message: 'Invalid file format',
      });
      response.code(400);
      return response;
    }

    console.log('File info:', { filename, contentType, size: fileBuffer.length });

    // Validate file type
    if (!contentType || !contentType.startsWith('image/')) {
      const response = h.response({
        status: 'fail',
        message: 'File harus berupa gambar',
      });
      response.code(400);
      return response;
    }

    // Validate file size (max 512KB = 512000 bytes)
    if (fileBuffer.length > 512000) {
      const response = h.response({
        status: 'fail',
        message: 'Ukuran file terlalu besar. Maksimal 512KB',
      });
      response.code(413);
      return response;
    }

    // Save file
    const timestamp = Date.now();
    const ext = filename.split('.').pop() || 'jpg';
    const newFilename = `${timestamp}-${albumId}.${ext}`;
    
    let coverUrl;
    if (config.s3.bucketName) {
      // Upload to S3 (not implemented for this simple version)
      coverUrl = `https://${config.s3.bucketName}.s3.amazonaws.com/${newFilename}`;
    } else {
      // Save to local filesystem
      const fs = require('fs');
      const path = require('path');
      const uploadsDir = path.join(__dirname, '../../uploads');
      
      // Ensure uploads directory exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      const filePath = path.join(uploadsDir, newFilename);
      fs.writeFileSync(filePath, fileBuffer);
      
      coverUrl = `http://${config.app.host}:${config.app.port}/uploads/${newFilename}`;
    }

    // Update album with cover URL
    await uploadsService.addAlbumCover(albumId, coverUrl);

    console.log('Upload successful:', coverUrl);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;

  } catch (error) {
    console.error('Upload error:', error);
    
    if (error.statusCode) {
      // Known error (like NotFoundError)
      const response = h.response({
        status: 'fail',
        message: error.message,
      });
      response.code(error.statusCode);
      return response;
    }
    
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
