const AlbumsService = require('../services/postgres/AlbumsService');

const albumsService = new AlbumsService();

const postAlbumHandler = async (request, h) => {
  const { name, year } = request.payload;
  const albumId = await albumsService.addAlbum({ name, year });

  const response = h.response({
    status: 'success',
    data: {
      albumId,
    },
  });
  response.code(201);
  return response;
};

const getAlbumByIdHandler = async (request) => {
  const { id } = request.params;
  const album = await albumsService.getAlbumById(id);

  return {
    status: 'success',
    data: {
      album,
    },
  };
};

const putAlbumByIdHandler = async (request) => {
  const { id } = request.params;
  const { name, year } = request.payload;

  await albumsService.editAlbumById(id, { name, year });

  return {
    status: 'success',
    message: 'Album berhasil diperbarui',
  };
};

const deleteAlbumByIdHandler = async (request) => {
  const { id } = request.params;
  await albumsService.deleteAlbumById(id);

  return {
    status: 'success',
    message: 'Album berhasil dihapus',
  };
};

module.exports = {
  postAlbumHandler,
  getAlbumByIdHandler,
  putAlbumByIdHandler,
  deleteAlbumByIdHandler,
};
