const jwt = require('jsonwebtoken');
const Survey = require("../models/Survey")
const To_Do_list = require("../models/To_Do_list")
const User = require("../models/User")
const Tracker = require("../models/Tracker")
const bcrypt = require('bcrypt');

const handleLogin = async (req, res) => {
    const cookies = req.cookies;
    const { username, email, password } = req.body;

    // Validate input
    if ((!username && !email) || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Find user by either username or email
    const foundUser = await User.findOne({
        $or: [{ username }, { email }]
    }).exec();

    if (!foundUser) return res.status(401).json({ message: "Username not found"}); // Unauthorized

    // Compare provided password with stored hashed password
    const match = await bcrypt.compare(password, foundUser.password);

    if (!match) return res.status(401).json({ message: "Password incorrect. Try again "}); // Unauthorized

    // Create Access Token
    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": foundUser.username,
                "id": foundUser._id
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '60s' } // Access token expiry
    );

    // Create a new Refresh Token
    const newRefreshToken = jwt.sign(
        { 
            "username": foundUser.username,
            "id": foundUser._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d' } // Refresh token expiry
    );

    // Initialize or filter the refresh tokens to exclude the current one (if exists in cookies)
    let newRefreshTokenArray = foundUser.refreshToken || [];

    // If a refresh token exists in cookies, handle reuse detection and clear it
    if (cookies?.jwt) {
        const refreshToken = cookies.jwt;

        // Remove old refresh token from the array (if it's valid and found)
        newRefreshTokenArray = newRefreshTokenArray.filter(rt => rt !== refreshToken);

        // Clear the old token from the client-side cookie
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None' });
    }

    // Add the new refresh token to the user's refresh token list
    newRefreshTokenArray.push(newRefreshToken);

    // Update user's refresh token array
    foundUser.refreshToken = newRefreshTokenArray;

    // Save the updated user with the new refresh token
    const result = await foundUser.save();
    console.log(result)

    // Set the new refresh token in the client-side cookie
    res.cookie('jwt', newRefreshToken, {
        httpOnly: true,
        sameSite: 'None', // Set 'Secure' and 'SameSite' options properly in production 
        secure: true,// For production, ensure HTTPS
        maxAge: 24 * 60 * 60 * 1000 // Cookie expires in 1 day
    });

    // Send the access token to the client
    return res.json({ accessToken });
};


const handleDeleteAccount = async (req, res) => {
    try {
        const cookies = req.cookies
        if (!cookies || !cookies.jwt) return res.status(204).json({ message: 'Cookies not found' })
        const refreshToken = cookies.jwt

        // Is refreshToken in db?
        const foundUser = await User.findOne({
            refreshToken
        })
            .exec()
        if (!foundUser) {
            res.clearCookie('jwt', { httpOnly: true, sameSite: 'None' })
            return res.status(204).json({ message: 'User not found' })
        }

        // Deleting to do list
        await To_Do_list.deleteMany({
            user: foundUser._id
        }).exec()

        // Deleting survey details
        await Survey.deleteOne({
            user: foundUser._id
        }).exec()

        // Deleting tracker details
        await Tracker.deleteOne({
            user: foundUser._id
        }).exec()

        // Deleting the user
        await User.deleteOne({
            _id: foundUser._id
        }).exec()

        return res.status(200).json({ message: 'Account has been successfully deleted' })

    } catch (error) {
        console.error('Error getting survey details: ', err)
        return res.status(500).json({ message : 'server error'})
    }
}


const handleGetUser = async(req, res) => {
    try {
        const cookies = req.cookies
        if (!cookies || !cookies.jwt) return res.status(204).json({ message: 'Cookies not found'})
        const refreshToken = cookies.jwt
    
        // Is refreshToken in db?
        const foundUser = await User.findOne({
            refreshToken
        })
        .exec()
        if(!foundUser) {
            res.clearCookie('jwt', { httpOnly: true, sameSite: 'None' })
            return res.status(204).json({ message: 'User not found'})
        }
    
        return res.status(200).json({ foundUser })
    } catch (error) {
        console.error('Error getting survey details: ', err)
        return res.status(500).json({ message : 'server error'})
    }
}

const updateUser = async (req, res) => {
    try {
        const { username, email } = req.body
        if(!username || !email) return res.status(402).json({ message: "Data not sent to update" })
        
        const cookies = req.cookies
        if (!cookies || !cookies.jwt) return res.status(401).json({ message: 'Cookies not found' })
        const refreshToken = cookies.jwt

        let _id
        jwt.verify(
            refreshToken, 
            process.env.REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                if (err) return res.status(403).json({ message: 'Invalid refresh token'})
                _id = decoded.id
            }
        )
    
        // Is User in db?
        const foundUser = await User.findByIdAndUpdate({
            _id,
            $set: { username, email }
        }).exec()
        if(!foundUser) return res.status(401).json({ message: 'User not found' })

        return res.status(200).json({ message: "User updated successfully" })
        
    } catch (error) {
        console.error('Error getting survey details: ', err)
        return res.status(500).json({ message : 'server error'})
    }
}

module.exports = { handleLogin, handleDeleteAccount, handleGetUser, updateUser }