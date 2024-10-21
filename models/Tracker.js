const mongoose = require('mongoose')
const Schema = mongoose.Schema

const appUsageObjects = new Schema({
    name: {
        type: String,
        required: true
    },
    usage: {
        type: String,
        required: true
    }
})

const trackerSchema = new Schema({
    weeklyUsage: {
        type: [Number],
        required: true
    },
    appUsage: [appUsageObjects],
    user: {
        type: Schema.Types.ObjectId,
        required: true
    }
})

module.exports = mongoose.model('Tracker', trackerSchema)