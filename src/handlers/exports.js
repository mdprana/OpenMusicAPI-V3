const ProducerService = require('../services/rabbitmq/ProducerService');
const PlaylistsService = require('../services/postgres/PlaylistsService');
const CollaborationsService = require('../services/postgres/CollaborationsService');
const { PostExportPayloadSchema } = require('../validator/exports');

const collaborationsService = new CollaborationsService();
const playlistsService = new PlaylistsService(collaborationsService);

const postExportPlaylistHandler = async (request, h) => {
  const { error } = PostExportPayloadSchema.validate(request.payload);
  if (error) {
    const response = h.response({
      status: 'fail',
      message: error.details[0].message,
    });
    response.code(400);
    return response;
  }

  const { id: credentialId } = request.auth.credentials;
  const { id: playlistId } = request.params;
  const { targetEmail } = request.payload;

  // Verify playlist access (owner only)
  await playlistsService.verifyPlaylistOwner(playlistId, credentialId);

  const message = {
    playlistId,
    targetEmail,
  };

  await ProducerService.sendMessage('export:playlist', JSON.stringify(message));

  const response = h.response({
    status: 'success',
    message: 'Permintaan Anda sedang kami proses',
  });
  response.code(201);
  return response;
};

module.exports = {
  postExportPlaylistHandler,
};
