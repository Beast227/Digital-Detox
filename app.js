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
app.use('/refresh', require('./routes/refresh'))
app.use('/logout', require('./routes/logout'))

// verification with jwt
app.use(verifyJWT)

// Checking the connection is connected or not with the database
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`))
})