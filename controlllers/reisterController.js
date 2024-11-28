const bcrypt = require('bcrypt');
const admin = require("firebase-admin");
const User = require('../models/User');

const handleNewUser = async (req, res) => {
    const { username, password, email } = req.body;

    // Validate input
    if (!username?.trim() || !password?.trim() || !email?.trim()) {
        return res.status(400).json({ 'message': 'Username, password, and email are required.' });
    }

    try {
        // Check for duplicate usernames and emails in MongoDB
        const [duplicateUsername, duplicateEmail] = await Promise.all([
            User.findOne({ username: username }).exec(),
            User.findOne({ email: email }).exec()
        ]);
        if (duplicateUsername) return res.status(409).json({ message: 'Username is already exists' });
        if (duplicateEmail) return res.status(409).json({ message: 'Email is already used' });

        // Encrypt the password
        const hashedPwd = await bcrypt.hash(password, 10);

        // Create Firebase user
        const firebaseUser = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: username
        });

        console.log(`Firebase user created with UID: ${firebaseUser.uid}`);

        // Save user in MongoDB
        const result = await User.create({
            username: username,
            password: hashedPwd,
            email: email,
            firebaseUID: firebaseUser.uid // Storing Firebase UID for reference
        });

        console.log(`MongoDB user created: ${result}`);

        // Respond to the client
        res.status(201).json({ 'success': `New user ${username} created!` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': err.message });
    }
};

module.exports = { handleNewUser };