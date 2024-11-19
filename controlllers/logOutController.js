const User = require("../models/User");
const jwt = require('jsonwebtoken')

const handleLogout = async (req, res) => {
    // On client, also delete the accessToken

    const cookies = req.cookies
    if (!cookies || !cookies.jwt) return res.status(204).json({ 'message': 'Cookies not found' })
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
    const foundUser = await User.findOne({
        _id
    }).exec();
    if (!foundUser) return res.status(401).json({ message: 'User not found' });

    return res.status(204).clearCookie('jwt', { 
        httpOnly: true,
        sameSite: 'None', // Set 'Secure' and 'SameSite' options properly in production 
        secure: true })
}

module.exports = { handleLogout }