const {
  postExportPlaylistHandler,
} = require('../handlers/exports');

const routes = [
  {
    method: 'POST',
    path: '/export/playlists/{id}',
    handler: postExportPlaylistHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
];

module.exports = routes;
