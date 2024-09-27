const express = require('express')
const refreshTokenController = require('../controlllers/refreshTokenController')
const router = express.Router()

router
.get('/', refreshTokenController.handleRefreshToken)

module.exports = router