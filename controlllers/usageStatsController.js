const jwt = require('jsonwebtoken')
const UsageStats = require('../models/UsageStats')

const handleAppUsageData = async (req, res) => {
    try {

        const { date, dailyScreenTime, mostUsedApps } = req.body
        if(!date || !dailyScreenTime || !mostUsedApps) return res.json({ message: "One of the field sent is empty" })
    
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
        const foundUser = await User.findOne({
            _id
        }).exec()
        if (!foundUser) {
            res.clearCookie('jwt', { httpOnly: true, sameSite: 'None' })
            return res.status(401).json({ message: 'User not found' })
        }

        // Creating usageStats 
        const usageStats = await UsageStats.create({
            date,
            dailyScreenTime,
            mostUsedApps,
            userId: _id
        })
        console.log(usageStats)

        return res.status(200).json({
            message: 'Usage data saved successfully',
        })

    } catch (error) {
        console.error('Error getting survey details: ', error)
        return res.status(500).json({ message : 'server error'})
    }

}

const getAppUsageDetails = async (req, res) => {
    try {
        
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
        const foundUser = await User.findOne({
            _id
        }).exec()
        if (!foundUser) {
            res.clearCookie('jwt', { httpOnly: true, sameSite: 'None' })
            return res.status(401).json({ message: 'User not found' })
        }

        const foundUsageStats = await UsageStats.find({
            userId: foundUser._id
        })

        return res.status(200).json({
            foundUsageStats
        })

    } catch (error) {
        console.error('Error getting survey details: ', error)
        return res.status(500).json({ message : 'server error'})
    }
}

module.exports = { handleAppUsageData, getAppUsageDetails }