const {
  postPlaylistHandler,
  getPlaylistsHandler,
  deletePlaylistByIdHandler,
  postSongToPlaylistHandler,
  getSongsFromPlaylistHandler,
  deleteSongFromPlaylistHandler,
  getPlaylistActivitiesHandler,
} = require('../handlers/playlists');
const {
  PostPlaylistPayloadSchema,
  PostPlaylistSongPayloadSchema,
} = require('../validator/playlists');

const routes = [
  {
    method: 'POST',
    path: '/playlists',
    handler: postPlaylistHandler,
    options: {
      auth: 'openmusic_jwt',
      validate: {
        payload: PostPlaylistPayloadSchema,
      },
    },
  },
  {
    method: 'GET',
    path: '/playlists',
    handler: getPlaylistsHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}',
    handler: deletePlaylistByIdHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'POST',
    path: '/playlists/{id}/songs',
    handler: postSongToPlaylistHandler,
    options: {
      auth: 'openmusic_jwt',
      validate: {
        payload: PostPlaylistSongPayloadSchema,
      },
    },
  },
  {
    method: 'GET',
    path: '/playlists/{id}/songs',
    handler: getSongsFromPlaylistHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}/songs',
    handler: deleteSongFromPlaylistHandler,
    options: {
      auth: 'openmusic_jwt',
      validate: {
        payload: PostPlaylistSongPayloadSchema,
      },
    },
  },
  {
    method: 'GET',
    path: '/playlists/{id}/activities',
    handler: getPlaylistActivitiesHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
];

module.exports = routes;
