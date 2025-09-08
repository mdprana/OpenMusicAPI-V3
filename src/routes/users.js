const {
  postUserHandler,
  getUserByIdHandler,
  getUsersByUsernameHandler,
} = require('../handlers/users');
const { UserPayloadSchema } = require('../validator/users');

const routes = [
  {
    method: 'POST',
    path: '/users',
    handler: postUserHandler,
    options: {
      validate: {
        payload: UserPayloadSchema,
      },
    },
  },
  {
    method: 'GET',
    path: '/users/{id}',
    handler: getUserByIdHandler,
  },
  {
    method: 'GET',
    path: '/users',
    handler: getUsersByUsernameHandler,
  },
];

module.exports = routes;
