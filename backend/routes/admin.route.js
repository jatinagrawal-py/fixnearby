import express from "express";
import { login, logout, signup } from "../controllers/admin.controller.js";
import { adminProtectRoute } from "../middleware/middleware.js";
const router = express.Router();

// -> /api/admin/signup
router.post("/signup", signup);

// -> /api/admin/login
router.post("/login", login);

// -> /api/admin/logout
router.post("/logout", logout);

// -> /api/admin/check


export default router;