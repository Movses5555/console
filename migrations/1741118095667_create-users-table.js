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
  pgm.createTable('users', {
    id: { 
      type: 'uuid', 
      primaryKey: true
    },
    telegram_id: { 
      type: 'int',
      unique: true,
      notNull: true
    },
    username: {
      type: 'text'
    },
    photo_url: {
      type: 'text',
      notNull: false
    },
    is_used_daily_code: { 
      type: 'boolean',
      default: false
    },
    is_used_daily_claim: { 
      type: 'boolean',
      default: false
    },
    created_at: {
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
  pgm.dropTable('users');
};
