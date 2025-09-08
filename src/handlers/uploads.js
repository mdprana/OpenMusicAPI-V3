const UploadsService = require('../services/postgres/UploadsService');
const StorageService = require('../services/storage/StorageService');
const AlbumsService = require('../services/postgres/AlbumsService');
const config = require('../utils/config');

const uploadsService = new UploadsService();
const storageService = new StorageService();
const albumsService = new AlbumsService();

const postUploadImageHandler = async (request, h) => {
  const { cover } = request.payload;
  const { id: albumId } = request.params;

  // Validate file type
  const { hapi } = cover;
  if (!hapi.headers['content-type'].startsWith('image/')) {
    const response = h.response({
      status: 'fail',
      message: 'File harus berupa gambar',
    });
    response.code(400);
    return response;
  }

  // Validate file size (max 512KB = 512000 bytes)
  if (hapi.headers['content-length'] > 512000) {
    const response = h.response({
      status: 'fail',
      message: 'Ukuran file terlalu besar. Maksimal 512KB',
    });
    response.code(413);
    return response;
  }

  // Verify album exists
  await albumsService.verifyAlbumExists(albumId);

  let coverUrl;
  if (config.s3.bucketName) {
    // Upload to S3
    coverUrl = await storageService.uploadToS3(cover, hapi);
  } else {
    // Save to local filesystem
    const filename = await storageService.writeFile(cover, hapi);
    coverUrl = storageService.generateFileUrl(filename);
  }

  await uploadsService.addAlbumCover(albumId, coverUrl);

  const response = h.response({
    status: 'success',
    message: 'Sampul berhasil diunggah',
  });
  response.code(201);
  return response;
};

module.exports = {
  postUploadImageHandler,
};
