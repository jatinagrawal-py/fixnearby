// backend/routes/user.route.js
import express from "express";
import {
  getOtp,
  verifyOtp,
  signup,
  login,
  logout,
  getDashboardStats,
  getRecentActivity,
  requestService,
  getInProgressServices,
  getPendingServices,
  cancelJob,
  getUserConversations, 
  getConversationMessages, 
  createRazorpayOrder,
  serviceOtp,
  verifyAndTransferPayment,
  getServiceRequestById,
  getPaymentDetailsById
} from "../controllers/user.controller.js";
import {
  userProtectRoute
} from "../middleware/middleware.js"
import {
  getUserNotifications, markUserNotificationAsRead,deleteUserNotification
} from '../controllers/userNotification.controller.js';

const router = express.Router();

// Auth Routes
// api/getotp 
router.post("/getotp", getOtp);
// api/verify-otp
router.post("/verify-otp", verifyOtp);
// api/signup
router.post("/signup", signup);
// api/login
router.post("/login", login);
// api/logout
router.post("/logout", logout);

router.post("/verify-serviceotp" , serviceOtp)


// Protected Routes (User Specific)

router.get("/dashboard-stats", userProtectRoute, getDashboardStats);

router.get("/recent-activity", userProtectRoute, getRecentActivity);
router.post("/request-service", userProtectRoute, requestService);
router.get("/in-progress-services",userProtectRoute, getInProgressServices);
router.get("/pending-services", userProtectRoute, getPendingServices);
router.put("/cancel-job/:jobId",userProtectRoute, cancelJob); // New route for cancelling a job

// Chat Routes
router.get("/conversations", userProtectRoute, getUserConversations); // Get all conversations for the user
router.get("/conversations/:conversationId/messages", userProtectRoute, getConversationMessages); // Get messages for a specific conversation

router.get('/notifications', userProtectRoute, getUserNotifications);
router.put('/notifications/:notificationId/read', userProtectRoute, markUserNotificationAsRead);
router.delete('/notifications/:notificationId',userProtectRoute, deleteUserNotification);

router.post("/create-razorpay-order", userProtectRoute, createRazorpayOrder);
router.post("/verify-and-transfer-payment", userProtectRoute, verifyAndTransferPayment);

router.get("/service-requests/:id", userProtectRoute, getServiceRequestById); 

router.get("/payments/:paymentId", userProtectRoute, getPaymentDetailsById);



export default router;