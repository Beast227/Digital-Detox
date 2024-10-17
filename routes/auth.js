const express = require('express')
const authController = require('../controlllers/authController')
const getUserDetailsController  = require('../controlllers/getUserDetailsController')
const router = express.Router()

router
.post('/', authController.handleLogin)
.get('/', getUserDetailsController.handleGetUser)

module.exports = router