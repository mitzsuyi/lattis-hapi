const Config = require('./config')
const migrationsDirectory= './db/migrations'

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: 'db/dev.sqlite3'
    },
    migrations:{
      directory: migrationsDirectory
    },
    useNullAsDefault: true
  },
  test: {
    client: 'sqlite3',
    connection: {
      filename: ':memory:'
    },
    migrations:{
      directory: migrationsDirectory
    },
    useNullAsDefault: true
  },
  production: {
    client: 'mysql2',
    connection: Config.MYSQL_DB_URL, 
    migrations: {
      directory: migrationsDirectory,
      tableName: 'knex_migrations'
    },
    useNullAsDefault: true
  }
};
