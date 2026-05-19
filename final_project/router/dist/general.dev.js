"use strict";

var express = require('express');

var books = require("./booksdb.js"); // Import axios correctly


var axios = require('axios'); // Import helper functions and shared users array


var isValid = require("./auth_users.js").isValid;

var users = require("./auth_users.js").users; // Create router for public users


var public_users = express.Router();
/*
|--------------------------------------------------------------------------
| REGISTER NEW USER
|--------------------------------------------------------------------------
| Route:
| POST /register
|
| Request Body Example:
| {
|   "username": "john",
|   "password": "1234"
| }
|--------------------------------------------------------------------------
*/

public_users.post("/register", function (req, res) {
  // Get username and password from request body
  var username = req.body.username;
  var password = req.body.password; // Check if username and password are provided

  if (username && password) {
    // Check if username already exists
    if (!isValid(username)) {
      /*
      |--------------------------------------------------------------------------
      | Add new user to users array
      |--------------------------------------------------------------------------
      | Example:
      | users.push({
      |   username: "john",
      |   password: "1234"
      | })
      |--------------------------------------------------------------------------
      */
      users.push({
        "username": username,
        "password": password
      }); // Successful registration

      return res.status(200).json({
        message: "User successfully registered. Now you can login"
      });
    } else {
      // Username already exists
      return res.status(409).json({
        message: "User already exists!"
      });
    }
  } // Missing username or password


  return res.status(400).json({
    message: "Unable to register user."
  });
});
/*
|--------------------------------------------------------------------------
| GET ALL BOOKS
|--------------------------------------------------------------------------
| Route:
| GET /
|
| Uses Promise callbacks
|--------------------------------------------------------------------------
*/

public_users.get('/', function (req, res) {
  new Promise(function (resolve, reject) {
    // Check if books object exists
    if (books) {
      // Resolve with books data
      resolve(books);
    } else {
      // Reject if books not found
      reject("Books not found");
    }
  }).then(function (data) {
    /*
    |--------------------------------------------------------------------------
    | Send formatted JSON response
    |--------------------------------------------------------------------------
    | JSON.stringify(data, null, 4)
    |
    | null -> no replacer function
    | 4    -> indentation spaces
    |--------------------------------------------------------------------------
    */
    res.send(JSON.stringify(data, null, 4));
  })["catch"](function (err) {
    // Error response
    res.status(404).json({
      message: err
    });
  });
});
/*
|--------------------------------------------------------------------------
| GET BOOK BY ISBN
|--------------------------------------------------------------------------
| Route:
| GET /isbn/:isbn
|
| Uses:
| Async/Await + Axios
|--------------------------------------------------------------------------
*/

public_users.get('/isbn/:isbn', function _callee(req, res) {
  var isbn, response, allBooks, foundBook;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          // Get ISBN from request parameters
          isbn = req.params.isbn;
          /*
          |--------------------------------------------------------------------------
          | Axios request to local endpoint
          |--------------------------------------------------------------------------
          | Sends GET request to:
          | http://localhost:5001/
          |
          | Retrieves all books
          |--------------------------------------------------------------------------
          */

          _context.next = 4;
          return regeneratorRuntime.awrap(axios.get('http://localhost:5001/'));

        case 4:
          response = _context.sent;
          // Extract books data from response
          allBooks = response.data; // Find matching book using ISBN key

          foundBook = allBooks[isbn]; // Check if book exists

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
});
/*
|--------------------------------------------------------------------------
| GET BOOKS BY AUTHOR
|--------------------------------------------------------------------------
| Route:
| GET /author/:author
|
| Uses Promise callbacks
|--------------------------------------------------------------------------
*/

public_users.get('/author/:author', function (req, res) {
  new Promise(function (resolve, reject) {
    /*
    |--------------------------------------------------------------------------
    | Get all keys from books object
    |--------------------------------------------------------------------------
    | Example:
    | ["1", "2", "3"]
    |--------------------------------------------------------------------------
    */
    var bookKeys = Object.keys(books); // Get author from request parameter

    var authorParams = req.params.author; // Store matching books

    var matchingBooks = [];
    /*
    |--------------------------------------------------------------------------
    | Iterate through books
    |--------------------------------------------------------------------------
    */

    bookKeys.forEach(function (key) {
      /*
      |--------------------------------------------------------------------------
      | Compare authors (case-insensitive)
      |--------------------------------------------------------------------------
      */
      if (books[key].author.toLowerCase() === authorParams.toLowerCase()) {
        // Add matching book
        matchingBooks.push(books[key]);
      }
    }); // Check if matching books found

    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject("Book not found");
    }
  }).then(function (data) {
    // Success response
    res.status(200).json(data);
  })["catch"](function (err) {
    // Error response
    res.status(404).json({
      message: err
    });
  });
});
/*
|--------------------------------------------------------------------------
| GET BOOKS BY TITLE
|--------------------------------------------------------------------------
| Route:
| GET /title/:title
|
| Uses Promise callbacks
|--------------------------------------------------------------------------
*/

public_users.get('/title/:title', function (req, res) {
  new Promise(function (resolve, reject) {
    /*
    |--------------------------------------------------------------------------
    | Get all book objects as array
    |--------------------------------------------------------------------------
    */
    var bookValues = Object.values(books); // Get title from request parameter

    var titleParams = req.params.title;
    /*
    |--------------------------------------------------------------------------
    | Filter matching books
    |--------------------------------------------------------------------------
    | Case-insensitive comparison
    |--------------------------------------------------------------------------
    */

    var matchingBooks = bookValues.filter(function (book) {
      return book.title.toLowerCase() === titleParams.toLowerCase();
    }); // Check if matches found

    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject("Book not found");
    }
  }).then(function (data) {
    // Success response
    res.status(200).json(data);
  })["catch"](function (err) {
    // Error response
    res.status(404).json({
      message: err
    });
  });
});
/*
|--------------------------------------------------------------------------
| GET BOOK REVIEWS
|--------------------------------------------------------------------------
| Route:
| GET /review/:isbn
|--------------------------------------------------------------------------
*/

public_users.get('/review/:isbn', function (req, res) {
  // Get ISBN from request parameters
  var isbnParams = req.params.isbn; // Find matching book

  var foundBook = books[isbnParams]; // Check if book exists

  if (foundBook) {
    /*
    |--------------------------------------------------------------------------
    | Return reviews object
    |--------------------------------------------------------------------------
    | Example:
    | {
    |   "john": "Amazing book",
    |   "mike": "Very useful"
    | }
    |--------------------------------------------------------------------------
    */
    return res.status(200).json(foundBook.reviews);
  } else {
    // Book not found
    return res.status(404).json({
      message: "Book not found"
    });
  }
});
/*
|--------------------------------------------------------------------------
| Export Router
|--------------------------------------------------------------------------
*/

module.exports.general = public_users;