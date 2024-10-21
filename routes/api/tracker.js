const express = require('express')
const progressTrackerController = require('../../controlllers/progressTrackerController')
const router = express.Router()

router
.post('/', progressTrackerController.handleProgressTrackerDetails)

module.exports = router