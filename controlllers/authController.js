const jwt = require('jsonwebtoken');
const User = require('../models/User');
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

    if (!foundUser) return res.sendStatus(401); // Unauthorized

    // Compare provided password with stored hashed password
    const match = await bcrypt.compare(password, foundUser.password);

    if (!match) return res.sendStatus(401); // Unauthorized

    // Create Access Token
    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": foundUser.username
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '60s' } // Access token expiry
    );

    // Create a new Refresh Token
    const newRefreshToken = jwt.sign(
        { "username": foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' } // Refresh token expiry
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
        sameSite: 'None', // Set 'Secure' and 'SameSite' options properly in production // For production, ensure HTTPS
        maxAge: 24 * 60 * 60 * 1000 // Cookie expires in 1 day
    });

    // Send the access token to the client
    res.json({ accessToken });
};

module.exports = { handleLogin };