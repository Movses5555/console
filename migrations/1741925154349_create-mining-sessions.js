/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable('mining_sessions', {
    id: {
      type: 'uuid',
      primaryKey: true,
    },
    user_id: {
      type: 'uuid',
      references: 'users (id)',
      notNull: true,
      unique: true,
    },
    boost_speed: {
      type: 'int',
      notNull: true,
      default: 1,
    },
    upgrade_speed: {
      type: 'int',
      notNull: true,
      default: 1,
    },
    is_can_claim: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    last_claimed_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
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
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable('mining_sessions');
};
