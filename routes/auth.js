const express = require('express')
const authController = require('../controlllers/authController')
const router = express.Router()

router
.post('/', authController.handleLogin)
.get('/', authController.handleGetUser)
.delete('/', authController.handleDeleteAccount)
.put('/', authController.updateUser)

module.exports = router