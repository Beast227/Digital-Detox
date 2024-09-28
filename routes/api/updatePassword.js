const express = require('express')
const updatePasswordController = require('../../controlllers/updatePasswordController')
const router = express.Router()

router
.post('/', updatePasswordController.handleForgotPassword)

module.exports = router