const express = require('express')
const userTrackerController = require('../../controlllers/userTrackerController')
const router = express.Router()

router
.post('/', userTrackerController.handleUserStatsDetails)
.get('/', userTrackerController.getUserStatsDetails)
.put('/', userTrackerController.updateUsageStats)

module.exports = router