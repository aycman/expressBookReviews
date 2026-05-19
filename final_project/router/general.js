const express = require('express');
const axios = require('axios');

const books = require('./booksdb.js');
const public_users = express.Router();

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
public_users.get('/title/:title', (req, res) => {

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


/* =====================================================
EXPORT
===================================================== */
module.exports.general = public_users;