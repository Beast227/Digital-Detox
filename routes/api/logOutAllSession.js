const express = require('express')
const logOutAllSessionsControllers  = require('../../controlllers/logOutAllSessionsControllers')
const router = express.Router()

router
.get('/', logOutAllSessionsControllers.handleLogoutForAllSessions)

module.exports = router