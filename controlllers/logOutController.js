const User = require("../models/User");

const handleLogout = async (req, res) => {
    // On client, also delete the accessToken

    const cookies = req.cookies
    if (!cookies || !cookies.jwt) return res.status(204).json({ 'message': 'Cookies not found'})
    const refreshToken = cookies.jwt

    // Is refreshToken in db?
    const foundUser = await User.findOne({
        refreshToken
    })
    .exec()
    if(!foundUser) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None' })
        return res.sendStatus(204)
    }

    // Delete refreshToken in db
    foundUser.refreshToken = foundUser.refreshToken.filter(rt => rt !== refreshToken);
    const result = await foundUser.save()
    console.log(result)

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None' })
    res.sendStatus(204)
}

module.exports = { handleLogout }