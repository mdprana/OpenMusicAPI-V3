const {
  postLikeAlbumHandler,
  deleteLikeAlbumHandler,
  getLikeCountHandler,
} = require('../handlers/likes');

const routes = [
  {
    method: 'POST',
    path: '/albums/{id}/likes',
    handler: postLikeAlbumHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/albums/{id}/likes',
    handler: deleteLikeAlbumHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'GET',
    path: '/albums/{id}/likes',
    handler: getLikeCountHandler,
  },
];

module.exports = routes;
