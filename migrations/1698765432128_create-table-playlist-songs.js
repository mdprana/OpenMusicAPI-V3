exports.up = (pgm) => {
  pgm.createTable('playlist_songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'playlists(id)',
      onDelete: 'CASCADE',
    },
    song_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'songs(id)',
      onDelete: 'CASCADE',
    },
  });

  // Ensure unique combination of playlist_id and song_id
  pgm.addConstraint('playlist_songs', 'unique_playlist_song', 'UNIQUE(playlist_id, song_id)');
};

exports.down = (pgm) => {
  pgm.dropTable('playlist_songs');
};