const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const config = require('../../utils/config');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class UserAlbumLikesService {
  constructor(cacheService) {
    this._pool = new Pool(config.database);
    this._cacheService = cacheService;
  }

  async addLike(userId, albumId) {
    // Check if user already liked this album
    const checkQuery = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const checkResult = await this._pool.query(checkQuery);

    if (checkResult.rows.length > 0) {
      throw new InvariantError('Album sudah disukai');
    }

    // Check if album exists
    const albumQuery = {
      text: 'SELECT id FROM albums WHERE id = $1',
      values: [albumId],
    };

    const albumResult = await this._pool.query(albumQuery);

    if (!albumResult.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const id = `like-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Like gagal ditambahkan');
    }

    // Clear cache
    await this._cacheService.delete(`likes:${albumId}`);

    return result.rows[0].id;
  }

  async deleteLike(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Like gagal dihapus');
    }

    // Clear cache
    await this._cacheService.delete(`likes:${albumId}`);
  }

  async getLikeCount(albumId) {
    try {
      // Try to get from cache first
      const result = await this._cacheService.get(`likes:${albumId}`);
      return {
        likes: parseInt(result, 10),
        source: 'cache',
      };
    } catch (error) {
      // If cache miss, get from database
      const query = {
        text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);
      const likesCount = parseInt(result.rows[0].count, 10);

      // Cache the result for 30 minutes (1800 seconds)
      await this._cacheService.set(`likes:${albumId}`, likesCount.toString(), 1800);

      return {
        likes: likesCount,
        source: 'database',
      };
    }
  }

  async verifyAlbumExists(albumId) {
    const query = {
      text: 'SELECT id FROM albums WHERE id = $1',
      values: [albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }
}

module.exports = UserAlbumLikesService;
