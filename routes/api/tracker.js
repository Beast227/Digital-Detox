const express = require('express')
const progressTrackerController = require('../../controlllers/progressTrackerController')
const router = express.Router()

router
.post('/', progressTrackerController.handleProgressTrackerDetails)
.get('/', progressTrackerController.getTrackerDetails)

module.exports = router