// routes/users.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/users');
const sequelize = require('../config/database');
const bodyParser = require('body-parser'); // Import bodyParser
const { Op } = require('sequelize');
const logger = require('../logging');
const { PubSub } = require('@google-cloud/pubsub');
const uuid = require('uuid');
const dotenv = require('dotenv');

dotenv.config();

const pubSubClient = new PubSub();

// Middleware to handle unsupported methods and payload checks
router.use('/healthz', bodyParser.json());
router.use('/healthz', (req, res, next) => {
    if (req.method !== 'GET') {
        // Reject non-GET requests
        logger.warn(`Rejected ${req.method} request at /healthz. Only GET requests are allowed.`);
        res.status(405).header('Allow', 'GET').header('Cache-Control', 'no-cache, no-store, must-revalidate').send();
    } else if (Object.keys(req.query).length > 0 || Object.keys(req.body).length > 0) {
        // Reject requests with query parameters or body payload
        logger.warn(`Rejected GET request at /healthz with query parameters or body payload.`);
        res.status(400).json({ error: 'Query parameters or body payload are not allowed for health check.' });
    } else {
      next();
   }   
});

// Health endpoint
router.get('/healthz', async (req, res) => {
    try {
        await sequelize.authenticate();
        logger.debug('Database connection successful.');
        res.status(200).header('Cache-Control', 'no-cache, no-store, must-revalidate').send('OK');
    } catch (error) {
        logger.error('Database connection error:', error);
        // logger.debug('Database connection failed.', error);
        res.status(503).header('Cache-Control', 'no-cache, no-store, must-revalidate').json({ error: 'Service Unavailable' });
    }
});

// Get user information
router.get('/v2/user/self', async (req, res) => {
  try {
        // Check if user is verified
        if (!req.user || !req.user.verified) {
          logger.warn('Unauthorized access: User account not verified.');
          return res.status(403).json({ error: 'Unauthorized access: User account not verified.' });
        }

    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'verificationToken', 'verified', 'verificationEmailSentAt', 'linkVerifiedAt'] }
    });
    
    if (!user) {
      logger.warn('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

          // Check for query parameters
          if (Object.keys(req.query).length > 0) {
            logger.warn('Query parameters are not allowed for this endpoint');
            return res.status(400).json({ error: 'Query parameters are not allowed for this endpoint' });
          }
    logger.info('User information retrieved successfully'+ JSON.stringify(user));
    res.status(200).json(user);
  } catch (error) {
    logger.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update user information
router.put('/v2/user/self', async (req, res) => {
    try {
          // Check if user is verified
    if (!req.user || !req.user.verified) {
      logger.warn('Unauthorized access: User account not verified.');
      return res.status(403).json({ error: 'Unauthorized access: User account not verified.' });
    }

      const { first_name, last_name, password } = req.body;

      // Check for blank request body
      if (!first_name && !last_name && !password) {
        logger.warn('Request body cannot be blank. Please provide at least one field to update.');
        return res.status(400).json({ error: 'Request body cannot be blank. Please provide at least one field to update.' });
      }

      // Check for extra fields in the request body
      const extraFields = Object.keys(req.body).filter(field => !['first_name', 'last_name', 'password'].includes(field));
      if (extraFields.length > 0) {
        logger.warn('Extra fields are not allowed. Please provide only first_name, last_name, and password');
        return res.status(400).json({ error: 'Extra fields are not allowed. Please provide only first_name, last_name, and password' });
      }
     // Check for query parameters
         if (Object.keys(req.query).length > 0) {
            logger.warn('Query parameters are not allowed for this endpoint');
            return res.status(400).json({ error: 'Query parameters are not allowed for this endpoint' });
                      }
  
      // Fetch user by ID
      const user = await User.findByPk(req.user.id);
      if (!user) {
        logger.warn('User not found');
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Update user information
      if (first_name) user.first_name = first_name;
      if (last_name) user.last_name = last_name;
      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }
      
      // Update account_updated field
      user.account_updated = new Date();
  
      await user.save();
  
      logger.info('User information updated successfully');
      res.status(204).end();
    } catch (error) {
      logger.error('Error updating user information:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });  

  
// Create a new user
router.post('/v2/user', async (req, res) => {
  try {
    const { first_name, last_name, password, username } = req.body;

    // Check if required fields are provided
    if (!first_name || !last_name || !password || !username) {
      logger.warn('Required fields are missing. Please provide first_name, last_name, password, and username');
      return res.status(400).json({ error: 'Required fields are missing. Please provide first_name, last_name, password, and username' });
    }

    // Check if extra fields are provided
    const allowedFields = ['first_name', 'last_name', 'password', 'username'];
    const extraFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));
    if (extraFields.length > 0) {
      logger.warn('Extra fields are not allowed. Please provide only first_name, last_name, password, and username');
      return res.status(400).json({ error: 'Extra fields are not allowed. Please provide only first_name, last_name, password, and username' });
    }

    // Validate username format (ensure it is an email address)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
      logger.warn('Invalid username format. Please provide a valid email address');
      return res.status(400).json({ error: 'Invalid username format. Please provide a valid email address' });
    }

    // Check if user with email already exists
    const existingUser = await User.findOne({ where: { username: username } });
    if (existingUser) {
      logger.error('User with this email already exists');
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    // Generate verification token (UUID)
    const verificationToken = uuid.v4();

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      username: username,
      password: hashedPassword,
      first_name: first_name,
      last_name: last_name,
      verificationToken: verificationToken,
      verified: false, // Initial verified status
      account_created: new Date(), // Set account_created to current time
      verificationEmailSentAt: new Date(), // Set verificationEmailSentAt to current time
      linkVerifiedAt: null // Initially, link not verified
    });

    // Exclude password from the response payload
    const responseUser = {
      id: newUser.id,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      username: newUser.username,
      account_created: newUser.account_created,
      account_updated: newUser.account_updated
    };

    logger.info('New user created:', + JSON.stringify(responseUser));
    res.status(201).json(responseUser);

    // Trigger email verification process
    // Publish message to Pub/Sub topic
    // const topicID = process.env.PUBSUB_TOPIC;
    
    const topicName = `projects/${process.env.PROJECT_ID}/topics/${process.env.PUBSUB_TOPIC}`;
    const data = {
        username: username,
        firstName: first_name,
        lastName: last_name,
        verificationToken: verificationToken // Pass verification token to the Cloud Function
    };
    const dataBuffer = Buffer.from(JSON.stringify(data));

    await pubSubClient.topic(topicName).publishMessage({ data: dataBuffer });

  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      // Handle validation errors (e.g., invalid email format)
      logger.error('Validation error:', error.errors[0].message);
      return res.status(400).json({ error: error.errors[0].message });
    } else {
      // Handle other types of errors
      logger.error('Internal Server Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

// Middleware to block API calls for unverified users
router.use((req, res, next) => {
  if (req.path === '/v2/user/verify') {
    // Skip the middleware for the verification endpoint
    return next();
  }

  if (!req.user || !req.user.verified) {
      logger.warn('Unauthorized access: User account not verified.');
      return res.status(403).json({ error: 'Unauthorized access: User account not verified.' });
  }
  next();
});

// Email verification endpoint
router.get('/v2/user/verify', async (req, res) => {
  try {
    const { token } = req.query;

    // Check if token is provided
    if (!token) {
      logger.warn('Verification token is missing.');
      return res.status(400).json({ error: 'Verification token is missing.' });
    }

    // Find user by verification token
    const user = await User.findOne({ where: { verificationToken: token } });
    if (!user) {
      logger.warn('User not found or already verified.');
      return res.status(404).json({ error: 'User not found or already verified.' });
    }

    // Check if the verification link has expired (compare with current time)
    const linkExpirationTime = 2 * 60 * 1000; // 2 minutes in milliseconds
    const currentTime = new Date();
    const tokenExpirationTime = new Date(user.verificationEmailSentAt.getTime() + linkExpirationTime);
    if (currentTime > tokenExpirationTime) {
      logger.warn('Verification link has expired.');
      return res.status(400).json({ error: 'Verification link has expired.' });
    }

    // Update user verification status to true
    user.verified = true;
    user.verificationToken = null; // Clear verification token
    user.linkVerifiedAt = new Date(); // Set linkVerifiedAt to current time
    await user.save();

    logger.info('User verified successfully');
    // Render a success message in the browser
    // res.send('<h1>Verification Successful</h1><p>Your email has been successfully verified.</p>');
    // Redirect to a success page or send a success message
    res.status(200).send('User verified successfully');
  } catch (error) {
    logger.error('Error verifying user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Wildcard route handler for 404 Not Found
router.use('*', (req, res) => {
    logger.warn('Route not found:', req.originalUrl);
    res.status(404).json({ error: 'Not Found' });
  });

module.exports = router;