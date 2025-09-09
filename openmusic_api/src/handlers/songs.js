const SongsService = require('../services/postgres/SongsService');

const songsService = new SongsService();

const postSongHandler = async (request, h) => {
  const {
    title, year, genre, performer, duration, albumId,
  } = request.payload;
  const songId = await songsService.addSong({
    title,
    year,
    genre,
    performer,
    duration,
    albumId,
  });

  const response = h.response({
    status: 'success',
    data: {
      songId,
    },
  });
  response.code(201);
  return response;
};

const getSongsHandler = async (request) => {
  const { title, performer } = request.query;
  const songs = await songsService.getSongs(title, performer);

  return {
    status: 'success',
    data: {
      songs,
    },
  };
};

const getSongByIdHandler = async (request) => {
  const { id } = request.params;
  const song = await songsService.getSongById(id);

  // Transform albumId to match expected response format
  const transformedSong = {
    id: song.id,
    title: song.title,
    year: song.year,
    performer: song.performer,
    genre: song.genre,
    duration: song.duration,
    albumId: song.album_id,
  };

  return {
    status: 'success',
    data: {
      song: transformedSong,
    },
  };
};

const putSongByIdHandler = async (request) => {
  const { id } = request.params;
  const {
    title, year, genre, performer, duration, albumId,
  } = request.payload;

  await songsService.editSongById(id, {
    title,
    year,
    genre,
    performer,
    duration,
    albumId,
  });

  return {
    status: 'success',
    message: 'Lagu berhasil diperbarui',
  };
};

const deleteSongByIdHandler = async (request) => {
  const { id } = request.params;
  await songsService.deleteSongById(id);

  return {
    status: 'success',
    message: 'Lagu berhasil dihapus',
  };
};

module.exports = {
  postSongHandler,
  getSongsHandler,
  getSongByIdHandler,
  putSongByIdHandler,
  deleteSongByIdHandler,
};
