"use strict";

var express = require('express');

var books = require("./booksdb.js");

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
      return res.status(404).json({
        message: "User already exists!"
      });
    }
  } //return error response if username or password is missing


  return res.status(404).json({
    message: "Unable to register user."
  });
}); // Get the book list available in the shop

public_users.get('/', function (req, res) {
  //get all the books information using JSON string
  res.send(JSON.stringify(books, null, 4));
}); // Get book details based on ISBN

public_users.get('/isbn/:isbn', function (req, res) {
  //retrieve the isbn from the request parameter
  var isbn = req.params.isbn; //convert object values to an array and find the matching book

  var bookList = Object.values(books);
  var foundBook = bookList.find(function (book) {
    return book.ISBN === isbn;
  }); //send the book details as response

  if (foundBook) {
    return res.status(200).json(foundBook);
  } else {
    return res.status(401).json({
      message: "Book not found"
    });
  }
}); // Get book details based on author

public_users.get('/author/:author', function (req, res) {
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
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(401).json({
      message: "Book not found"
    });
  }
}); // public_users.get('/author/:author', function (req, res) {
//   const authorParams = req.params.author;
//   // ۱. تبدیل مستقیم مقادیر شیء به یک آرایه از کتاب‌ها
//   const bookList = Object.values(books);
//   // ۲. فیلتر کردن کتاب‌ها بر اساس نام نویسنده
//   const matchingBooks = bookList.filter(
//     book => book.author.toLowerCase() === authorParams.toLowerCase()
//   );
//   // ۳. ارسال پاسخ
//   if (matchingBooks.length > 0) {
//     return res.status(200).json(matchingBooks);
//   } else {
//     return res.status(404).json({ message: "Book not found by this author" });
//   }
// });
// Get all books based on title

public_users.get('/title/:title', function (req, res) {
  //1. Obtain all the values for the 'books' object.
  var bookValues = Object.values(books); //2. Iterate through the 'books' array & check the title matches the one provided in the request parameters.

  var titleParams = req.params.title;
  var matchingBooks = bookValues.filter(function (book) {
    return book.title.toLowerCase() === titleParams.toLowerCase();
  }); //3. If a match is found, return the book details as a response.

  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({
      message: "Book not found"
    });
  }
}); //  Get book review

public_users.get('/review/:isbn', function (req, res) {
  var booksArr = Object.values(books);
  var isbnParams = req.params.isbn;
  var foundBook = booksArr.filter(function (book) {
    return book.ISBN === isbnParams;
  });

  if (foundBook.length > 0) {
    return res.status(200).json(foundBook[0].reviews);
  } else {
    return res.status(404).json({
      message: "Book not found"
    });
  }
});
module.exports.general = public_users;