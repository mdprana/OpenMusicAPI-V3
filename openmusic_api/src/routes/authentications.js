const {
  postAuthenticationHandler,
  putAuthenticationHandler,
  deleteAuthenticationHandler,
} = require('../handlers/authentications');
const {
  PostAuthenticationPayloadSchema,
  PutAuthenticationPayloadSchema,
  DeleteAuthenticationPayloadSchema,
} = require('../validator/authentications');

const routes = [
  {
    method: 'POST',
    path: '/authentications',
    handler: postAuthenticationHandler,
    options: {
      validate: {
        payload: PostAuthenticationPayloadSchema,
      },
    },
  },
  {
    method: 'PUT',
    path: '/authentications',
    handler: putAuthenticationHandler,
    options: {
      validate: {
        payload: PutAuthenticationPayloadSchema,
      },
    },
  },
  {
    method: 'DELETE',
    path: '/authentications',
    handler: deleteAuthenticationHandler,
    options: {
      validate: {
        payload: DeleteAuthenticationPayloadSchema,
      },
    },
  },
];

module.exports = routes;
