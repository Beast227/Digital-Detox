const express = require('express')
const { handleLogout } = require('../controlllers/logOutController')
const router = express.Router()

router
.get('/', handleLogout)

module.exports = router