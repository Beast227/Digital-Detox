const express = require('express')
const userTrackerController = require('../../controlllers/userTrackerController')
const surveyController = require('../../controlllers/surveyController')
const router = express.Router()

router
.post('/', userTrackerController.handleUserStatsDetails)
.get('/', userTrackerController.getUserStatsDetails)
.put('/', userTrackerController.updateUsageStats)
.get('/limit', surveyController.getLimitedUsage)
.put('/limit', surveyController.updateLimitedUsage)

module.exports = router