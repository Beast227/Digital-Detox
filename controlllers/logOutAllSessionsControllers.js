const User = require("../models/User");
const jwt = require('jsonwebtoken')

const handleLogoutForAllSessions = async (req, res) => {
    // On client, also delete the accessToken

    const cookies = req.cookies
    if (!cookies || !cookies.jwt) return res.sendStatus(204)
    const refreshToken = cookies.jwt

    let _id
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Invalid refresh token' })
            _id = decoded.id
        }
    )

    // Is User in db?
    const foundUser = await User.findOne(
        _id
    ).exec();
    if (!foundUser) return res.status(401).json({ message: 'User not found' });

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    return res.sendStatus(204)
}

module.exports = { handleLogoutForAllSessions }