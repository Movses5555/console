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
  pgm.createTable('upgrade_blocks', {
    id: {
      type: 'uuid',
      primaryKey: true,
    },
    speed: {
      type: 'int',
      notNull: true,
      default: 1,
    },
    point: {
      type: 'int',
      notNull: true,
      default: 75,
    },
    native_price: {
      type: 'numeric',
      notNull: true,
      default: 0,
    },
    ton_price: {
      type: 'numeric',
      notNull: true,
      default: 0,
    },
    level: {
      type: 'numeric',
      notNull: true,
      default: 1,
    },
    is_active: {
      type: 'boolean',
      notNull: true,
      default: true,
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
  pgm.dropTable('upgrade_blocks');
};
