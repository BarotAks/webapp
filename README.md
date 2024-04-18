# WebApp

This README provides an overview of the functionalities and endpoints available in the WebApp...

## Table of Contents

- [WebApp](#webapp)
  - [Table of Contents](#table-of-contents)
  - [Description](#description)
  - [Endpoints](#endpoints)
    - [Health Check](#health-check)
    - [Get User Information](#get-user-information)
    - [Update User Information](#update-user-information)
    - [Create a New User](#create-a-new-user)
  - [Error Handling](#error-handling)

## Description

The WebApp is a backend API built using Express.js for managing user information. It provides endpoints for health checks, retrieving user information, updating user information, and creating new users. User data is stored in a database using Sequelize.

## Endpoints

### Health Check

- **Endpoint:** `/healthz`
- **Method:** GET
- **Description:** Checks the health of the database connection.
- **Request Body:** N/A
- **Response Body:** 
  - `OK` if the database connection is successful
  - Error message if the database connection fails
- **Status Codes:**
  - 200: OK
  - 503: Service Unavailable

### Get User Information

- **Endpoint:** `/v2/user/self`
- **Method:** GET
- **Description:** Retrieves information about the authenticated user.
- **Request Body:** N/A
- **Response Body:** User information (excluding password)
- **Status Codes:**
  - 200: OK
  - 400: Bad Request (if query parameters are provided)
  - 404: Not Found (if user does not exist)
  - 500: Internal Server Error

### Update User Information

- **Endpoint:** `/v2/user/self`
- **Method:** PUT
- **Description:** Updates information about the authenticated user.
- **Request Body:** JSON object containing the fields to be updated (first_name, last_name, password)
- **Response Body:** N/A
- **Status Codes:**
  - 204: No Content
  - 400: Bad Request (if request body is blank or contains extra fields, or if query parameters are provided)
  - 404: Not Found (if user does not exist)
  - 500: Internal Server Error

### Create a New User

- **Endpoint:** `/v2/user`
- **Method:** POST
- **Description:** Creates a new user.
- **Request Body:** JSON object containing user information (first_name, last_name, password, username)
- **Response Body:** Information about the created user (excluding password)
- **Status Codes:**
  - 201: Created
  - 400: Bad Request (if required fields are missing, extra fields are provided, or username is invalid)
  - 500: Internal Server Error

## Error Handling

- **404 Not Found:** If an incorrect endpoint is accessed or a route does not match any defined endpoints, a `404 Not Found` error is returned.
- **401 Unauthorized:** If authentication credentials are missing or invalid, a `401 Unauthorized` error is returned.
- **400 Bad Request:** If the request body is blank, contains extra fields, or query parameters are provided where not allowed, a `400 Bad Request` error is returned.
- **500 Internal Server Error:** If any unexpected error occurs during processing, a `500 Internal Server Error` is returned.


