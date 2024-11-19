const mongoose = require('mongoose');

// Define the schema for individual entries
const entrySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  timeSpent: {
    type: Number, // Time spent in minutes
    required: true,
  },
  sessions: {
    type: Number, // Number of sessions
    required: true,
  },
});

// Define the schema for the main document
const userActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  entries: {
    type: entrySchema, // Array of entries
    required: true,
  },
});

// Create the model
const UserActivity = mongoose.model('UserActivity', userActivitySchema);

module.exports = UserActivity;