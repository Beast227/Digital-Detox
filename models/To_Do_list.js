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
    time_limit: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: "Pending"
    },
    notification_sent: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('To_Do_list', toDoSchema)