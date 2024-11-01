const express = require('express')
const to_Do_ListController  = require('../../controlllers/to_Do_ListController')
const router = express.Router()

router
.post('/', to_Do_ListController.handleAddTask)
.get('/', to_Do_ListController.getTasks)
.put('/', to_Do_ListController.handlecompletedTask)
.delete('/', to_Do_ListController.handleDeleteTask)

module.exports = router