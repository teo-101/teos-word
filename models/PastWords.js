const mongoose = require('mongoose');

// Define the PastWords schema
const pastWordsSchema = new mongoose.Schema({
  word: { type: String, required: true },
  date: {
    type: Date,
    default: Date.now // Store the actual date object instead of a formatted string
  },
});

// Create model
const PastWord = mongoose.model('PastWord', pastWordsSchema);

module.exports = PastWord;
