const Tracker = require('../models/Tracker')
const User = require('../models/User')

const handleProgressTrackerDetails = async (req, res) => {
    try {
        const cookies = req.cookies;
        // Check if the user is logged in
        if (!cookies) return res.status(400).json({ 'message': 'Please login first' });

        const { trackingInfo } = req.body;
        // Validate if trackingInfo is sent in the request body
        if (!trackingInfo) return res.status(400).json({ 'message': 'No data sent' });

        // Validate user details by checking the refresh token in cookies
        const refreshToken = cookies.jwt;
        const foundUser = await User.findOne({ refreshToken: refreshToken });
        if (!foundUser) return res.status(400).json({ 'message': 'Invalid RefreshToken' });

        // Check if a Tracker already exists for the user
        let existingTracker = await Tracker.findOne({ user: foundUser._id });

        if (existingTracker) {
            // If tracker exists, append new data to the existing arrays
            existingTracker.weeklyUsage = [...existingTracker.weeklyUsage, ...trackingInfo.weeklyUsage];
        } else {
            // If no tracker exists, create a new one
            existingTracker = new Tracker({
                user: foundUser._id, // Link to the User ID
                weeklyUsage: trackingInfo.weeklyUsage,
            });
        }

        // Save or update the Tracker in the database
        const result = await existingTracker.save();
        console.log(result);

        // Respond to the client
        res.status(200).json({ 'Success': 'Tracker details are saved' });

    } catch (error) {
        console.error('Error saving Tracker:', error);
        res.status(500).json({ 'message': 'Server error' });
    }
};

const getTrackerDetails = async(req, res) => {
    try {
        const cookies = req.cookies;
        // Check if the user is logged in
        if (!cookies) return res.status(400).json({ 'message': 'Please login first' });

        // Validate user details by checking the refresh token in cookies
        const refreshToken = cookies.jwt;
        const foundUser = await User.findOne({ refreshToken: refreshToken });
        if (!foundUser) return res.status(400).json({ 'message': 'Invalid RefreshToken' });

        // Check if a Tracker already exists for the user
        const existingTracker = await Tracker.findOne({ user: foundUser._id });

        // Respond to the client
        res.status(200).json({ 'Success': 'Tracker details are sent', existingTracker });

    } catch (error) {
        console.error('Error getting Tracker:', error);
        res.status(500).json({ 'message': 'Server error' });
    }
}

module.exports = { handleProgressTrackerDetails, getTrackerDetails };