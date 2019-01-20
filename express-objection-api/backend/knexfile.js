// Update with your config settings.
require('dotenv').config();

module.exports = {
  client: 'pg',
  connection: process.env.DATABASE_URL || {
    database: process.env.NODE_ENV === 'test' ? 'wishlist_test' : 'wishlist',
  },
  migrations: {
    directory: './db/migrations',
    tableName: 'knex_migrations',
  },
  pool: {
    min: 2,
    max: 10,
  },
  seeds:
    process.env.NODE_ENV === 'production'
      ? null
      : {
          directory: './db/seeds',
        },
};
