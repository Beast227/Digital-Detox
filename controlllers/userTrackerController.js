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
        let exsistingDate = await UserActivity.findOne({ 
            $and: { user: _id, date}
        }).exec()

        if (exsistingDate) {
            // If tracker exists, append new data to the existing arrays
            return res.status(400).json({ message: "Already stored the information for this date" })
        }

        await UserActivity.create({
            user: _id,
            entries,
            date
        }).exec()

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
        const foundStats = await UserActivity.findOne({ user: _id }).exec()
        if (!foundStats) return res.status(400).json({ message: 'Tracker details not found' })

        // Respond to the client
        return res.status(200).json({ Success: 'Tracker details are sent', entries : foundStats.entries, date : foundStats.date });

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

module.exports = { handleUserStatsDetails, getUserStatsDetails, updateUsageStats};