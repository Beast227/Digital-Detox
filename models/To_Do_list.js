const mongoose = require('mongoose')
const Schema  = mongoose.Schema

const toDoSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required : true,
        index: true
    },
    task_name: {
        type: String,
        required: true,
        index: true
    },
    task_limit: {
        type: Number,
        required: true
    },
    priority: {
        type: Boolean,
        default: 0
    },
    status: {
        type: Boolean,
        default: 0
    },
    notification_sent: {
        type: Boolean,
        default: 0
    }
})

module.exports = mongoose.model('To_Do_list', toDoSchema)