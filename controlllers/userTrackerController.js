const jwt = require('jsonwebtoken');
const UserActivity = require('../models/UserActivity');

const handleUserStatsDetails = async (req, res) => {
    try {
        const cookies = req.cookies
        // Check if the user is logged in
        if (!cookies) return res.status(400).json({ message: 'Please login first' })
        const refreshToken = cookies.jwt

        const { entries, date } = req.body
        // Validate if weeklyUsage is sent in the request body
        if (!entries || !date) return res.status(400).json({ message: 'No data sent' })

        let _id
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                if (err) return res.status(403).json({ message: 'Invalid refresh token' })
                _id = decoded.id
            }
        )

        // Check if a Tracker already exists for the user
        const exsistingDate = await UserActivity.findOne({ 
            user: _id,
            date
        }).exec()

        if (exsistingDate) {
            // If tracker exists, append new data to the existing arrays
            return res.status(400).json({ message: "Already stored the information for this date" })
        }

        await UserActivity.create({
            user: _id,
            entries,
            date
        })

        // Respond to the client
        return res.status(200).json({ Success: 'Usage activity details are saved' });

    } catch (error) {
        console.error('Error saving Usage activity details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getUserStatsDetails = async (req, res) => {
    try {
        const cookies = req.cookies;
        // Check if the user is logged in
        if (!cookies) return res.status(400).json({ message: 'Please login first' });

        // Validate user details by checking the refresh token in cookies
        const refreshToken = cookies.jwt;
        let _id
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                if (err) return res.status(403).json({ message: 'Invalid refresh token' })
                _id = decoded.id
            }
        )

        // Check if a Tracker already exists for the user
        const foundStats = await UserActivity.find({ user: _id }).exec()
        if (!foundStats) return res.status(400).json({ message: 'Tracker details not found' })

        // Respond to the client
        return res.status(200).json({ Success: 'Tracker details are sent', data: foundStats });

    } catch (error) {
        console.error('Error getting Tracker:', error);
        res.status(500).json({ 'message': 'Server error' });
    }
}

const updateUsageStats = async (req, res) => {
    try {
        const cookies = req.cookies;
        // Check if the user is logged in
        if (!cookies) return res.status(400).json({ message: 'Please login first' });

        // Validate user details by checking the refresh token in cookies
        const refreshToken = cookies.jwt;
        let _id
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                if (err) return res.status(403).json({ message: 'Invalid refresh token' })
                _id = decoded.id
            }
        )

        const { date, entries } = req.body
        if (!entries || !date) return res.status(400).json({ message: 'limitedUsage object not sent to update' })

        // Check if a Tracker already exists for the user
        const foundStats = await UserActivity.findOne({ 
            $and: { user: _id, date}
        }).exec();
        if (!foundStats) return res.status(400).json({ message: 'Tracker details not found' })

        foundStats.entries = entries
        const result = await existingTracker.save()
        console.log(result)

        return res.status(201).json({ Success: 'Tracker details are updated' })

    } catch (error) {
        console.error('Error getting Tracker:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// Function to find user activities within a date range
const getUserActivitiesBetweenDates = async (req, res) => {
    try {
        // Extract date range and user from the request query
        const { startDate, endDate } = req.query;

        const cookies = req.cookies;
        // Check if the user is logged in
        if (!cookies) return res.status(400).json({ message: 'Please login first' });

        // Validate user details by checking the refresh token in cookies
        const refreshToken = cookies.jwt;
        let _id
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                if (err) return res.status(403).json({ message: 'Invalid refresh token' })
                _id = decoded.id
            }
        )

        // Validate dates
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date, end date, and user ID are required' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        // Query the database for user activities within the range
        const activities = await UserActivity.find({
            user: _id,
            date: { $gte: start, $lte: end }
        });

        // Return activities to the client
        return res.status(200).json({ activities });
    } catch (error) {
        console.error('Error fetching user activities:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { handleUserStatsDetails, getUserStatsDetails, updateUsageStats, getUserActivitiesBetweenDates };