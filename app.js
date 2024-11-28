const express = require('express')
const cors = require('cors')
const corOptions = require('./config/corsOptions')
const mongoose = require('mongoose')
require('dotenv').config()
const connectDB = require('./db/db')
const verifyJWT = require('./middlewares/verifyJWT')
const cookieParser = require('cookie-parser')
const credentials = require('./middlewares/credentials')
const app = express()
const admin = require("firebase-admin");
const serviceAccount = require("./firebase_private_key.json");
const overdueTaskNotifier = require('./routes/jobs/overdueTasksNotifier')


// Connection with firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});


// Connection with Mongodb
connectDB()

// Handle options credentials check - before cors!
// and fetch cookies credentials requirement
app.use(credentials)

// Cross Origin Resource Sharing
app.use(cors(corOptions))

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended : false}))

// built in middleware for json
app.use(express.json())

// middleware for cookies
app.use(cookieParser())

// routes
app.use('/register', require('./routes/register'))
app.use('/auth', require('./routes/auth'))
app.use('/logout', require('./routes/logout'))
app.use('/tracker', require('./routes/api/usageStatsRouter'))
app.use('/survey', require('./routes/api/survery'))
app.use('/updateSurvey', require('./routes/api/updatesurvey'))
app.use('/forgotPassword', require('./routes/api/updatePassword'))
app.use('/logOutAllSessions', require('./routes/api/logOutAllSession'))
app.use('/toDoList', require('./routes/api/toDoList'))
app.use('/appLogin', require('./routes/api/appAuthRouter'))

// verification with jwt
app.use(verifyJWT)

// Protected Routes


// Checking the connection is connected or not with the database
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`))
})

// Start the job
console.log("Starting overdue task notifier...");
overdueTaskNotifier.checkOverdueTasks();