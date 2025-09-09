exports.up = (pgm) => {
  pgm.createTable('user_album_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    album_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'albums(id)',
      onDelete: 'CASCADE',
    },
  });

  // Ensure unique combination of user_id and album_id
  pgm.addConstraint('user_album_likes', 'unique_user_album_like', 'UNIQUE(user_id, album_id)');
};

exports.down = (pgm) => {
  pgm.dropTable('user_album_likes');
};