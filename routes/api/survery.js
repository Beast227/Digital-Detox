const express = require('express')
const surveyController = require('../../controlllers/surveyController')
const router = express.Router()

router
.post('/', surveyController.handleSurveyDetails)
.get('/', surveyController.getSurveyDetails)
.put('/', surveyController.updateSurvey)
.post('/feedback', surveyController.storeFeedback)

module.exports = router