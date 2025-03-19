/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable('users_boost_blocks', {
    id: {
      type: 'uuid',
      primaryKey: true,
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users (id)',
    },
    boost_block_id: {
      type: 'uuid',
      notNull: true,
      references: 'boost_blocks (id)',
    },
    speed: {
      type: 'int',
      notNull: true,
    },
    duration: {
      type: 'int',
      notNull: true,
    },
    ton_price: {
      type: 'numeric',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createIndex('users_boost_blocks', ['user_id']);
  pgm.createIndex('users_boost_blocks', ['boost_block_id']);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable('users_boost_blocks');
};
