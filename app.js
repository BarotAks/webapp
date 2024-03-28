// app.js

const express = require('express');
const app = express();
const sequelize = require('./config/database');
const usersRouter = require('./routes/users');
const authenticate = require('./middleware/authentication');
const { Model } = require('sequelize');
const logger = require('./logging');

// Middleware
app.use(express.json());

// Routes
app.use(authenticate, usersRouter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  // console.log(`Server started on port ${PORT}`);
  logger.info(`Server started on port ${PORT}`);
  try {
    await sequelize.authenticate();
    // console.log('Database connected successfully');
    logger.info('Database connected successfully');
  } catch (error) {
    // console.error('Unable to connect to the database:', error);
    logger.debug('Unable to connect to the database:', error);
  }
});

module.exports = app;