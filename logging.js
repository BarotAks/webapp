const { createLogger, format, transports } = require('winston');
const appRoot = require('app-root-path');

// Define log levels
const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

// Define file transport options
const fileOptions = {
  filename: `${appRoot}/app.log`,
  handleExceptions: true,
  json: true,
};

// Create a logger instance
const logger = createLogger({
  levels: logLevels,
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File(fileOptions),
  ],
  exitOnError: false,
});

module.exports = logger;
