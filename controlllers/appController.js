const jwt = require('jsonwebtoken');
const User = require("../models/User")
const bcrypt = require('bcrypt');

const handleLogin = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate input
        if ((!username && !email) || !password) {
            return res.status(400).json({ message: "Username and password are required." });
        }

        // Find user by either username or email
        const foundUser = await User.findOne({
            $or: [{ username }, { email }]
        }).exec();

        if (!foundUser) return res.status(401).json({ message: "Username not found" }); // Unauthorized

        // Compare provided password with stored hashed password
        const match = await bcrypt.compare(password, foundUser.password);

        if (!match) return res.status(401).json({ message: "Password incorrect. Try again " }); // Unauthorized

        // Create a new Refresh Token
        const RefreshToken = jwt.sign(
            {
                "username": foundUser.username,
                "id": foundUser._id
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '30d' } // Refresh token expiry
        );

        // Set the new refresh token in the client-side cookie
        res.cookie('jwt', RefreshToken, {
            httpOnly: true,
            sameSite: 'None', // Set 'Secure' and 'SameSite' options properly in production 
            secure: true,// For production, ensure HTTPS
            maxAge: 24 * 60 * 60 * 1000 // Cookie expires in 1 day
        });

        // Send the access token to the client
        return res.json({ RefreshToken });
    } catch (error) {
        console.error('Error getting survey details: ', error)
        return res.status(500).json({ message: 'server error' })
    }
};

const handleGetUser = async (req, res) => {
    try {
        const cookies = req.cookies
        if (!cookies || !cookies.jwt) return res.status(204).json({ message: 'Cookies not found' })
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
        const foundUser = await User.findOne({
            _id
        }).exec()
        if (!foundUser) {
            res.clearCookie('jwt', { httpOnly: true, sameSite: 'None' })
            return res.status(401).json({ message: 'User not found' })
        }

        return res.status(200).json({ foundUser })
    } catch (error) {
        console.error('Error getting survey details: ', error)
        return res.status(500).json({ message: 'server error' })
    }
}



module.exports = { handleLogin, handleGetUser }