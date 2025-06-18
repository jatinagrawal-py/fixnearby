// backend/app.js
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import morgan from "morgan";
import connectDB from "./db/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/user.route.js";
import repairerRoutes from "./routes/repairer.route.js";
import adminRoutes from "./routes/admin.route.js";
import serviceRequestRoutes from "./routes/serviceRequest.route.js";
import { checkAuth } from "./libs/utils.js"; 

const app = express();
connectDB(); 
app.use(cors({
  origin: process.env.FRONTEND_URL, 
  credentials: true,
}));

app.use(cookieParser());
app.use(morgan("dev")); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 


app.use("/api/user", userRoutes);
app.use("/api/repairer", repairerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/service-requests", serviceRequestRoutes);

app.get("/api/check-auth", checkAuth);

export default app;