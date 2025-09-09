const {
  postAlbumHandler,
  getAlbumByIdHandler,
  putAlbumByIdHandler,
  deleteAlbumByIdHandler,
} = require('../handlers/albums');
const { AlbumPayloadSchema } = require('../validator/albums');

const routes = [
  {
    method: 'POST',
    path: '/albums',
    handler: postAlbumHandler,
    options: {
      validate: {
        payload: AlbumPayloadSchema,
      },
    },
  },
  {
    method: 'GET',
    path: '/albums/{id}',
    handler: getAlbumByIdHandler,
  },
  {
    method: 'PUT',
    path: '/albums/{id}',
    handler: putAlbumByIdHandler,
    options: {
      validate: {
        payload: AlbumPayloadSchema,
      },
    },
  },
  {
    method: 'DELETE',
    path: '/albums/{id}',
    handler: deleteAlbumByIdHandler,
  },
];

module.exports = routes;
