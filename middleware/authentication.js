const basicAuth = require('basic-auth');
const bcrypt = require('bcrypt');
const User = require('../models/users');
const logger = require('../logging');

const authenticate = async (req, res, next) => {
  try {
    // Skip authentication for certain endpoints
    if (req.path === '/healthz' || req.path === '/v2/user' || req.path === '*' || req.path === '/v2/user/verify' ) {
        return next();
    }

    // Extract credentials from Basic Authentication header
    logger.debug('Authentication process started');
    const credentials = basicAuth(req);

    // Ensure credentials are provided
    if (!credentials || !credentials.name || !credentials.pass) {
      return res.status(401).json({ error: 'Unauthorized: Credentials are missing' });
    }

    // Find user by username (email)
    const user = await User.findOne({ where: { username: credentials.name } });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid username or password' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(credentials.pass, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Unauthorized: Invalid username or password' });
    }

    // Set authenticated user in request object
    req.user = user;
    logger.debug('Authentication process done');
    next();
  } catch (error) {
    // console.error('Authentication error:', error);
    logger.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = authenticate;