const UsersService = require('../services/postgres/UsersService');

const usersService = new UsersService();

const postUserHandler = async (request, h) => {
  const { username, password, fullname } = request.payload;
  const userId = await usersService.addUser({ username, password, fullname });

  const response = h.response({
    status: 'success',
    data: {
      userId,
    },
  });
  response.code(201);
  return response;
};

const getUserByIdHandler = async (request) => {
  const { id } = request.params;
  const user = await usersService.getUserById(id);

  return {
    status: 'success',
    data: {
      user,
    },
  };
};

const getUsersByUsernameHandler = async (request) => {
  const { username = '' } = request.query;
  const users = await usersService.getUsersByUsername(username);

  return {
    status: 'success',
    data: {
      users,
    },
  };
};

module.exports = {
  postUserHandler,
  getUserByIdHandler,
  getUsersByUsernameHandler,
};
