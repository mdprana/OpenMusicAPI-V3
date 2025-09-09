exports.up = (pgm) => {
  pgm.createTable('collaborations', {
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
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
  });

  // Ensure unique combination of playlist_id and user_id
  pgm.addConstraint('collaborations', 'unique_playlist_user', 'UNIQUE(playlist_id, user_id)');
};

exports.down = (pgm) => {
  pgm.dropTable('collaborations');
};