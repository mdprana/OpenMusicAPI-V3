const PlaylistsService = require('../services/postgres/PlaylistsService');
const SongsService = require('../services/postgres/SongsService');
const CollaborationsService = require('../services/postgres/CollaborationsService');
const PlaylistSongActivitiesService = require('../services/postgres/PlaylistSongActivitiesService');
// Remove unused imports - validation is handled in routes
// const { PostPlaylistPayloadSchema, PostPlaylistSongPayloadSchema } = require('../validator/playlists');

// Initialize services
const collaborationsService = new CollaborationsService();
const playlistsService = new PlaylistsService(collaborationsService);
const songsService = new SongsService();
const activitiesService = new PlaylistSongActivitiesService();

// CREATE PLAYLIST
const postPlaylistHandler = async (request, h) => {
  const { name } = request.payload;
  const { id: credentialId } = request.auth.credentials;

  const playlistId = await playlistsService.addPlaylist({
    name,
    owner: credentialId,
  });

  const response = h.response({
    status: 'success',
    data: {
      playlistId,
    },
  });
  response.code(201);
  return response;
};

// GET ALL PLAYLISTS
const getPlaylistsHandler = async (request) => {
  const { id: credentialId } = request.auth.credentials;
  const playlists = await playlistsService.getPlaylists(credentialId);

  return {
    status: 'success',
    data: {
      playlists,
    },
  };
};

// DELETE PLAYLIST
const deletePlaylistByIdHandler = async (request) => {
  const { id } = request.params;
  const { id: credentialId } = request.auth.credentials;

  await playlistsService.verifyPlaylistOwner(id, credentialId);
  await playlistsService.deletePlaylistById(id);

  return {
    status: 'success',
    message: 'Playlist berhasil dihapus',
  };
};

// ADD SONG TO PLAYLIST
const postSongToPlaylistHandler = async (request, h) => {
  const { songId } = request.payload;
  const { id: playlistId } = request.params;
  const { id: credentialId } = request.auth.credentials;

  await playlistsService.verifyPlaylistAccess(playlistId, credentialId);
  await songsService.getSongById(songId); // Verify song exists
  await playlistsService.addSongToPlaylist(playlistId, songId);

  // Add activity log (optional feature)
  try {
    await activitiesService.addActivity(playlistId, songId, credentialId, 'add');
  } catch (error) {
    // Activities are optional, so we continue even if this fails
    console.log('Failed to log activity:', error.message);
  }

  const response = h.response({
    status: 'success',
    message: 'Lagu berhasil ditambahkan ke playlist',
  });
  response.code(201);
  return response;
};

// GET SONGS FROM PLAYLIST
const getSongsFromPlaylistHandler = async (request) => {
  const { id: playlistId } = request.params;
  const { id: credentialId } = request.auth.credentials;

  await playlistsService.verifyPlaylistAccess(playlistId, credentialId);
  const playlist = await playlistsService.getPlaylistById(playlistId);
  const songs = await playlistsService.getSongsFromPlaylist(playlistId);

  return {
    status: 'success',
    data: {
      playlist: {
        ...playlist,
        songs,
      },
    },
  };
};

// DELETE SONG FROM PLAYLIST
const deleteSongFromPlaylistHandler = async (request) => {
  const { songId } = request.payload;
  const { id: playlistId } = request.params;
  const { id: credentialId } = request.auth.credentials;

  await playlistsService.verifyPlaylistAccess(playlistId, credentialId);
  await playlistsService.deleteSongFromPlaylist(playlistId, songId);

  // Add activity log (optional feature)
  try {
    await activitiesService.addActivity(playlistId, songId, credentialId, 'delete');
  } catch (error) {
    // Activities are optional, so we continue even if this fails
    console.log('Failed to log activity:', error.message);
  }

  return {
    status: 'success',
    message: 'Lagu berhasil dihapus dari playlist',
  };
};

// GET PLAYLIST ACTIVITIES (Optional Feature)
const getPlaylistActivitiesHandler = async (request) => {
  const { id: playlistId } = request.params;
  const { id: credentialId } = request.auth.credentials;

  await playlistsService.verifyPlaylistAccess(playlistId, credentialId);
  const activities = await activitiesService.getActivities(playlistId);

  return {
    status: 'success',
    data: {
      playlistId,
      activities,
    },
  };
};

module.exports = {
  postPlaylistHandler,
  getPlaylistsHandler,
  deletePlaylistByIdHandler,
  postSongToPlaylistHandler,
  getSongsFromPlaylistHandler,
  deleteSongFromPlaylistHandler,
  getPlaylistActivitiesHandler,
};
