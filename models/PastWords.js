const mongoose = require('mongoose');

// Define the PastWords schema
const pastWordsSchema = new mongoose.Schema({
  word: { type: String, required: true },
  date: {
    type: Date,
    default: function () {
      const today = new Date();
      return today.toLocaleDateString();
    },
  },
});

// Create model
const pastWord = mongoose.model('pastWord', pastWordsSchema);

module.exports = pastWord;