const express = require('express')
const authController = require('../controlllers/authController')
const router = express.Router()

router
.post('/', authController.handleLogin)

module.exports = router