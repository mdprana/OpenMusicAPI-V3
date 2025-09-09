const ProducerService = require('../services/rabbitmq/ProducerService');
const PlaylistsService = require('../services/postgres/PlaylistsService');
const CollaborationsService = require('../services/postgres/CollaborationsService');
const { PostExportPayloadSchema } = require('../validator/exports');

const collaborationsService = new CollaborationsService();
const playlistsService = new PlaylistsService(collaborationsService);

const postExportPlaylistHandler = async (request, h) => {
  // Validate payload
  const { error } = PostExportPayloadSchema.validate(request.payload);
  if (error) {
    return h.response({
      status: 'fail',
      message: error.details[0].message,
    }).code(400);
  }

  const { id: credentialId } = request.auth.credentials;
  const { id: playlistId } = request.params;
  const { targetEmail } = request.payload;

  // Verify playlist owner (only owner can export)
  await playlistsService.verifyPlaylistOwner(playlistId, credentialId);

  const message = {
    playlistId,
    targetEmail,
  };

  await ProducerService.sendMessage('export:playlist', JSON.stringify(message));

  return h.response({
    status: 'success',
    message: 'Permintaan Anda sedang kami proses',
  }).code(201);
};

module.exports = {
  postExportPlaylistHandler,
};
