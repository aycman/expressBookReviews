const express = require('express');
let books = require("./booksdb.js");
const { Axios } = require('axios');
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();



public_users.post("/register", (req,res) => {
  //consts to take the username and password from the request body
  const username = req.body.username;
  const password = req.body.password;

  //check if username and password are provided
  if (username && password) {
    //check if the username doesn't already exist
    if (!isValid(username)) {
      //add the new user to the users array
      users.push({"username": username, "password": password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    }else{
      return res.status(409).json({message: "User already exists!"});
    }
  }
  //return error response if username or password is missing
  return res.status(400).json({message: "Unable to register user."});
});



/* =====================================================
TASK 10 - GET ALL BOOKS (Async/Await)
===================================================== */
public_users.get('/', async (req, res) => {
  try {
    return res.status(200).json(books);

  } catch (err) {
    return res.status(500).json({
      message: "Error fetching books"
    });
  }
});


/* =====================================================
TASK 11 - GET BOOK BY ISBN (Promise + Axios)
===================================================== */
public_users.get('/isbn/:isbn', (req, res) => {

  const isbn = req.params.isbn;

  // axios used only as required (no self-loop logic)
  axios.get('http://localhost:5001/')
    .then(response => {

      const book = response.data[isbn];

      if (!book) {
        return res.status(404).json({
          message: "Book not found"
        });
      }

      return res.status(200).json(book);

    })
    .catch(() => {
      return res.status(500).json({
        message: "Error retrieving book by ISBN"
      });
    });
});


/* =====================================================
TASK 12 - GET BOOKS BY AUTHOR (Async/Await + Axios)
===================================================== */
public_users.get('/author/:author', async (req, res) => {

  try {
    const author = req.params.author.toLowerCase();

    const response = await axios.get('http://localhost:5001/');
    const allBooks = response.data;

    const result = Object.values(allBooks).filter(
      book => book.author.toLowerCase() === author
    );

    if (result.length === 0) {
      return res.status(404).json({
        message: "No books found for this author"
      });
    }

    return res.status(200).json(result);

  } catch (err) {
    return res.status(500).json({
      message: "Error retrieving books by author"
    });
  }
});


/* =====================================================
TASK 13 - GET BOOKS BY TITLE (Promise + Axios)
===================================================== */
public_users.get('/title/:title', async (req, res) => {

  const title = req.params.title.toLowerCase();

  axios.get('http://localhost:5001/')
    .then(response => {

      const result = Object.values(response.data).filter(
        book => book.title.toLowerCase() === title
      );

      if (result.length === 0) {
        return res.status(404).json({
          message: "No books found for this title"
        });
      }

      return res.status(200).json(result);

    })
    .catch(() => {
      return res.status(500).json({
        message: "Error retrieving books by title"
      });
    });
});



//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbnParams = req.params.isbn;
  const foundBook = books[isbnParams];
  
    // no reviews OR empty object
  if (!foundBook.reviews || Object.keys(foundBook.reviews).length === 0) {
    return res.status(200).json({ message: "there is no submitted review for this book" });
  }
  
  if(foundBook) {
    return res.status(200).json(foundBook.reviews);
  }else{
    return res.status(404).json({message: "Book not found"}); 
  }

});


/* =====================================================
EXPORT
===================================================== */
module.exports.general = public_users;