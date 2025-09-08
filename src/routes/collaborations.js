const {
  postCollaborationHandler,
  deleteCollaborationHandler,
} = require('../handlers/collaborations');

const routes = [
  {
    method: 'POST',
    path: '/collaborations',
    handler: postCollaborationHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/collaborations',
    handler: deleteCollaborationHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
];

module.exports = routes;
