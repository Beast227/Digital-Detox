const express = require('express')
const surveyController = require('../../controlllers/surveyController')
const router = express.Router()

router
.post('/', surveyController.updateSurvey)

module.exports = router