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
});
/* =====================================================
TASK 10 - GET ALL BOOKS (Async/Await)
===================================================== */

public_users.get('/', function _callee(req, res) {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          return _context.abrupt("return", res.status(200).json(books));

        case 4:
          _context.prev = 4;
          _context.t0 = _context["catch"](0);
          return _context.abrupt("return", res.status(500).json({
            message: "Error fetching books"
          }));

        case 7:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 4]]);
});
/* =====================================================
TASK 11 - GET BOOK BY ISBN (Promise + Axios)
===================================================== */

public_users.get('/isbn/:isbn', function (req, res) {
  var isbn = req.params.isbn; // axios used only as required (no self-loop logic)

  axios.get('http://localhost:5001/').then(function (response) {
    var book = response.data[isbn];

    if (!book) {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    return res.status(200).json(book);
  })["catch"](function () {
    return res.status(500).json({
      message: "Error retrieving book by ISBN"
    });
  });
});
/* =====================================================
TASK 12 - GET BOOKS BY AUTHOR (Async/Await + Axios)
===================================================== */

public_users.get('/author/:author', function _callee2(req, res) {
  var author, response, allBooks, result;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          author = req.params.author.toLowerCase();
          _context2.next = 4;
          return regeneratorRuntime.awrap(axios.get('http://localhost:5001/'));

        case 4:
          response = _context2.sent;
          allBooks = response.data;
          result = Object.values(allBooks).filter(function (book) {
            return book.author.toLowerCase() === author;
          });

          if (!(result.length === 0)) {
            _context2.next = 9;
            break;
          }

          return _context2.abrupt("return", res.status(404).json({
            message: "No books found for this author"
          }));

        case 9:
          return _context2.abrupt("return", res.status(200).json(result));

        case 12:
          _context2.prev = 12;
          _context2.t0 = _context2["catch"](0);
          return _context2.abrupt("return", res.status(500).json({
            message: "Error retrieving books by author"
          }));

        case 15:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 12]]);
});
/* =====================================================
TASK 13 - GET BOOKS BY TITLE (Promise + Axios)
===================================================== */

public_users.get('/title/:title', function _callee3(req, res) {
  var title;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          title = req.params.title.toLowerCase();
          axios.get('http://localhost:5001/').then(function (response) {
            var result = Object.values(response.data).filter(function (book) {
              return book.title.toLowerCase() === title;
            });

            if (result.length === 0) {
              return res.status(404).json({
                message: "No books found for this title"
              });
            }

            return res.status(200).json(result);
          })["catch"](function () {
            return res.status(500).json({
              message: "Error retrieving books by title"
            });
          });

        case 2:
        case "end":
          return _context3.stop();
      }
    }
  });
}); //  Get book review

public_users.get('/review/:isbn', function (req, res) {
  var isbnParams = req.params.isbn;
  var foundBook = books[isbnParams]; // no reviews OR empty object

  if (!foundBook.reviews || Object.keys(foundBook.reviews).length === 0) {
    return res.status(200).json({
      message: "there is no submitted review for this book"
    });
  }

  if (foundBook) {
    return res.status(200).json(foundBook.reviews);
  } else {
    return res.status(404).json({
      message: "Book not found"
    });
  }
});
/* =====================================================
EXPORT
===================================================== */

module.exports.general = public_users;