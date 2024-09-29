const User = require("../models/User");

const handleLogoutForAllSessions = async (req, res) => {
    // On client, also delete the accessToken

    const cookies = req.cookies
    if (!cookies || !cookies.jwt) return res.sendStatus(204)
    const refreshToken = cookies.jwt

    // Is refreshToken in db?
    const foundUser = await User.findOne({ 
        refreshToken : refreshToken
    })
    .exec()
    if(!foundUser) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true})
        return res.sendStatus(204)
    }

    // Delete refreshToken in db
    foundUser.refreshToken = [];
    const result = await foundUser.save()
    console.log(result)

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true})
    res.sendStatus(204)
}

module.exports = { handleLogoutForAllSessions }