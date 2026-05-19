"use strict";

var express = require('express');

var books = require("./booksdb.js");

var _require = require('axios'),
    Axios = _require.Axios;

var isValid = require("./auth_users.js").isValid;

var users = require("./auth_users.js").users;

var public_users = express.Router();
public_users.post("/register", function (req, res) {
  //consts to take the username and password from the request body
  var username = req.body.username;
  var password = req.body.password; //check if username and password are provided

  if (username && password) {
    //check if the username doesn't already exist
    if (!isValid(username)) {
      //add the new user to the users array
      users.push({
        "username": username,
        "password": password
      });
      return res.status(200).json({
        message: "User successfully registered. Now you can login"
      });
    } else {
      return res.status(409).json({
        message: "User already exists!"
      });
    }
  } //return error response if username or password is missing


  return res.status(400).json({
    message: "Unable to register user."
  });
}); // Get the book list available in the shop
//using promise callbacks or async-await + axios

public_users.get('/', function (req, res) {
  new Promise(function (resolve, reject) {
    if (books) {
      resolve(books);
    } else {
      reject("Books not found");
    }
  }).then(function (data) {
    res.send(JSON.stringify(data, null, 4));
  })["catch"](function (err) {
    res.status(404).json({
      message: err
    });
  });
});

var axios = require('axios'); // Get book details based on ISBN
//send the book details as response
//using Async.Await + axios


public_users.get('/isbn/:isbn', function _callee(req, res) {
  var isbn, response, allBooks, foundBook;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          //retrieve the isbn from the request parameter
          isbn = req.params.isbn;
          /*
          axios request to local endpoint
          retrieves all books data
          */

          _context.next = 4;
          return regeneratorRuntime.awrap(axios.get('http://localhost:5001/'));

        case 4:
          response = _context.sent;
          //extract books data from response
          allBooks = response.data; //find matching book by ISBN

          foundBook = allBooks[isbn]; //check if book exists

          if (!foundBook) {
            _context.next = 11;
            break;
          }

          return _context.abrupt("return", res.status(200).json(foundBook));

        case 11:
          return _context.abrupt("return", res.status(404).json({
            message: "Book not found"
          }));

        case 12:
          _context.next = 17;
          break;

        case 14:
          _context.prev = 14;
          _context.t0 = _context["catch"](0);
          return _context.abrupt("return", res.status(500).json({
            message: "Error retrieving book details"
          }));

        case 17:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 14]]);
}); // Get book details based on author
//using promise callbacks

public_users.get('/author/:author', function (req, res) {
  new Promise(function (resolve, reject) {
    //1. Obtain all the keys for the 'books' object.
    var bookKeys = Object.keys(books); //2. Iterate through the 'books' array & check the author matches the one provided in the request parameters.

    var authorParams = req.params.author;
    var matchingBooks = [];
    bookKeys.forEach(function (key) {
      if (books[key].author.toLowerCase() === authorParams.toLowerCase()) {
        matchingBooks.push(books[key]);
      }
    }); //3. If a match is found, return the book details as a response.

    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject("Book not found");
    }
  }).then(function (data) {
    res.status(200).json(data);
  })["catch"](function (err) {
    res.status(404).json({
      message: err
    });
  });
}); // Get all books based on title
//using promise callbacks

public_users.get('/title/:title', function (req, res) {
  new Promise(function (resolve, reject) {
    //1. Obtain all the values for the 'books' object.
    var bookValues = Object.values(books); //2. Iterate through the 'books' array & check the title matches the one provided in the request parameters.

    var titleParams = req.params.title;
    var matchingBooks = bookValues.filter(function (book) {
      return book.title.toLowerCase() === titleParams.toLowerCase();
    }); //3. If a match is found, return the book details as a response.

    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject("Book not found");
    }
  }).then(function (data) {
    res.status(200).json(data);
  })["catch"](function (err) {
    res.status(404).json({
      message: err
    });
  });
}); //  Get book review

public_users.get('/review/:isbn', function (req, res) {
  var isbnParams = req.params.isbn;
  var foundBook = books[isbnParams];

  if (foundBook) {
    return res.status(200).json(foundBook.reviews);
  } else {
    return res.status(404).json({
      message: "Book not found"
    });
  }
});
module.exports.general = public_users;