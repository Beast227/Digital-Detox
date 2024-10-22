const mongoose = require('mongoose')
const Schema = mongoose.Schema

const weeklyUsageObjects = new Schema({
    usage: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
})

const trackerSchema = new Schema({
    weeklyUsage: {
        type: [weeklyUsageObjects],
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        required: true
    }
})

module.exports = mongoose.model('Tracker', trackerSchema)