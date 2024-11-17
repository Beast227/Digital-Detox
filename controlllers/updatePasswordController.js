const User = require("../models/User");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const handleForgotPassword = async (req, res) => {
    const { username, email, newPassword } = req.body;
    if( !newPassword?.trim() || !email?.trim() ) return res.status(400).json( { message : 'Email password and email are required.'} )

    try {
        // Encrypt the password
        const hashedPwd = await bcrypt.hash(newPassword, 10)

        // Update the password for the foundUser
        const updatedUser = await User.findOneAndUpdate({
            $and: [email, username],
            $set: { password : hashedPwd }
        })
        if(!updatedUser) return res.status(401).json({ message : 'User not found' })

        console.log(updatedUser)

        res.status(201).json({ success: `Password has been changed` });
    } catch(err) {
        console.error(err)
        res.status(409).json({ message: err.message })
    }
}

module.exports = { handleForgotPassword }