// backend/routes/repairer.route.js
import express from "express";
import {
  getOtp,
  verifyOtp,
  signup,
  login,
  logout,
  getDashboardStats,
  getRecentActivity,
  getNearbyJobs,
  acceptJob,
  getRepairerProfile,
  updateRepairerProfile,
  updateRepairerSettings,
  getRepairerAnalytics,
  getRepairerNotifications,
  markNotificationAsRead,
  getRepairerConversations, 
  getConversationMessages, 
  createRepairerConversation
} from "../controllers/repairer.controller.js";
import {
  repairerProtectRoute as isRepairerAuthenticated
} from "../middleware/middleware.js";

const router = express.Router();

// Auth Routes
router.post("/getotp", getOtp);
router.post("/verify-otp", verifyOtp);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Protected Routes (Repairer Specific)
router.get("/dashboard-stats", isRepairerAuthenticated, getDashboardStats);
router.get("/recent-activity", isRepairerAuthenticated, getRecentActivity);
router.get("/nearby-jobs", isRepairerAuthenticated, getNearbyJobs);
router.post("/accept-job/:jobId", isRepairerAuthenticated, acceptJob);
router.get("/profile", isRepairerAuthenticated, getRepairerProfile);
router.put("/profile", isRepairerAuthenticated, updateRepairerProfile);
router.put("/settings", isRepairerAuthenticated, updateRepairerSettings);
router.get("/analytics", isRepairerAuthenticated, getRepairerAnalytics);
router.get("/notifications", isRepairerAuthenticated, getRepairerNotifications);
router.put("/notifications/read/:notificationId", isRepairerAuthenticated, markNotificationAsRead);



router.post("/conversations/create", isRepairerAuthenticated, createRepairerConversation);
router.get("/conversations", isRepairerAuthenticated, getRepairerConversations); 
router.get("/conversations/:conversationId/messages", isRepairerAuthenticated, getConversationMessages);


export default router;