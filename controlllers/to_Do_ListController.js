const To_Do_list = require("../models/To_Do_list")
const jwt = require('jsonwebtoken')

const handleAddTask = async (req, res) => {

    try {
        const cookies = req.cookies
        // Checking weather user is logged in or not
        if (!cookies || !cookies.jwt) return res.status(400).json({ message: 'Please login first ' })
        const refreshToken = cookies.jwt

        const { task_name, due_date, priority } = req.body
        // Checking whether the data is sent or not
        if (!task_name || !due_date) return res.status(400).json({ message: 'Data not sent' })

        let _id
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                if (err) return res.status(403).json({ message: 'Invalid refresh token' })
                _id = decoded.id
            }
        )

        // If task name is repeated
        const foundTask = await To_Do_list.findOne({
            task_name,
            user: _id
        })
        if (foundTask) return res.status(400).json({ message: 'Repeated tasks' })

        let result
        if (!priority) {
            // Creating new To_Do_list
            result = await To_Do_list.create({
                task_name: task_name,
                due_date: due_date,
                user: _id
            })
        } else {
            // Creating new To_Do_list
            result = await To_Do_list.create({
                task_name,
                due_date,
                priority,
                user: _id
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
        if (!cookies || !cookies.jwt) return res.status(400).json({ message: 'Please login first ' })
        const refreshToken = cookies.jwt

        let _id
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                if (err) return res.status(403).json({ message: 'Invalid refresh token' })
                _id = decoded.id
            }
        )

        const tasks = await To_Do_list.find({
            user: _id
        }).exec()
        if (!tasks) return res.status(400).json({ message: 'Tasks not found' })

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
        if (!cookies || !cookies.jwt) return res.status(400).json({ message: 'Please login first ' })
        const refreshToken = cookies.jwt

        const { task_name, status, priority } = req.body
        // Checking whether the data is sent or not
        if (!task_name) return res.status(400).json({ message: 'Data not sent' })

        let _id
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                if (err) return res.status(403).json({ message: 'Invalid refresh token' })
                _id = decoded.id
            }
        )

        // Finding the task needed to be updated
        const foundTask = await To_Do_list.findOne({
            $and: [{ task_name, user: _id }]
        })
        if (!foundTask) return res.status(400).json({ message: 'Task not found' })

        // update the task
        foundTask.status = status
        foundTask.priority = priority
        const result = await foundTask.save()
        console.log(result)

        return res.status(200).json({ message: 'Task completed' })

    } catch (error) {
        console.error('Error saving survey:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

const handleDeleteTask = async (req, res) => {
    try {

        const cookies = req.cookies
        // Checking weather user is logged in or not
        if (!cookies || !cookies.jwt) return res.status(400).json({ message: 'Please login first ' })
        const refreshToken = cookies.jwt
        const { task_name } = req.body
        // Checking whether the data is sent or not
        if (!task_name) return res.status(400).json({ message: 'Data not sent' })

        let _id
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                if (err) return res.status(403).json({ message: 'Invalid refresh token' })
                _id = decoded.id
            }
        )

        // Finding the task needed to be updated
        const foundTask = await To_Do_list.deleteOne({
            $and: [{ task_name, user: _id }]
        })
        if (!foundTask) return res.status(400).json({ message: 'Task not found' })

        return res.status(200).json({ message: 'Successfully deleted the task' })

    } catch (error) {
        console.error('Error saving survey:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { handleAddTask, getTasks, handlecompletedTask, handleDeleteTask }