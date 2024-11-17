const Survey = require('../models/Survey')
const User = require('../models/User')
const jwt = require('jsonwebtoken')

const handleSurveyDetails = async (req, res) => {
    try {
        const cookies = req.cookies
        // Checking weather user is logged in or not
        if (!cookies) return res.status(400).json({ message: 'Please login first ' })
        const refreshToken = cookies.jwt

        const { responses } = req.body
        // Checking weather qna is present or not
        if (!responses) return res.status(400).json({ message: 'Question and answers are required' })

        let _id
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                if (err) return res.status(403).json({ message: 'Invalid refresh token' })
                _id = decoded.id
            }
        )

        // Only one survey answers for one user
        const foundSurvey = await Survey.findOne({ user: _id })
        if (foundSurvey) {
            return res.status(401).json({ message: 'You have already answered this survey' })
        }

        // Create new Survey
        const newSurvey = new Survey({
            user: foundUser._id, // Link to the User ID
            responses: responses
        })

        // Save Survey to database
        const result = await newSurvey.save()
        console.log(result)

        // Response to the client
        return res.status(200).json({ Success: 'Survey detais are saved' })

    } catch (error) {
        console.error('Error saving survey:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

const getSurveyDetails = async (req, res) => {
    try {

        const cookies = req.cookies
        // Checking weather user is logged in or not
        if (!cookies?.jwt) return res.status(401).json({ message: 'Cookies are not found' })
        const refreshToken = cookies.jwt

        let _id
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                if (err) return res.status(403).json({ message: 'Invalid refresh token' })
                _id = decoded.id
            }
        )
        // Validate survey details
        const foundSurvey = await Survey.findOne({
            user: _id
        }).exec()
        if (!foundSurvey) return res.status(400).json({ message: 'Survey is not available for this user' })

        if (foundSurvey.cluster === -1) {
            const payload = {
                "input": {
                    "screen_time": foundSurvey.responses.screenTime,
                    "main_activity": foundSurvey.responses.screenActivity,
                    "social_media_time": foundSurvey.responses.socialMediaTime,
                    "reduce_social_media": foundSurvey.responses.socialMediaStrategy,
                    "work_screen_time": foundSurvey.responses.workScreenTime,
                    "tech_free_breaks": foundSurvey.responses.workTimeBreaks,
                    "detox_goal": foundSurvey.responses.primaryGoal,
                    "screen_time_challenges": foundSurvey.responses.challengingTask,
                    "detox_support": foundSurvey.responses.whatHelp,
                    "detox_priorities": foundSurvey.responses.activityPriority
                }
            };

            const response = await fetch('https://digital-detox-ml.onrender.com/cluster', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to fetch /cluster: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            foundSurvey.cluster = data.cluster;
            await foundSurvey.save();
        }

        // Send the survey answers to the client
        return res.status(200).json({ foundSurvey })

    } catch (err) {
        console.error('Error getting survey details: ', err)
        return res.status(500).json({ message: 'server error' })
    }
}



// Function to update survey details of the user
const updateSurvey = async (req, res) => {
    try {

        const cookies = req.cookies
        // Checking weather user is logged in or not
        if (!cookies) return res.status(400).json({ message: 'Please login first ' })
        const refreshToken = cookies.jwt

        const { responses } = req.body
        // Checking weather qna is present or not
        if (!responses) return res.status(400).json({ message: 'Question and answers are required' })

        let _id
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                if (err) return res.status(403).json({ message: 'Invalid refresh token' })
                _id = decoded.id
            }
        )

        // Only one survey answers for one user
        const foundSurvey = await Survey.findOne({ user: _id })
        if (!foundSurvey) {
            return res.status(401).json({ message: 'Your survey answer is not saved' })
        }

        // Update survey
        foundSurvey.responses = responses

        // Save Survey to database
        const result = await foundSurvey.save()
        console.log(result)

        // Response to the client
        return res.status(200).json({ Success: 'Survey detais are saved' })

    } catch (err) {
        console.error('Error getting survey details: ', err)
        res.status(500).json({ message: 'server error' })
    }
}


module.exports = { handleSurveyDetails, getSurveyDetails, updateSurvey }