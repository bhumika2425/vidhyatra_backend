require('dotenv').config();

module.exports = {
  development: {
    username: process.env.VIDHYATRA_DB_USER || 'root',
    password: process.env.VIDHYATRA_DB_PASSWORD || '',
    database: process.env.VIDHYATRA_DB_NAME || 'vidhyatra',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    logging: false,
  },
  test: {
    username: process.env.VIDHYATRA_DB_USER || 'root',
    password: process.env.VIDHYATRA_DB_PASSWORD || '',
    database: process.env.VIDHYATRA_DB_NAME_TEST || 'vidhyatra_test',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    logging: false,
  },
  production: {
    username: process.env.VIDHYATRA_DB_USER,
    password: process.env.VIDHYATRA_DB_PASSWORD,
    database: process.env.VIDHYATRA_DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  }
};
