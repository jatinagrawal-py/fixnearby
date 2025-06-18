//backend/middleware/middleware.js
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Repairer from "../models/repairer.model.js";
import Admin from "../models/admin.model.js";
import BlacklistToken from "../models/blacklistToken.model.js";

export const userProtectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    // check if the token is blacklisted or not
    const isBlacklisted = await BlacklistToken.findOne({token});
    if (isBlacklisted) {
      return res.status(401).json({ message: "Unauthorized - Token is Blacklisted" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    const user = await User.findById(decoded.userId).select("-password"); //kyuki humne password ko select nahi kiya hai toh password nahi milega

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; //isko conntoller mai use kare toh req.user se hi access karna jaise req.user._id -> toh jo ab woh page pe hai user uski id mil jaegi aise hi ab tere ko kuch bhi mil jaega except password

    next();
  } catch (error) {
    console.log("Error in userprotectRoute middleware: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const repairerProtectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    // check if the token is blacklisted or not
    const isBlacklisted = await BlacklistToken.findOne({token});
    if (isBlacklisted) {
      return res.status(401).json({ message: "Unauthorized - Token is Blacklisted" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    const repairer = await Repairer.findById(decoded.userId).select("-password");

    if (!repairer) {
      return res.status(401).json({ message: "repairer not found" });
    }

    // if isbanned true hua toh usko ane hi nahi denge wahahhaha ;

    if (repairer.isbanned) {
      return res.status(403).json({ message: "Your account has been banned. Please contact support." });
    }

    // Redflag reset logic here
    const now = new Date();
    const createdAt = new Date(repairer.createdAt);
    const oneMonthAfterCreation = new Date(createdAt);
    oneMonthAfterCreation.setMonth(oneMonthAfterCreation.getMonth() + 1);

    if (now >= oneMonthAfterCreation && repairer.redflag !== 0) {
      repairer.redflag = 0;
      await repairer.save();
    }

    req.repairer = repairer;

    next();
  } catch (error) {
    console.log("Error in repairerprotectRoute middleware: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const adminProtectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    // check if the token is blacklisted or not
    const isBlacklisted = await BlacklistToken.findOne({token});
    if (isBlacklisted) {
      return res.status(401).json({ message: "Unauthorized - Token is Blacklisted" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    const admin = await Admin.findById(decoded.userId).select("-password");

    if (!admin) {
      return res.status(401).json({ message: "User not found" });
    }

    req.admin = admin; //isko conntoller mai use kare toh req.admin se hi access karna jaise req.admin._id -> toh jo ab woh page pe hai admin uski id mil jaegi aise hi ab tere ko kuch bhi mil jaega except password

    next();
  } catch (error) {
    console.log("Error in adminprotectRoute middleware: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};