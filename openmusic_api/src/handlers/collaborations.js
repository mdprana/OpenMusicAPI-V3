const CollaborationsService = require('../services/postgres/CollaborationsService');
const PlaylistsService = require('../services/postgres/PlaylistsService');
const UsersService = require('../services/postgres/UsersService');
const { CollaborationPayloadSchema } = require('../validator/collaborations');

const collaborationsService = new CollaborationsService();
const playlistsService = new PlaylistsService(collaborationsService);
const usersService = new UsersService();

const postCollaborationHandler = async (request, h) => {
  const { error } = CollaborationPayloadSchema.validate(request.payload);
  if (error) {
    const response = h.response({
      status: 'fail',
      message: error.details[0].message,
    });
    response.code(400);
    return response;
  }

  const { id: credentialId } = request.auth.credentials;
  const { playlistId, userId } = request.payload;

  await playlistsService.verifyPlaylistOwner(playlistId, credentialId);
  await usersService.getUserById(userId);
  const collaborationId = await collaborationsService.addCollaboration(playlistId, userId);

  const response = h.response({
    status: 'success',
    data: {
      collaborationId,
    },
  });
  response.code(201);
  return response;
};

const deleteCollaborationHandler = async (request, h) => {
  const { error } = CollaborationPayloadSchema.validate(request.payload);
  if (error) {
    const response = h.response({
      status: 'fail',
      message: error.details[0].message,
    });
    response.code(400);
    return response;
  }

  const { id: credentialId } = request.auth.credentials;
  const { playlistId, userId } = request.payload;

  await playlistsService.verifyPlaylistOwner(playlistId, credentialId);
  await collaborationsService.deleteCollaboration(playlistId, userId);

  return {
    status: 'success',
    message: 'Kolaborasi berhasil dihapus',
  };
};

module.exports = {
  postCollaborationHandler,
  deleteCollaborationHandler,
};
