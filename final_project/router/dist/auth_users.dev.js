"use strict";

var express = require('express');

var jwt = require('jsonwebtoken');

var books = require("./booksdb.js");

var regd_users = express.Router();

var session = require('express-session'); // Stores registered users
// Example:
// [
//   { username: "john", password: "1234" },
//   { username: "mike", password: "abcd" }
// ]


var users = [];
/*
|--------------------------------------------------------------------------
| Check if username already exists
|--------------------------------------------------------------------------
| Returns:
| true  -> username exists
| false -> username does not exist
|--------------------------------------------------------------------------
*/

var isValid = function isValid(username) {
  // Find users with the same username
  var userswithsamename = users.filter(function (user) {
    return user.username === username;
  }); // If array length > 0, username already exists

  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};
/*
|--------------------------------------------------------------------------
| Authenticate user
|--------------------------------------------------------------------------
| Checks if username + password match
|
| Returns:
| true  -> valid login
| false -> invalid login
|--------------------------------------------------------------------------
*/


var authenticatedUser = function authenticatedUser(username, password) {
  // Filter users matching username and password
  var validusers = users.filter(function (user) {
    return user.username === username && user.password === password;
  }); // If at least one user matched => valid login

  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};
/*
|--------------------------------------------------------------------------
| LOGIN ROUTE
|--------------------------------------------------------------------------
| Only registered users can login
|
| Steps:
| 1. Get username/password from request body
| 2. Validate credentials
| 3. Generate JWT token
| 4. Save token in session
| 5. Return success response
|--------------------------------------------------------------------------
*/


regd_users.post("/login", function (req, res) {
  // Extract login data from request body
  var username = req.body.username;
  var password = req.body.password; // Check if username/password are missing

  if (!username || !password) {
    return res.status(404).json({
      message: "username or password missing"
    });
  } // Validate login credentials


  if (authenticatedUser(username, password)) {
    /*
    |--------------------------------------------------------------------------
    | Create JWT token
    |--------------------------------------------------------------------------
    | Payload:
    | {
    |   data: username
    | }
    |
    | Secret key: "access"
    | Expiration: 1 hour
    |--------------------------------------------------------------------------
    */
    var accessToken = jwt.sign({
      data: username
    }, "access", {
      expiresIn: 60 * 60
    });
    /*
    |--------------------------------------------------------------------------
    | Save token in session
    |--------------------------------------------------------------------------
    | req.session.authorization becomes:
    |
    | {
    |   accessToken: "jwt-token-here"
    | }
    |--------------------------------------------------------------------------
    */

    req.session.authorization = {
      accessToken: accessToken
    }; // Successful login response

    return res.status(200).json({
      message: "Customer successfully logged in",
      token: accessToken
    });
  } // Invalid username/password


  return res.status(208).json({
    message: "Invalid Login. Check username and password"
  });
});
/*
|--------------------------------------------------------------------------
| ADD / UPDATE BOOK REVIEW
|--------------------------------------------------------------------------
| Route:
| PUT /customer/auth/review/:isbn
|
| Steps:
| 1. Get ISBN from URL params
| 2. Get review text from request body
| 3. Get logged-in username from JWT payload
| 4. Find book
| 5. Create reviews object if missing
| 6. Add/update review
|--------------------------------------------------------------------------
*/

regd_users.put("/auth/review/:isbn", function (req, res) {
  // Get ISBN from URL parameter
  var isbn = req.params.isbn; // Get review text from request body
  // Example:
  // {
  //   "review": "Amazing book"
  // }

  var review = req.body.review;
  /*
  |--------------------------------------------------------------------------
  | Get logged-in username
  |--------------------------------------------------------------------------
  | req.user is added in auth middleware inside index.js
  |
  | Example:
  | req.user = {
  |   data: "john",
  |   iat: 123456,
  |   exp: 123456
  | }
  |--------------------------------------------------------------------------
  */

  var username = req.user.data; // Find book using ISBN key

  var book = books[isbn]; // Check if book exists

  if (!book) {
    return res.status(404).json({
      message: "Book not found"
    });
  }
  /*
  |--------------------------------------------------------------------------
  | Create reviews object if it doesn't exist
  |--------------------------------------------------------------------------
  | Example:
  | reviews: {}
  |--------------------------------------------------------------------------
  */


  if (!book.reviews) {
    book.reviews = {};
  }
  /*
  |--------------------------------------------------------------------------
  | Add or update review
  |--------------------------------------------------------------------------
  | reviews object structure:
  |
  | reviews: {
  |   "john": "Great book",
  |   "mike": "Amazing story"
  | }
  |
  | If same username exists:
  | old review gets overwritten (updated)
  |--------------------------------------------------------------------------
  */
  // IMPORTANT:
  // 'book' is a reference to the original object inside books database.
  // So modifying book.reviews directly updates books[isbn].


  book.reviews[username] = review; // Success response

  return res.status(200).json({
    message: "Review successfully added/updated",
    reviews: book.reviews
  });
});
/*
|--------------------------------------------------------------------------
| DELETE BOOK REVIEW
|--------------------------------------------------------------------------
| Route:
| DELETE /customer/auth/review/:isbn
|
| Only the logged-in user's review can be deleted
|--------------------------------------------------------------------------
*/

regd_users["delete"]("/auth/review/:isbn", function (req, res) {
  // Get ISBN from URL parameter
  var isbn = req.params.isbn; // Get logged-in username from JWT payload

  var username = req.user.data; // Find book using ISBN

  var book = books[isbn]; // Check if book exists

  if (!book) {
    return res.status(404).json({
      message: "Book not found"
    });
  }
  /*
  |--------------------------------------------------------------------------
  | Check if review exists for this user
  |--------------------------------------------------------------------------
  | Example:
  | reviews: {
  |   "john": "Great book"
  | }
  |--------------------------------------------------------------------------
  */


  if (book.reviews && book.reviews[username]) {
    /*
    |--------------------------------------------------------------------------
    | Delete review
    |--------------------------------------------------------------------------
    | delete removes the property from object
    |
    | Before:
    | {
    |   john: "Great book"
    | }
    |
    | After:
    | {}
    |--------------------------------------------------------------------------
    */
    delete book.reviews[username]; // Success response

    return res.status(200).json({
      message: "Review successfully deleted"
    });
  } else {
    // Review not found for this user
    return res.status(404).json({
      message: "Review not found for this user"
    });
  }
});
/*
|--------------------------------------------------------------------------
| Export router + helper functions
|--------------------------------------------------------------------------
*/

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;