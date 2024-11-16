const mongoose = require('mongoose');

const usageSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true 
  },
  date: {
    type: Date, 
    required: true 
  }, // Date of the usage record
  dailyScreenTime: { 
    type: Number, 
    required: true 
  }, // Screen time for the day in seconds
  mostUsedApps: [
    {
      appName: { type: String },
      timeSpent: { type: Number }, // Time spent on the app in seconds
    },
  ],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

// Ensure the schema records are indexed by userId and date for fast querying
usageSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('UsageStats', usageSchema);
