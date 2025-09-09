const {
  postSongHandler,
  getSongsHandler,
  getSongByIdHandler,
  putSongByIdHandler,
  deleteSongByIdHandler,
} = require('../handlers/songs');
const { SongPayloadSchema, SongQuerySchema } = require('../validator/songs');

const routes = [
  {
    method: 'POST',
    path: '/songs',
    handler: postSongHandler,
    options: {
      validate: {
        payload: SongPayloadSchema,
      },
    },
  },
  {
    method: 'GET',
    path: '/songs',
    handler: getSongsHandler,
    options: {
      validate: {
        query: SongQuerySchema,
      },
    },
  },
  {
    method: 'GET',
    path: '/songs/{id}',
    handler: getSongByIdHandler,
  },
  {
    method: 'PUT',
    path: '/songs/{id}',
    handler: putSongByIdHandler,
    options: {
      validate: {
        payload: SongPayloadSchema,
      },
    },
  },
  {
    method: 'DELETE',
    path: '/songs/{id}',
    handler: deleteSongByIdHandler,
  },
];

module.exports = routes;
