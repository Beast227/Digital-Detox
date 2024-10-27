const Tracker = require('../models/Tracker')
const User = require('../models/User')

const handleProgressTrackerDetails = async (req, res) => {
    try {
        const cookies = req.cookies;
        // Check if the user is logged in
        if (!cookies) return res.status(400).json({ message: 'Please login first' });

        const { weeklyUsage, limitedUsage } = req.body;
        // Validate if weeklyUsage is sent in the request body
        if (!weeklyUsage) return res.status(400).json({ message: 'No data sent' });

        // Validate user details by checking the refresh token in cookies
        const refreshToken = cookies.jwt;
        const foundUser = await User.findOne({ refreshToken: refreshToken });
        if (!foundUser) return res.status(400).json({ message: 'Invalid RefreshToken' });

        // Check if a Tracker already exists for the user
        let existingTracker = await Tracker.findOne({ user: foundUser._id }).exec()

        if (existingTracker) {
            // If tracker exists, append new data to the existing arrays
            existingTracker.weeklyUsage = [...existingTracker.weeklyUsage, weeklyUsage]
        } else {
            //Check weather the limitedUsage is sent or not
            if(!limitedUsage) return res.status(400).json({ message: 'limitedUsage object not sent' })
            // If no tracker exists, create a new one
            existingTracker = new Tracker({
                user: foundUser._id, // Link to the User ID
                weeklyUsage: weeklyUsage,
                limitedUsage: limitedUsage
            });
        }

        // Save or update the Tracker in the database
        const result = await existingTracker.save();
        console.log(result);

        // Respond to the client
        return res.status(200).json({ Success: 'Tracker details are saved' });

    } catch (error) {
        console.error('Error saving Tracker:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getTrackerDetails = async(req, res) => {
    try {
        const cookies = req.cookies;
        // Check if the user is logged in
        if (!cookies) return res.status(400).json({ message: 'Please login first' });

        // Validate user details by checking the refresh token in cookies
        const refreshToken = cookies.jwt;
        const foundUser = await User.findOne({ refreshToken: refreshToken });
        if (!foundUser) return res.status(400).json({ message : 'Invalid RefreshToken' });

        // Check if a Tracker already exists for the user
        const existingTracker = await Tracker.findOne({ user: foundUser._id }).exec()
        if(!existingTracker) return res.status(400).json({ message :  'Tracker details not found'})

        // Respond to the client
        return res.status(200).json({ Success: 'Tracker details are sent', existingTracker });

    } catch (error) {
        console.error('Error getting Tracker:', error);
        res.status(500).json({ 'message': 'Server error' });
    }
}

const updateLimitedUsage = async (req, res) => {
    try {
        const cookies = req.cookies;
        // Check if the user is logged in
        if (!cookies) return res.status(400).json({ message: 'Please login first' });

        // Validate user details by checking the refresh token in cookies
        const refreshToken = cookies.jwt;
        const foundUser = await User.findOne({ refreshToken: refreshToken });
        if (!foundUser) return res.status(400).json({ message: 'Invalid RefreshToken' });

        const { limitedUsage } = req.body
        if(!limitedUsage) return res.status(400).json({ message : 'limitedUsage object not sent' })

        // Check if a Tracker already exists for the user
        const existingTracker = await Tracker.findOne({ user: foundUser._id });
        if(!existingTracker) return res.status(400).json({ message :  'Tracker details not found'})

        existingTracker.limitedUsage = limitedUsage
        const result = await existingTracker.save()
        console.log(result)

        return res.status(201).json({ Success: 'Tracker details are updated' })

    } catch (error) {
        console.error('Error getting Tracker:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { handleProgressTrackerDetails, getTrackerDetails, updateLimitedUsage };