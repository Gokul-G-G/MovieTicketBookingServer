import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import { TheaterOwner } from "../models/theaterModel.js";
import { Admin } from "../models/adminModel.js";

// Unified Login Function
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check in User collection
    let user = await User.findOne({ email });
    let role = "user";

    // Check in TheaterOwner collection if not found in User
    if (!user) {
      user = await TheaterOwner.findOne({ email });
      role = "theaterOwner";
    }

    // Check in Admin collection if not found in both
    if (!user) {
      user = await Admin.findOne({ email });
      role = "admin";
    }

    // If user does not exist
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Validate Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: role },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    // Send Response
    res.cookie("token", token, { httpOnly: true, secure: true });
    res.status(200).json({ message: "Login successful", role, token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
