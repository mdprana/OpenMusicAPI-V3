const UserAlbumLikesService = require('../services/postgres/UserAlbumLikesService');
const CacheService = require('../services/redis/CacheService');

const cacheService = new CacheService();
const userAlbumLikesService = new UserAlbumLikesService(cacheService);

const postLikeAlbumHandler = async (request, h) => {
  const { id: credentialId } = request.auth.credentials;
  const { id: albumId } = request.params;

  await userAlbumLikesService.addLike(credentialId, albumId);

  const response = h.response({
    status: 'success',
    message: 'Album berhasil disukai',
  });
  response.code(201);
  return response;
};

const deleteLikeAlbumHandler = async (request, h) => {
  const { id: credentialId } = request.auth.credentials;
  const { id: albumId } = request.params;

  await userAlbumLikesService.deleteLike(credentialId, albumId);

  return {
    status: 'success',
    message: 'Album batal disukai',
  };
};

const getLikeCountHandler = async (request, h) => {
  const { id: albumId } = request.params;

  await userAlbumLikesService.verifyAlbumExists(albumId);
  const result = await userAlbumLikesService.getLikeCount(albumId);

  const response = h.response({
    status: 'success',
    data: {
      likes: result.likes,
    },
  });

  // Add X-Data-Source header
  if (result.source === 'cache') {
    response.header('X-Data-Source', 'cache');
  }

  return response;
};

module.exports = {
  postLikeAlbumHandler,
  deleteLikeAlbumHandler,
  getLikeCountHandler,
};
