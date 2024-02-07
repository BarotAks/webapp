// const basicAuth = require('basic-auth');
// const User = require('../models/users');

// const authenticate = async (req, res, next) => {
//   if (req.path === '/healthz' || req.path === '/v1/user') {
//     // Skip authentication for the healthz and /v1/user endpoints
//     return next();
//   }

//   const credentials = basicAuth(req);

//   if (!credentials || !credentials.name || !credentials.pass) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const user = await User.findOne({ where: { username: credentials.name } });
//   if (!user || !(await user.isValidPassword(credentials.pass))) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   req.user = user;
//   next();
// };

// module.exports = authenticate;
const basicAuth = require('basic-auth');
const User = require('../models/users');

const authenticate = async (req, res, next) => {
  if (req.path === '/healthz' || req.path === '/v1/user') {
    // Skip authentication for the healthz and /v1/user endpoints
    return next();
  }

  const credentials = basicAuth(req);

  if (!credentials || !credentials.name || !credentials.pass) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Validate username format (ensure it is an email address)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(credentials.name)) {
    return res.status(400).json({ error: 'Invalid username format. Please provide a valid email address' });
  }

  const user = await User.findOne({ where: { username: credentials.name } });
  if (!user || !(await user.isValidPassword(credentials.pass))) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user = user;
  next();
};

module.exports = authenticate;
