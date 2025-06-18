// backend/controllers/userNotification.controller.js

import UserNotification from "../models/userNotification.model.js";

// IMPORTANT: This function is for internal use within your backend to *create* notifications.
// It should be exported here so other controllers can import it.
export const createUserNotification = async ({ userId, type, message, link, relatedEntity }) => {
    console.log('\n--- DEBUG: Inside createUserNotification ---');
    console.log('Received parameters for notification:');
    console.log(`  userId: ${userId}`);
    console.log(`  type: ${type}`);
    console.log(`  message: "${message}"`);
    console.log(`  link: ${link}`);
    console.log(`  relatedEntity: ${JSON.stringify(relatedEntity)}`);

    if (!userId || !type || !message) {
        console.error('ERROR: Missing required fields for notification creation in createUserNotification.');
        return { success: false, message: 'Missing required notification data.' };
    }

    try {
        const newNotification = new UserNotification({
            user: userId,
            type: type,
            message: message,
            link: link,
            relatedEntity: relatedEntity
        });

        const savedNotification = await newNotification.save();
        console.log(`SUCCESS: User Notification created and saved for user ${userId} with ID: ${savedNotification._id}`);
        console.log('Saved Notification Data:', JSON.stringify(savedNotification, null, 2));
        return { success: true, notification: savedNotification };
    } catch (error) {
        console.error('ERROR: Failed to save user notification to DB. Details:', error);
        return { success: false, message: 'Failed to create user notification due to database error.' };
    } finally {
        console.log('--- DEBUG: Exiting createUserNotification ---\n');
    }
};


// Controller to get notifications for the authenticated user
export const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        const notifications = await UserNotification.find({ user: userId })
                                                    .sort({ createdAt: -1 })
                                                    .limit(50);

        res.status(200).json({ success: true, notifications });

    } catch (error) {
        console.error('Error fetching user notifications:', error);
        res.status(500).json({ success: false, message: 'Server error: Failed to fetch user notifications.' });
    }
};

// Optional: Controller to mark a user notification as read
export const markUserNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user._id;

        const notification = await UserNotification.findOneAndUpdate(
            { _id: notificationId, user: userId },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: 'User notification not found or unauthorized.' });
        }

        res.status(200).json({ success: true, message: 'User notification marked as read.', notification });

    } catch (error) {
        console.error('Error marking user notification as read:', error);
        res.status(500).json({ success: false, message: 'Server error: Failed to mark user notification as read.' });
    }
};

// Optional: Controller to delete a user notification
export const deleteUserNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user._id;

        const notification = await UserNotification.findOneAndDelete(
            { _id: notificationId, user: userId }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: 'User notification not found or unauthorized.' });
        }

        res.status(200).json({ success: true, message: 'User notification deleted successfully.' });

    } catch (error) {
        console.error('Error deleting user notification:', error);
        res.status(500).json({ success: false, message: 'Server error: Failed to delete user notification.' });
    }
};