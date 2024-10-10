const jwt = require('jsonwebtoken')
const User = require('../models/User')

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies
    if(!cookies?.jwt) return res.status(401).json({message: "Cookies are not found"}) // No content
    const refreshToken = cookies.jwt
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })

    const foundUser = await User.findOne({ refreshToken : refreshToken }).exec()

    // Detected refresh token resue!
    if(!foundUser) {
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
                if(err)  return res.sendStatus(403)
                console.log('Attempted refresh token reuse!')
                const hackedUser = await User.findOne({ username: decoded.username }).exec()
                hackedUser.refreshToken = []
                const result = await hackedUser.save()
                console.log(result)
            }
        )
        return res.sendStatus(403) // forbidden
    }

    const newRefreshTokenArray = foundUser.refreshToken.filter(rt => rt.trim() !== refreshToken)
    
    // evaluate jwt
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if(err) {
                console.log('Expired refresh token')
                foundUser.refreshToken = newRefreshTokenArray
                const result = await foundUser.save()
                console.log(result)
            }
            if(err || foundUser.username !== decoded.username) return res.sendStatus(403)

            // Refresh token was still valid
            const accessToken = jwt.sign(
                {
                    "UserInfo" : {
                        "username" : decoded.username
                    }
                    
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn : '60s'}
            )

            const newRefreshToken = jwt.sign(
                { "username" : foundUser.username },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn : '7d' }
            )
    
            // Saving rereshToken with current user
            foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken]
            const result = await foundUser.save()
            console.log(result)

            
            // Create secure cookie with refresh token
            res.cookie('jwt', newRefreshToken, { httpOnly: true, sameSite: 'None', maxAge: 7 * 24 * 60 * 60 * 1000, secure: true }) // secure: true should be used in production


            res.json({ accessToken })
        }
    ) 
}

module.exports = { handleRefreshToken }