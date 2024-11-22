const User = require("../models/User");
const bcrypt = require("bcrypt");

const handleForgotPassword = async (req, res) => {
    const { username, email, newPassword } = req.body;

    // Validate the incoming request body
    if (!newPassword || !email || !username) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        // Encrypt the new password
        const hashedPwd = await bcrypt.hash(newPassword, 10);

        // Find the user by username and email, and update the password
        const updatedUser = await User.findOneAndUpdate(
            { username: username, email: email }, // Match the user by username and email
            { $set: { password: hashedPwd } },   // Update the password field
            { new: true }                        // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        console.log("Updated User:", updatedUser);

        res.status(200).json({ success: "Password has been changed." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "An error occurred. Please try again later." });
    }
};

module.exports = { handleForgotPassword };