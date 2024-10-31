const To_Do_list = require("../models/To_Do_list")
const User = require("../models/User")


const handleAddTask = async (req, res) => {

    try {
        const cookies = req.cookies
        // Checking weather user is logged in or not
        if(!cookies || !cookies.jwt) return res.status(400).json({ message : 'Please login first '})
    
        const { task_name, task_limit, priority } = req.body
        // Checking whether the data is sent or not
        if(!task_name || !task_limit) return res.status(400).json({ message : 'Data not sent' })
        
        // Validate user details
        const refreshToken = cookies.jwt
        const foundUser = await User.findOne({
            refreshToken: refreshToken
        })
        if(!foundUser) return res.status(400).json({ message: 'Invalid RefreshToken' })

        // If task name is repeated
        const foundTask = await To_Do_list.findOne({
            task_name,
            user: foundUser._id
        })
        if(foundTask) return res.status(400).json({ message: 'Repeated tasks' })
    
        let result
        if(!priority){
            // Creating new To_Do_list
            result = await To_Do_list.create({
                task_name: task_name,
                task_limit: task_limit,
                user: foundUser._id
            })
        }else {
            // Creating new To_Do_list
            result = await To_Do_list.create({
                task_name,
                task_limit,
                priority,
                user: foundUser._id
            })
        }
        console.log(result)
        
        return res.status(200).json({ Success: 'To do list added' })
    } catch (error) {
        console.error('Error saving survey:', error);
        return res.status(500).json({ message: 'Server error' });
    }

}



const getTasks = async (req, res) => {

    try {
        const cookies = req.cookies
        // Checking weather user is logged in or not
        if(!cookies || !cookies.jwt) return res.status(400).json({ message : 'Please login first '})
    
        // Validate user details
        const refreshToken = cookies.jwt
        const foundUser = await User.findOne({
            refreshToken: refreshToken
        }).exec()
        if(!foundUser) return res.status(400).json({ message: 'Invalid RefreshToken' })
        
        const tasks = await To_Do_list.find({
            user: foundUser._id
        }).exec()
        if(!tasks) return res.status(400).json({ message: 'Tasks not found' })

        return res.status(200).json({ Success: 'Found tasks', tasks })

    } catch (error) {
        console.error('Error saving survey:', error);
        return res.status(500).json({ message: 'Server error' });
    }

}

const handlecompletedTask = async (req, res) => {
    try {
        const cookies = req.cookies
        // Checking weather user is logged in or not
        if(!cookies || !cookies.jwt) return res.status(400).json({ message : 'Please login first '})
    
        const { task_name, status } = req.body
        // Checking whether the data is sent or not
        if(!task_name || !status) return res.status(400).json({ message : 'Data not sent' })
        
        // Validate user details
        const refreshToken = cookies.jwt
        const foundUser = await User.findOne({
            refreshToken: refreshToken
        })
        if(!foundUser) return res.status(400).json({ message: 'Invalid RefreshToken' })

        // Finding the task needed to be updated
        const foundTask = await To_Do_list.findOne({
            $and: [{task_name, user: foundUser._id}]
        })
        if(!foundTask) return res.status(400).json({ message: 'Task not found' })
        
        // update the task
        foundTask.status = status;
        const result = await foundTask.save()
        console.log(result)

        return res.status(200).json({ message: 'Task completed' })

    } catch (error) {
        console.error('Error saving survey:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { handleAddTask, getTasks, handlecompletedTask }