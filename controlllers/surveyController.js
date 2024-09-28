const Survey = require('../models/Survey')
const User = require('../models/User')

const handleSurveyDetails = async (req, res) => {
    try {
        const cookies = req.cookies
        // Checking weather user is logged in or not
        if(!cookies) return res.status(400).json({ 'message' : 'Please login first '})
    
        const { responses } = req.body
        // Checking weather qna is present or not
        if(!responses) return res.status(400).json({ 'message' : 'Question and answers are required'})
    
        // Validate user details
        const refreshToken = cookies.jwt
        const foundUser = await User.findOne({
            refreshToken: refreshToken
        })
        if(!foundUser) return res.status(400).json({ 'message': 'Invalid RefreshToken' })
    
        // Create new Survey
        const newSurvey = new Survey({
            user: foundUser._id, // Link to the User ID
            responses: responses.map(response => ({
                question: response.question.trim(),
                answer: response.answer.trim()
            }))
        })
    
        // Save Survey to database
        const result = await newSurvey.save()
    
        // Response to the client
        res.status(200).json({ 'Success' : 'Survey detais are saved'})
    
    } catch (error) {
        console.error('Error saving survey:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { handleSurveyDetails }