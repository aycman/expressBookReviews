const express = require('express');
let books = require("./booksdb.js");

// Import axios correctly
const axios = require('axios');

// Import helper functions and shared users array
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

// Create router for public users
const public_users = express.Router();

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
public_users.post("/register", (req,res) => {

  // Get username and password from request body
  const username = req.body.username;
  const password = req.body.password;

  // Check if username and password are provided
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
      });

      // Successful registration
      return res.status(200).json({
        message: "User successfully registered. Now you can login"
      });

    } else {

      // Username already exists
      return res.status(409).json({
        message: "User already exists!"
      });
    }
  }

  // Missing username or password
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

  new Promise((resolve, reject) => {

    // Check if books object exists
    if(books) {

      // Resolve with books data
      resolve(books);

    } else {

      // Reject if books not found
      reject("Books not found");
    }

  })

  .then((data) => {

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

  })

  .catch((err) => {

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
public_users.get('/isbn/:isbn', async function (req, res) {

  try {

    // Get ISBN from request parameters
    const isbn = req.params.isbn;

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
    const response = await axios.get('http://localhost:5001/');

    // Extract books data from response
    const allBooks = response.data;

    // Find matching book using ISBN key
    const foundBook = allBooks[isbn];

    // Check if book exists
    if(foundBook) {

      // Return matching book
      return res.status(200).json(foundBook);

    } else {

      // Book not found
      return res.status(404).json({
        message: "Book not found"
      });
    }

  } catch (err) {

    /*
    |--------------------------------------------------------------------------
    | Handle axios/server errors
    |--------------------------------------------------------------------------
    */
    return res.status(500).json({
      message: "Error retrieving book details"
    });

  }

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

  new Promise((resolve, reject) => {

    /*
    |--------------------------------------------------------------------------
    | Get all keys from books object
    |--------------------------------------------------------------------------
    | Example:
    | ["1", "2", "3"]
    |--------------------------------------------------------------------------
    */
    const bookKeys = Object.keys(books);

    // Get author from request parameter
    const authorParams = req.params.author;

    // Store matching books
    const matchingBooks = [];

    /*
    |--------------------------------------------------------------------------
    | Iterate through books
    |--------------------------------------------------------------------------
    */
    bookKeys.forEach((key) => {

      /*
      |--------------------------------------------------------------------------
      | Compare authors (case-insensitive)
      |--------------------------------------------------------------------------
      */
      if(
        books[key].author.toLowerCase() ===
        authorParams.toLowerCase()
      ) {

        // Add matching book
        matchingBooks.push(books[key]);
      }

    });

    // Check if matching books found
    if(matchingBooks.length > 0) {

      resolve(matchingBooks);

    } else {

      reject("Book not found");
    }

  })

  .then((data) => {

    // Success response
    res.status(200).json(data);

  })

  .catch((err) => {

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

  new Promise((resolve, reject) => {

    /*
    |--------------------------------------------------------------------------
    | Get all book objects as array
    |--------------------------------------------------------------------------
    */
    const bookValues = Object.values(books);

    // Get title from request parameter
    const titleParams = req.params.title;

    /*
    |--------------------------------------------------------------------------
    | Filter matching books
    |--------------------------------------------------------------------------
    | Case-insensitive comparison
    |--------------------------------------------------------------------------
    */
    const matchingBooks = bookValues.filter(book =>
      book.title.toLowerCase() ===
      titleParams.toLowerCase()
    );

    // Check if matches found
    if (matchingBooks.length > 0) {

      resolve(matchingBooks);

    } else {

      reject("Book not found");
    }

  })

  .then((data) => {

    // Success response
    res.status(200).json(data);

  })

  .catch((err) => {

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
  const isbnParams = req.params.isbn;

  // Find matching book
  const foundBook = books[isbnParams];

  // Check if book exists
  if(foundBook) {

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
