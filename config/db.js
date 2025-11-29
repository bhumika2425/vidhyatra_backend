// // config/db.js
// const { Sequelize } = require('sequelize');
// require('dotenv').config();

// const sequelizeVidhyatra = new Sequelize(
//     process.env.VIDHYATRA_DB_NAME,
//     process.env.VIDHYATRA_DB_USER,
//     process.env.VIDHYATRA_DB_PASSWORD,
//     {
//         host: process.env.DB_HOST,
//         dialect: 'mysql',
//     }
// );

// const sequelizeIcpStudents = new Sequelize(
//     process.env.ICP_STUDENTS_DB_NAME,
//     process.env.ICP_STUDENTS_DB_USER,
//     process.env.ICP_STUDENTS_DB_PASSWORD,
//     {
//         host: process.env.DB_HOST,
//         dialect: 'mysql',
//     }
// );

// module.exports = { sequelizeVidhyatra, sequelizeIcpStudents };

// config/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

// First, create a connection without specifying the database
const sequelizeInitial = new Sequelize('', process.env.VIDHYATRA_DB_USER, process.env.VIDHYATRA_DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
});

// Function to create database if it doesn't exist
const createDatabaseIfNotExists = async () => {
    try {
        await sequelizeInitial.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.VIDHYATRA_DB_NAME}\`;`);
        console.log(`Database '${process.env.VIDHYATRA_DB_NAME}' created or already exists.`);
        await sequelizeInitial.close();
    } catch (error) {
        console.error('Error creating database:', error);
        throw error;
    }
};

// Create the main Sequelize instance
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

module.exports = { sequelizeVidhyatra, sequelizeIcpStudents, createDatabaseIfNotExists };