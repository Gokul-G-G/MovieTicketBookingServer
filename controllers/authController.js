import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import { TheaterOwner } from "../models/theaterModel.js";
import { Admin } from "../models/adminModel.js";

// Unified Login Function
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // console.log(email, password);

    let user = null;
    let role = "";

    // Check in User collection
    user = await User.findOne({ email });
    if (user) role = "user";

    // Check in TheaterOwner collection if not found in User
    if (!user) {
      user = await TheaterOwner.findOne({ email });
      if (user) {
        role = "theaterOwner";

        // Ensure user exists before accessing properties
        if (user.isRejected) {
          return res
            .status(403)
            .json({ message: "User account is rejected by Admin ❌" });
        }
        if (!user.isVerified) {
          return res
            .status(403)
            .json({ message: "User account is not verified ⚠️" });
        }
      }
    }

    // Check in Admin collection
    if (!user) {
      user = await Admin.findOne({ email });
      if (user) role = "admin";
    }

    // If user is not found
    if (!user) {
      return res.status(401).json({ message: "User not found ❌" });
    }

    // Validate Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials ❌" });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user._id, role }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    // Send Response
    res.cookie("token", token, { httpOnly: true, secure: true });
    res.status(200).json({ message: "Login successful ✅", role, token });
  } catch (error) {
    // console.error("Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
