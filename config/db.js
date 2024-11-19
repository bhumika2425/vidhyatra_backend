// config/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelizeVidhyatra = new Sequelize(
    process.env.VIDHYATRA_DB_NAME,
    process.env.VIDHYATRA_DB_USER,
    process.env.VIDHYATRA_DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
    }
);

const sequelizeIcpStudents = new Sequelize(
    process.env.ICP_STUDENTS_DB_NAME,
    process.env.ICP_STUDENTS_DB_USER,
    process.env.ICP_STUDENTS_DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
    }
);

module.exports = { sequelizeVidhyatra, sequelizeIcpStudents };