const cron = require("node-cron");
const Task = require("../../models/To_Do_list");
const User = require("../../models/User");
const key = require("../../firebase_private_key.json");

// Function to check overdue tasks and send notifications
const checkOverdueTasks = async () => {
    try {
        // Find overdue tasks with notification not sent
        const overdueTasks = await Task.find({
            dueDate: { $lt: new Date() },
            notification_sent: false, // Only fetch tasks where notification hasn't been sent
        });

        for (const task of overdueTasks) {
            const user = await User.findById(task.user); // Fetch the associated user
            if (user && user.firebaseUID) {
                // Iterate through user's FCM tokens
                for (const token of user.fcmTokens) {
                    const response = await fetch("https://fcm.googleapis.com/v1/projects/myproject-b5ae1/messages:send", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${key.private_key}`, // Use Firebase private key for authentication
                        },
                        body: JSON.stringify({
                            to: token, // Token of the user's device
                            notification: {
                                title: "Task Overdue!",
                                body: `Your task "${task.title}" is overdue.`,
                            },
                        }),
                    });

                    // Log the response for debugging purposes
                    if (response.ok) {
                        console.log(`Notification sent for task: ${task._id}`);
                    } else {
                        console.error(`Failed to send notification for task: ${task._id}`, await response.text());
                    }
                }
            }

            // Mark the task's notification as sent
            task.notification_sent = true;
            await task.save();
        }
    } catch (error) {
        console.error("Error checking overdue tasks:", error);
    }
};

// Schedule the job to run every 2 hours
cron.schedule("0 * * * *", () => {
    console.log("Checking overdue tasks...");
    checkOverdueTasks();
});

module.exports = { checkOverdueTasks };