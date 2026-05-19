const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const session = require('express-session')

let users = [];


// Check if a user with the given username already exists
const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  //filter the users array and check if there is user with the same username
  let userswithsamename = users.filter((user) => { 
    return user.username === username; });

  //return true if any user with the same name is found, otherwise false
  if(userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
}






// Check if the user with the given username and password exists
const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
      return (user.username === username && user.password === password);
    });
    //return true if any valid user is found, otherwise false
    if(validusers.length > 0) {
      return true;
    } else {
      return false;
    }
};


//only registered users can login
//jwt token generation and authentication and session management
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  //check if username and password are provided
  if(!username || !password) {
    return res.status(404).json({message: "username or password missing"});
  }
  //validate user
  if(authenticatedUser(username, password)) {
      
    //create JWT token with username as payload
    let accessToken = jwt.sign(
      {
        data: username
      },
      "access",
      {
        expiresIn: 60 * 60
      }
    );

    //save token in session 
    req.session.authorization = {
      accessToken
    };

    return res.status(200).json({
      message: "Customer successfully logged in",
      token: accessToken
    });
  }
  return res.status(208).json({
    message: "Invalid Login. Check username and password"
  });

});









// Add a book review and update the book review
regd_users.put("/auth/review/:isbn", (req, res) => {

  //get ISBN from request paramenters
  const isbn = req.params.isbn;

  //get review text from requested body
  const review = req.body.review;

  //get username from session - get logged-in username from JWT payload
  //req.user is added in index.js after token verification in the auth middleware
  const username = req.user.data;

  //find book directly using object key
  const book = books[isbn];

  //check if book exists
  if(!book) {
    return res.status(404).json({message: "Book not found"});
  }

  //if reviews object does not exist, create it
  if (!book.reviews)
{
  book.reviews = {};
}
 /*
    Add or update review

    reviews object structure:

    reviews: {
      "john": "Great book",
      "mike": "Amazing story"
    }

    If the same username already exists,
    its review will be overwritten (updated).
  */
  book.reviews[username] = review; //*** here book is a reference to the book object in the books database, so we are directly updating the reviews object of that book

  //success response
  return res.status(200).json({message: "Review successfully added/updated",
    reviews: book.reviews
  });
 });




//delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  /*
    filter & delete the review based on the session username
    so that only the user who posted the review can delete it and also not other's reviews
  */

    //get ISBN from requested parameters
    const isbn = req.params.isbn;

    //get username from session - get logged-in username from JWT payload
    //req.user is added in index.js after token verification in the auth middleware
    const username = req.user.data;

    //find book directly
    const book = books[isbn];

    //check if book exists
    if(!book) {
      return res.status(404).json({message: "Book not found"});
    }

    //check if review exists
    if(book.reviews && book.reviews[username]) {
        delete book.reviews[username]; //delete the review by deleting the username key from the reviews object
        return res.status(200).json({message: "Review successfully deleted"});
    }else{
      return res.status(404).json({message: "Review not found for this user"});
    };
});





module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
