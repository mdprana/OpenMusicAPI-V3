const AuthenticationsService = require('../services/postgres/AuthenticationsService');
const UsersService = require('../services/postgres/UsersService');
const TokenManager = require('../tokenize/TokenManager');
const {
  PostAuthenticationPayloadSchema,
  PutAuthenticationPayloadSchema,
  DeleteAuthenticationPayloadSchema,
} = require('../validator/authentications');

const authenticationsService = new AuthenticationsService();
const usersService = new UsersService();

const postAuthenticationHandler = async (request, h) => {
  const { error } = PostAuthenticationPayloadSchema.validate(request.payload);
  if (error) {
    const response = h.response({
      status: 'fail',
      message: error.details[0].message,
    });
    response.code(400);
    return response;
  }

  const { username, password } = request.payload;
  const id = await usersService.verifyUserCredential(username, password);

  const accessToken = TokenManager.generateAccessToken({ id });
  const refreshToken = TokenManager.generateRefreshToken({ id });

  await authenticationsService.addRefreshToken(refreshToken);

  const response = h.response({
    status: 'success',
    data: {
      accessToken,
      refreshToken,
    },
  });
  response.code(201);
  return response;
};

const putAuthenticationHandler = async (request, h) => {
  const { error } = PutAuthenticationPayloadSchema.validate(request.payload);
  if (error) {
    const response = h.response({
      status: 'fail',
      message: error.details[0].message,
    });
    response.code(400);
    return response;
  }

  const { refreshToken } = request.payload;

  await authenticationsService.verifyRefreshToken(refreshToken);
  const { id } = TokenManager.verifyRefreshToken(refreshToken);

  const accessToken = TokenManager.generateAccessToken({ id });

  return {
    status: 'success',
    data: {
      accessToken,
    },
  };
};

const deleteAuthenticationHandler = async (request, h) => {
  const { error } = DeleteAuthenticationPayloadSchema.validate(request.payload);
  if (error) {
    const response = h.response({
      status: 'fail',
      message: error.details[0].message,
    });
    response.code(400);
    return response;
  }

  const { refreshToken } = request.payload;
  await authenticationsService.verifyRefreshToken(refreshToken);
  await authenticationsService.deleteRefreshToken(refreshToken);

  return {
    status: 'success',
    message: 'Refresh token berhasil dihapus',
  };
};

module.exports = {
  postAuthenticationHandler,
  putAuthenticationHandler,
  deleteAuthenticationHandler,
};
