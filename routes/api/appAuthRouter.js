const express = require('express')
const appController = require('../../controlllers/appController')
const router = express.Router()

router
.post('/', appController.handleLogin)
.get('/', appController.handleGetUser)

module.exports = router