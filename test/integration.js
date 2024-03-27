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
    await User.sync({ force: true }); // Sync models to database with force option
  });

// beforeEach(async () => {
//   // Truncate the User table before each test to start with a clean slate
//   await User.truncate({ cascade: true });
// });

describe('Integration tests for /v1/user endpoint', () => {
  it('Test 1: Create an account and validate existence using GET', async function() {
    // Set timeout to 5 seconds (5000ms)
    this.timeout(5000);
      const newUser = {
        first_name: 'John',
        last_name: 'Doe',
        username: 'johndoe@example.com',
        password: 'password123',
        verified: true, // Set verified status to true to skip verification
        verificationToken: null, // Set verificationToken to null for testing
      };

      try {
        // Create an account
        const createResponse = await request(app)
          .post('/v1/user')
          .send(newUser);
        console.log('Create response:', createResponse.statusCode, createResponse.body);
  
        // Assert that the user was created successfully
        expect(createResponse.statusCode).to.equal(201); // Check for successful creation
  
        // Retrieve the created user using Basic Authentication headers
        const getUserResponse = await request(app)
          .get(`/v1/user/self`)
          .auth(newUser.username, newUser.password); // Include Basic Authentication headers
        console.log('Get user response:', getUserResponse.statusCode, getUserResponse.body);
  
        // Assert that the user exists and has the correct details
        expect(getUserResponse.statusCode).to.equal(200); // Check if user exists in the database
        expect(getUserResponse.body.username).to.equal(newUser.username); // Validate user details
      } catch (error) {
        console.error('Test 1 error:', error);
        throw error; // Rethrow the error to fail the test
      }
    });
  
    it('Test 2: Update account and validate changes using GET', async function() {
      // Set timeout to 5 seconds (5000ms)
      this.timeout(5000);
      // Create an account first
      const newUser = {
        first_name: 'Jane',
        last_name: 'Doe',
        username: 'janedoe@example.com',
        password: 'password123',
        verificationToken: null, // Default verification token
        verified: true, // Default verified status
      };
      try {
        // Create the user
        const createResponse = await request(app)
          .post('/v1/user')
          .send(newUser);
        console.log('Create response:', createResponse.statusCode, createResponse.body);
    
        // Assert that the user was created successfully
        expect(createResponse.statusCode).to.equal(201); // Check for successful creation
    
        // Update user details with Basic Authentication headers
        const updatedData = {
          first_name: 'Updated Jane',
          last_name: 'Updated Doe',
        };
        const updateResponse = await request(app)
          .put(`/v1/user/self`)
          .auth(newUser.username, newUser.password)
          .send(updatedData);
        console.log('Update response:', updateResponse.statusCode);
    
        // Assert that the user was updated successfully
        expect(updateResponse.statusCode).to.equal(204); // No content on successful update
    
        // Retrieve updated user details
        const getUserResponse = await request(app)
          .get(`/v1/user/self`)
          .auth(newUser.username, newUser.password);
        console.log('Get user response:', getUserResponse.statusCode, getUserResponse.body);
    
        // Assert that the user exists and has the correct updated details
        expect(getUserResponse.statusCode).to.equal(200); // Check if user exists in the database
        expect(getUserResponse.body.first_name).to.equal(updatedData.first_name); // Validate updated first name
        expect(getUserResponse.body.last_name).to.equal(updatedData.last_name); // Validate updated last name
      } catch (error) {
        console.error('Test 2 error:', error);
        throw error; // Rethrow the error to fail the test
      }
    });
});