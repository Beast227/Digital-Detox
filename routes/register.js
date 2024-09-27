const express = require('express')
const reisterController = require('../controlllers/reisterController')
const router = express.Router()

router
.post('/', reisterController.handleNewUser)

module.exports = router