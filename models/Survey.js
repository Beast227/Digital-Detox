const mongoose  = require("mongoose")
const Schema = mongoose.Schema

const surveySchema = new Schema ({
    responses: [{
        question: { type: String, required: true },
        answer: { type: String, required: true }
    }],
    user: {
        type: Schema.Types.ObjectId,
        required: true
    }
})

module.exports = mongoose.model('Survey', surveySchema)