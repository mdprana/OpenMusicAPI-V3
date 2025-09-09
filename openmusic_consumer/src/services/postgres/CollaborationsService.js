const { Pool } = require('pg');
const config = require('../../utils/config');

class CollaborationsService {
  constructor() {
    this._pool = new Pool(config.database);
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new Error('Kolaborasi gagal diverifikasi');
    }
  }
}

module.exports = CollaborationsService;
