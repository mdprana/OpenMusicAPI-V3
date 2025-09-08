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
        maxBytes: 512000,
        output: 'data',
        parse: true,
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
