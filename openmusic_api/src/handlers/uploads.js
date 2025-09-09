const path = require('path');
const fs = require('fs');
const UploadsService = require('../services/postgres/UploadsService');
const AlbumsService = require('../services/postgres/AlbumsService');
const config = require('../utils/config');

const uploadsService = new UploadsService();
const albumsService = new AlbumsService();

const postUploadImageHandler = async (request, h) => {
  try {
    const { cover } = request.payload;
    const { id: albumId } = request.params;

    // Check if file exists
    if (!cover) {
      return h.response({
        status: 'fail',
        message: 'File cover harus disertakan',
      }).code(400);
    }

    // Validate file type from headers
    const contentType = cover.hapi.headers['content-type'];
    const validImageTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png', 
      'image/gif',
      'image/bmp',
      'image/webp',
      'image/svg+xml',
      'image/apng',
      'image/avif',
    ];

    if (!validImageTypes.includes(contentType)) {
      return h.response({
        status: 'fail',
        message: 'File harus berupa gambar',
      }).code(400);
    }

    // Verify album exists
    await albumsService.getAlbumById(albumId);

    // Generate filename
    const timestamp = Date.now();
    const originalFilename = cover.hapi.filename || 'cover.jpg';
    const ext = originalFilename.split('.').pop() || 'jpg';
    const newFilename = `${timestamp}.${ext}`;

    // Setup upload directory
    const uploadsDir = path.resolve(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, newFilename);

    // Write file to disk
    const writeStream = fs.createWriteStream(filePath);
    
    return new Promise((resolve) => {
      writeStream.on('error', (error) => {
        console.error('File write error:', error);
        resolve(h.response({
          status: 'error',
          message: 'Terjadi kesalahan saat menyimpan file',
        }).code(500));
      });

      writeStream.on('finish', async () => {
        try {
          // Generate cover URL
          const coverUrl = `http://${config.app.host}:${config.app.port}/uploads/${newFilename}`;

          // Update album with cover URL
          await uploadsService.addAlbumCover(albumId, coverUrl);

          resolve(h.response({
            status: 'success',
            message: 'Sampul berhasil diunggah',
          }).code(201));
        } catch (error) {
          console.error('Database update error:', error);
          resolve(h.response({
            status: 'error', 
            message: 'Terjadi kesalahan saat menyimpan data',
          }).code(500));
        }
      });

      cover.pipe(writeStream);
      cover.on('end', () => {
        writeStream.end();
      });
    });

  } catch (error) {
    console.error('Upload handler error:', error);

    if (error.statusCode) {
      return h.response({
        status: 'fail',
        message: error.message,
      }).code(error.statusCode);
    }

    return h.response({
      status: 'error',
      message: 'Maaf, terjadi kegagalan pada server kami.',
    }).code(500);
  }
};

module.exports = {
  postUploadImageHandler,
};
