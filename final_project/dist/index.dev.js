"use strict";

var express = require('express');

var jwt = require('jsonwebtoken');

var session = require('express-session');

var customer_routes = require('./router/auth_users.js').authenticated;

var genl_routes = require('./router/general.js').general;

var app = express();
app.use(express.json());
app.use("/customer", session({
  secret: "fingerprint_customer",
  resave: true,
  saveUninitialized: true
}));
app.use("/customer/auth/*", function auth(req, res, next) {
  //the authenication mechanism
  //session authorization feature to authenticate a user based on the access token
  // Check if user is logged in and has valid access token
  if (req.session.authorization) {
    var token = req.session.authorization['accessToken']; // Verify JWT token

    jwt.verify(token, "access", function (err, user) {
      if (!err) {
        req.user = user;
        next(); // Proceed to the next middleware
      } else {
        return res.status(403).json({
          message: "User not authenticated"
        });
      }
    });
  } else {
    return res.status(403).json({
      message: "User not logged in"
    });
  }
});
var PORT = 5000;
app.use("/customer", customer_routes);
app.use("/", genl_routes);
app.listen(PORT, function () {
  return console.log("Server is running");
});