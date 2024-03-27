const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // account_created: {
  //   type: DataTypes.DATE,
  //   allowNull: false,
  //   defaultValue: DataTypes.NOW
  // },
  // account_updated: {
  //   type: DataTypes.DATE,
  //   allowNull: false,
  //   defaultValue: DataTypes.NOW
  // }
  verificationToken: {
    type: DataTypes.UUID, 
    allowNull: true, // Initially, verification token can be null until generated
    unique: true, // Each user should have a unique verification token
  },
  verificationExpiration: {
    type: DataTypes.DATE, // Store the expiration time for verification token
    allowNull: true, // Initially, expiration time can be null until generated
  },
  verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false, // Initially, user is not verified until they complete verification
  },
});

module.exports = User;
