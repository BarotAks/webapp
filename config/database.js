// config/database.js

const Sequelize = require('sequelize');
const logger = require('../logging');

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
  // host: process.env.DB_HOST || 'localhost',
  // username: process.env.DB_USER || 'root',
  // password: process.env.DB_PASSWORD || 'root',
  // database: process.env.DB_NAME || 'webapp'
  
});

// Synchronize models with the database
sequelize.sync()
  .then(() => {
    // console.log('Database synchronized successfully');
    logger.info('Database synchronized successfully');
  })
  .catch((error) => {
    // console.error('Error synchronizing database:', error);
    logger.debug('Error synchronizing database:', error);
  });

module.exports = sequelize;