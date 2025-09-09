const path = require('path');
const {
  postUploadImageHandler,
} = require('../handlers/uploads');

const routes = [
  {
    method: 'POST',
    path: '/albums/{id}/covers',
    handler: postUploadImageHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
        maxBytes: 512000,
      },
    },
  },
  // Static file serving for local uploads
  {
    method: 'GET',
    path: '/uploads/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, '../../uploads'),
      },
    },
  },
];

module.exports = routes;
