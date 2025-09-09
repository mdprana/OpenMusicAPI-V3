const { Pool } = require('pg');
const config = require('../../utils/config');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsService {
  constructor(collaborationService) {
    this._pool = new Pool(config.database);
    this._collaborationService = collaborationService;
  }

  async getPlaylistById(id) {
    const query = {
      text: `SELECT p.id, p.name, u.username FROM playlists p 
             LEFT JOIN users u ON u.id = p.owner 
             WHERE p.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return result.rows[0];
  }

  async getSongsFromPlaylist(playlistId) {
    const query = {
      text: `SELECT s.id, s.title, s.performer FROM songs s 
             LEFT JOIN playlist_songs ps ON ps.song_id = s.id 
             WHERE ps.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = PlaylistsService;
