import Admin from "../models/admin.model.js";
import { generateToken } from "../libs/utils.js";
import bcrypt from "bcryptjs";
import BlacklistToken from "../models/blacklistToken.model.js";

export const signup = async (req,res)=>{
    const { fullname , email , password } = req.body;
    try {
        if (!fullname || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
        }

        const admin = await Admin.findOne({ email });

        if (admin) return res.status(400).json({ message: "admin already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = new Admin({
        fullname,
        email,
        password: hashedPassword,
        });

        if (newAdmin) {
        // generate jwt token here
        generateToken(newAdmin._id, newAdmin.role ,  res); //jwt token mai bus apan id jo mongo banata hai wahi save karenge
        await newAdmin.save(); 

        res.status(201).json({
            _id: newAdmin._id,
            fullname: newAdmin.fullname,
            email: newAdmin.email, // aur kuch res mai bhejna ho jo frontend pe dikhna ho woh add kar dena
        });
        } else {
        res.status(400).json({ message: "Invalid admin data" });
        }
    } catch (error) {
        console.log("Error in admin signup controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(admin._id,admin.role, res);

    res.status(200).json({
      _id: admin._id,
      email: admin.email,
      role: "admin"
    });

  } catch (error) {
    console.error("Error in admin login controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies?.jwt;

    if (!token) {
      return res.status(400).json({ message: "No token found in cookies" });
    }

    await BlacklistToken.create({ token });

    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "strict"
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error in admin logout controller:", error.message);
    res.status(500).json({ message: "Server error during logout" });
  }
};


