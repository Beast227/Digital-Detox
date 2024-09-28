const jwt = require('jsonwebtoken');
const User = require('../models/User')
const bcrypt = require('bcrypt')

const handleLogin = async (req, res) => {
    const cookies = req.cookies
    const { username, password } = req.body;
    if(!username || !password) return res.sendStatus(400).json( { message : "Username and password are required."})
    
    const foundUser = await User.findOne({
        username: username 
    }).exec()
    
    if(!foundUser) return res.status(401) // Unauthorized

    // evaluate password
    const match = await bcrypt.compare(password, foundUser.password)
    
    if(match)
    {
        // Create JWTs
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username" : foundUser.username
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn : '60s' }
        )

        const newRefreshToken = jwt.sign(
            { "username" : foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn : '1d' }
        )

        let newRefreshTokenArray = 
            !cookies?.jwt
                ? foundUser.refreshToken ?? []
                : foundUser.refreshToken.filter(rt => rt !== cookies.jwt)
            
        if(cookies?.jwt) {

            const refreshToken = cookies.jwt
            const foundToken = await User.findOne({ refreshToken }).exec()

            //Detected refresh token reuse ?
            if(!foundToken) {
                console.log("Attempted refresh token reuse at login!")
                // Clear out all previous refresh tokens
                newRefreshTokenArray = []
            }

            res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
        }

        // Saving rereshToken with current user
        foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken]
        const result = await foundUser.save()
        console.log(result)

        // Create secure cookie with refresh token
        res.cookie('jwt', newRefreshToken, { httpOnly: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 }) // secure: true should be used in production

        // Send access token to user
        res.json({ accessToken })
    } else {
        res.sendStatus(401)
    }
}

module.exports = { handleLogin }