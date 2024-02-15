const request = require('supertest');
const { before, after } = require('mocha');
const app = require('../app'); // Path to your app.js file
const User = require('../models/users'); // Path to your users model
const sequelize = require('../config/database'); // Path to your database.js file
const { expect } = require('chai');

before(async () => {
  // Connect to MySQL database using environment variables
  await sequelize.authenticate();
  console.log('Connected to MySQL database');
});

after(async () => {
  // Close database connection after tests
  await sequelize.close();
  console.log('Closed MySQL database connection');
});

beforeEach(async () => {
  // Truncate the User table before each test to start with a clean slate
  await User.truncate({ cascade: true });
});

describe('Integration tests for /v1/user endpoint', () => {
    it('Test 1: Create an account and validate existence using GET', async () => {
      const newUser = {
        first_name: 'John',
        last_name: 'Doe',
        username: 'johndoe@example.com',
        password: 'password123',
      };
  
      // Create an account
      const createResponse = await request(app)
        .post('/v1/user')
        .send(newUser);
      expect(createResponse.statusCode).to.equal(201); // Check for successful creation
  
      // Retrieve the created user using Basic Authentication headers
      const getUserResponse = await request(app)
        .get(`/v1/user/self`)
        .auth(newUser.username, newUser.password); // Include Basic Authentication headers
      expect(getUserResponse.statusCode).to.equal(200); // Check if user exists in the database
      expect(getUserResponse.body.username).to.equal(newUser.username); // Validate user details
    //   expect(getUserResponse.body.username).to.equal('invalidusername'); // This will fail the test
    });
  
    it('Test 2: Update account and validate changes using GET', async () => {
      // Create an account first
      const newUser = {
        first_name: 'Jane',
        last_name: 'Doe',
        username: 'janedoe@example.com',
        password: 'password123',
      };
      const createResponse = await request(app)
        .post('/v1/user')
        .send(newUser);
      expect(createResponse.statusCode).to.equal(201);
  
      // Update user details with Basic Authentication headers
      const updateData = {
        first_name: 'Jane',
        last_name: 'Kim',
      };
      const updateResponse = await request(app)
        .put(`/v1/user/self`)
        .auth(newUser.username, newUser.password) // Include Basic Authentication headers
        .send(updateData);
      expect(updateResponse.statusCode).to.equal(204); // No content on successful update
  
      // Retrieve updated user details
      const getUserResponse = await request(app)
        .get(`/v1/user/self`)
        .auth(newUser.username, newUser.password); // Include Basic Authentication headers
      expect(getUserResponse.statusCode).to.equal(200); // Check if user exists in the database
      expect(getUserResponse.body.first_name).to.equal(updateData.first_name); // Validate updated details
      expect(getUserResponse.body.last_name).to.equal(updateData.last_name);
    });

        // After all tests are finished, exit with code 0 (success)
        after(() => {
            process.exit(0);
          });
  });
  