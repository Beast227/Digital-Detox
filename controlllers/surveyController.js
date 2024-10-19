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

        // // Only one survey answers for one user
        // const foundSurvey = await Survey.findOne({ user: foundUser._id })
        // if(foundSurvey){
        //     return res.status(401).json({ 'message': 'You have already answered this survey'})
        // }
    
        // Create new Survey
        const newSurvey = new Survey({
            user: foundUser._id, // Link to the User ID
            responses: responses
        })
    
        // Save Survey to database
        const result = await newSurvey.save()
        console.log(result)
    
        // Response to the client
        res.status(200).json({ 'Success' : 'Survey detais are saved'})
    
    } catch (error) {
        console.error('Error saving survey:', error);
        res.status(500).json({ 'message': 'Server error' });
    }
}

const getSurveyDetails = async (req, res) => {
    try {

        const cookies = req.cookies
        // Checking weather user is logged in or not
        if(!cookies?.jwt) return res.status(401).json({'message': 'Cookies are not found'})

        // Validate user details
        const refreshToken = cookies.jwt
        const foundUser = await User.findOne({
            refreshToken: refreshToken
        })
        if(!foundUser) return res.status(400).json({ 'message': 'Invalid RefreshToken' })

        // Validate survey details
        const foundSurvey = await Survey.find({
            user: foundUser._id
        })
        if(!foundSurvey) return res.status(400).json({ 'message': 'Survey is not available for this user' })

        // Send the survey answers to the client
        return res.status(200).json({ foundSurvey })

    } catch(err) {
        console.error('Error getting survey details: ', err)
        return res.status(500).json({ 'message' : 'server error'})
    }
}



// Function to update survey details of the user
const updateSurvey = async (req, res) => {
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

        // Only one survey answers for one user
        const foundSurvey = await Survey.findOne({ user: foundUser._id })
        if(!foundSurvey){
            return res.status(401).json({ 'message': 'Your survey answer is not saved'})
        }
    
        // Update survey
        foundSurvey.responses = responses.map(response => ({
                answer: response.answer.trim()
        }))
    
        // Save Survey to database
        const result = await foundSurvey.save()
        console.log(result)
    
        // Response to the client
        res.status(200).json({ 'Success' : 'Survey detais are saved'})

    } catch (err) {
        console.error('Error getting survey details: ', err)
        res.status(500).json({ 'message' : 'server error'})
    }
}


module.exports = { handleSurveyDetails, getSurveyDetails, updateSurvey }