const bcrypt = require('bcrypt')
const User = require('../models/User')


const handleNewUser = async (req, res) => {
    const { username, password, email} = req.body;
    if(!username?.trim() || !password?.trim() || !email?.trim()) return res.status(400).json( { 'message' : 'Username password and email are required.'} )
    
    
    //check for duplicate usernames in the db
    const [duplicateUsername, duplicateEmail] = await Promise.all([
        User.findOne({ username: username }).exec(),
        User.findOne({ email: email }).exec()
    ]);
    if(duplicateUsername || duplicateEmail) return res.send(409).json({ 'message' : 'Username or email is already in use'}) // conflict

    try {
        // Encrypt the password
        const hashedPwd = await bcrypt.hash(password, 10)
        
        // Create and store the new user
        const result = await User.create({
            "username": username,
            "password": hashedPwd,
            "email": email
        })

        console.log(result)

        res.status(201).json({ 'success': `New user ${username} created!` });
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

module.exports = { handleNewUser }