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


// Get the book list available in the shop
  //using promise callbacks
public_users.get('/', function (req, res) {

    new Promise((resolve, reject) => {
      if(books) {
        resolve(books);
      }else{
        reject("Books not found");
      }
    })
    .then((data) => {
          res.send(JSON.stringify(data,null,4));
    })
    .catch ((err) => {
    res.status(404).json({message: err });
  }); 
});





/* =====================================================
TASK 11 - SEARCH BY ISBN (Async/Await)
===================================================== */
// Get book details based on ISBN
  //send the book details as response
  //using Async.Await + axios
public_users.get('/isbn/:isbn', async function (req, res) {
  try{
      //retrieve the isbn from the request parameter
      const isbn = req.params.isbn;

      /*
      axios request to local endpoint
      retrieves all books data
      */
     const response = await axios.get('http://localhost:5001/');

    //extract books data from response
    const allBooks = response.data;

    //find matching book by ISBN
    const foundBook = allBooks[isbn];

    //check if book exists
    if(foundBook) {
      return res.status(200).json(foundBook);
    }else {
      return res.status(404).json({
        message: "Book not found"
      })
    } 
  } catch (err) {

    // Handle request errors
    return res.status(500).json({
      message: "Error retrieving book details"
    });
  }
});
 


  /* =====================================================
TASK 12 - SEARCH BY AUTHOR (Async/Await)
===================================================== */
// Get book details based on author
//using async await axios
public_users.get('/author/:author',function (req, res) {
  try{
    //1. Obtain all the keys for the 'books' object.
    const bookKeys = Object.keys(books);
    //2. Iterate through the 'books' array & check the author matches the one provided in the request parameters.
    const authorParams = req.params.author;
    const matchingBooks = [];

      bookKeys.forEach((key) => {
    if(books[key].author.toLowerCase() === authorParams.toLowerCase()) {
      matchingBooks.push(books[key]);
    } 
    })
    //3. If a match is found, return the book details as a response.
    if(matchingBooks.length > 0) {
          return res.status(200).json(matchingBooks);
    }else{
          return res.status(404).json({message: "Book not found"});
  }
 } catch (err) {
    //handle request errors
    return res.status(500).json({
      message: "Error retrieving book details"
    });
  }
});


/* =====================================================
TASK 13 - SEARCH BY TITLE (Async/Await)
===================================================== */
// Get all books based on title
//using asyn awail axios
public_users.get('/title/:title',function (req, res) {
  try{
      //1. Obtain all the values for the 'books' object.
    const bookValues = Object.values(books);
    //2. Iterate through the 'books' array & check the title matches the one provided in the request parameters.
    const titleParams = req.params.title;
    
    const matchingBooks = bookValues.filter (book => book.title.toLowerCase() === titleParams.toLowerCase());

    //3. If a match is found, return the book details as a response.
    if (matchingBooks.length > 0) {
        return res.status(200).json(matchingBooks);
    }else{
        return res.status(404).json({message: "Book not found"});
    }
  } catch(err) {
    //handle request errors
    return res.status(500).json({
      message: "Error retrieving book details"
    });
  }
});



//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbnParams = req.params.isbn;
  const foundBook = books[isbnParams];
  
  if(foundBook) {
    return res.status(200).json(foundBook.reviews);
  }else{
    return res.status(404).json({message: "Book not found"}); 
  }

});

module.exports.general = public_users;
