const express = require('express')
const reisterController = require('../controlllers/reisterController')
const updatePasswordController = require('../controlllers/updatePasswordController')
const router = express.Router()

router
.post('/', reisterController.handleNewUser)
.patch('/', updatePasswordController.handleForgotPassword)

module.exports = router