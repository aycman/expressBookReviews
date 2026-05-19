"use strict";

var express = require('express');

var axios = require('axios');

var books = require("./booksdb.js");

var public_users = express.Router();
/* =========================================
TASK 10 - GET ALL BOOKS (Async/Await)
========================================= */

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
/* =========================================
TASK 11 - GET BOOK BY ISBN (Promise + Axios)
========================================= */

public_users.get('/isbn/:isbn', function (req, res) {
  var isbn = req.params.isbn;
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
      message: "Error fetching book"
    });
  });
});
/* =========================================
TASK 12 - GET BOOKS BY AUTHOR (Async/Await)
========================================= */

public_users.get('/author/:author', function _callee2(req, res) {
  var author, result;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          author = req.params.author.toLowerCase();
          result = Object.values(books).filter(function (book) {
            return book.author.toLowerCase() === author;
          });

          if (!(result.length === 0)) {
            _context2.next = 5;
            break;
          }

          return _context2.abrupt("return", res.status(404).json({
            message: "No books found"
          }));

        case 5:
          return _context2.abrupt("return", res.status(200).json(result));

        case 8:
          _context2.prev = 8;
          _context2.t0 = _context2["catch"](0);
          return _context2.abrupt("return", res.status(500).json({
            message: "Error fetching books"
          }));

        case 11:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 8]]);
});
/* =========================================
TASK 13 - GET BOOKS BY TITLE (Promise)
========================================= */

public_users.get('/title/:title', function (req, res) {
  var title = req.params.title.toLowerCase();
  axios.get('http://localhost:5001/').then(function (response) {
    var result = Object.values(response.data).filter(function (book) {
      return book.title.toLowerCase() === title;
    });

    if (result.length === 0) {
      return res.status(404).json({
        message: "No books found"
      });
    }

    return res.status(200).json(result);
  })["catch"](function () {
    return res.status(500).json({
      message: "Error fetching books"
    });
  });
});
module.exports.general = public_users;