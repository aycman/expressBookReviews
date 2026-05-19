"use strict";

var express = require('express');

var jwt = require('jsonwebtoken');

var books = require("./booksdb.js");

var regd_users = express.Router();

var session = require('express-session');

var users = []; // const doesExist = (username) => {
//   //filter the users array and check if there is user with the same username
//   let userswithsamename = users.filter((user) => { 
//     return user.username === username; });
//   //return true if any user with the same name is found, otherwise false
//   if(userswithsamename.length > 0) {
//     return true;
//   } else {
//     return false;
//   }
// }
// Check if a user with the given username already exists

var isValid = function isValid(username) {
  //returns boolean
  //write code to check is the username is valid
  //filter the users array and check if there is user with the same username
  var userswithsamename = users.filter(function (user) {
    return user.username === username;
  }); //return true if any user with the same name is found, otherwise false

  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
}; // Check if the user with the given username and password exists


var authenticatedUser = function authenticatedUser(username, password) {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  // Filter the users array for any user with the same username and password
  var validusers = users.filter(function (user) {
    return user.username === username && user.password === password;
  }); //return true if any valid user is found, otherwise false

  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
}; //only registered users can login
//jwt token generation and authentication and session management


regd_users.post("/login", function (req, res) {
  var username = req.body.username;
  var password = req.body.password; //check if username and password are provided

  if (!username || !password) {
    return res.status(404).json({
      message: "username or password missing"
    });
  } //validate user


  if (authenticatedUser(username, password)) {
    //create JWT token with username as payload
    var accessToken = jwt.sign({
      data: username
    }, "access", {
      expiresIn: 60 * 60
    }); //save token in session 

    req.session.authorization = {
      accessToken: accessToken
    };
    return res.status(200).json({
      message: "Customer successfully logged in",
      token: accessToken
    });
  }

  return res.status(208).json({
    message: "Invalid Login. Check username and password"
  });
}); // Add a book review and update the book review

regd_users.put("/auth/review/:isbn", function (req, res) {
  //get ISBN from request paramenters
  var isbn = req.params.isbn; //get review text from requested body

  var review = req.body.review; //get username from session - get logged-in username from JWT payload
  //req.user is added in index.js after token verification in the auth middleware

  var username = req.user.data; //find book directly using object key

  var book = books[isbn]; //check if book exists

  if (!book) {
    return res.status(404).json({
      message: "Book not found"
    });
  } //if reviews object does not exist, create it


  if (!book.reviews) {
    book.reviews = {};
  }
  /*
     Add or update review
      reviews object structure:
      reviews: {
       "john": "Great book",
       "mike": "Amazing story"
     }
      If the same username already exists,
     its review will be overwritten (updated).
   */


  book.reviews[username] = review; //*** here book is a reference to the book object in the books database, so we are directly updating the reviews object of that book
  //success response

  return res.status(200).json({
    message: "Review successfully added/updated",
    reviews: book.reviews
  });
}); //delete a book review

regd_users["delete"]("/auth/review/:isbn", function (req, res) {
  /*
    filter & delete the review based on the session username
    so that only the user who posted the review can delete it and also not other's reviews
  */
  //get ISBN from requested parameters
  var isbn = req.params.isbn; //get username from session - get logged-in username from JWT payload
  //req.user is added in index.js after token verification in the auth middleware

  var username = req.user.data; //find book directly

  var book = books[isbn]; //check if book exists

  if (!book) {
    return res.status(404).json({
      message: "Book not found"
    });
  } //check if review exists


  if (book.reviews && book.reviews[username]) {
    delete book.reviews[username]; //delete the review by deleting the username key from the reviews object

    return res.status(200).json({
      message: "Review successfully deleted"
    });
  } else {
    return res.status(404).json({
      message: "Review not found for this user"
    });
  }

  ;
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;