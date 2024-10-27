const User = require('../models/User');

// Get user details 
const handleGetUser = async(req, res) => {
    const cookies = req.cookies
    if (!cookies || !cookies.jwt) return res.status(204).json({ message: 'Cookies not found'})
    const refreshToken = cookies.jwt

    // Is refreshToken in db?
    const foundUser = await User.findOne({
        refreshToken
    })
    .exec().select('-_id -password -refreshToken')
    if(!foundUser) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None' })
        return res.status(204).json({ message: 'User not found'})
    }

    return res.status(200).json({ foundUser })
}

module.exports = { handleGetUser }