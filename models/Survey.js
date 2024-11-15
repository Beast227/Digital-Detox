const mongoose  = require("mongoose")
const Schema = mongoose.Schema

const surveySchema = new Schema ({
    responses: {
        activityPriority: {
            type: String
        },
        challengingTask: {
            type: String
        },
        primaryGoal: {
            type: String
        },
        screenActivity: {
            type: String
        },
        screenTime: {
            type: String
        },
        socialMediaStrategy: {
            type: String
        },
        socialMediaTime: {
            type: String
        },
        whatHelp: {
            type: String
        },
        workScreenTime: {
            type: String
        },
        workTimeBreaks: {
            type: String
        },
    },
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true
    },
    cluster: {
        type: Number,
        default: 0,
    }
})

module.exports = mongoose.model('Survey', surveySchema)