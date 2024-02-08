// routes/users.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/users');
const sequelize = require('../config/database');

// Get user information
router.get('/v1/user/self', async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update user information
router.put('/v1/user/self', async (req, res) => {
    try {
      const { first_name, last_name, password } = req.body;
  
      // Fetch user by ID
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Update user information
      if (first_name) user.first_name = first_name;
      if (last_name) user.last_name = last_name;
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
      }
      
      // Update account_updated field
      user.account_updated = new Date();
  
      await user.save();
  
      res.status(204).end();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });  
  
// Create a new user
router.post('/v1/user', async (req, res) => {
  try {
    const { first_name, last_name, password, username } = req.body;

    // Check if required fields are provided
    if (!first_name || !last_name || !password || !username) {
      return res.status(400).json({ error: 'Required fields are missing. Please provide first_name, last_name, password, and username' });
    }

    // Check if extra fields are provided
    const allowedFields = ['first_name', 'last_name', 'password', 'username'];
    const extraFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));
    if (extraFields.length > 0) {
      return res.status(400).json({ error: 'Extra fields are not allowed. Please provide only first_name, last_name, password, and username' });
    }

    // Validate username format (ensure it is an email address)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
      return res.status(400).json({ error: 'Invalid username format. Please provide a valid email address' });
    }

    // Check if user with email already exists
    const existingUser = await User.findOne({ where: { username: username } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      username: username,
      password: hashedPassword,
      first_name: first_name,
      last_name: last_name,
      account_created: new Date() // Set account_created to current time
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

    res.status(201).json(responseUser);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      // Handle validation errors (e.g., invalid email format)
      return res.status(400).json({ error: error.errors[0].message });
    } else {
      // Handle other types of errors
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

       
// Health endpoint
router.get('/healthz', async (req, res) => {
    try {
      await sequelize.authenticate();
      res.status(200).send('OK');
    } catch (error) {
      console.error('Database connection error:', error);
      res.status(503).send('Service Unavailable');
    }
  });

module.exports = router;