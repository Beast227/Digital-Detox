const express = require('express')
const usageStatsController  = require('../../controlllers/usageStatsController')
const router = express.Router()

router
.post('/', usageStatsController.handleAppUsageData)
.get('/', usageStatsController.getAppUsageDetails)

module.exports = router