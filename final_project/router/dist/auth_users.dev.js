"use strict";

var express = require('express');

var jwt = require('jsonwebtoken');

var books = require("./booksdb.js");

var regd_users = express.Router();
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
};

var authenticatedUser = function authenticatedUser(username, password) {} //returns boolean
//write code to check if username and password match the one we have in records.
//only registered users can login
;

regd_users.post("/login", function (req, res) {
  //Write your code here
  return res.status(300).json({
    message: "Yet to be implemented"
  });
}); // Add a book review

regd_users.put("/auth/review/:isbn", function (req, res) {
  //Write your code here
  return res.status(300).json({
    message: "Yet to be implemented"
  });
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;