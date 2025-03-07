// admin is hardcoded, Admin should have access to all routes and special permissions to manage users, movies, and theaters
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Admin } from "../models/adminModel.js";
import { User } from "../models/userModel.js";
import { TheaterOwner } from "../models/theaterModel.js";

/* ============
 ADMIN LOGIN
=============== */
export const adminLogin = async (req, res) => {
  try {
    //Get data from frontend
    const { email, password } = req.body;
    //Check admin exist
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    // Verify password
    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.SECRET_KEY,
      { expiresIn: "20m" }
    );

    res.cookie("token", token, { httpOnly: true, secure: true });
    res.status(200).json({ message: "Admin login successful", token });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

/* ============
 ADMIN LOGOUT
=============== */
export const adminLogout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Admin logged out successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

/* ============
 ADMIN PROFILE
=============== */
export const adminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json({ data: admin });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

/* ============
 GET ALL USERS
=============== */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ data: users });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

/* ============
 DELETE USER
=============== */
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

/* ============
 GET ALL THEATER 
=============== */
export const getAllTheater = async (req, res) => {
  try {
    // Fetch all theater owners from the database
    const theaters = await TheaterOwner.find().select("-password");

    // Check if theaters exist
    if (!theaters || theaters.length === 0) {
      return res.status(404).json({ message: "No theaters found" });
    }
    // Send response
    res
      .status(200)
      .json({ message: "Theaters fetched successfully", data: theaters });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

/* ============
 DELETE THEATER 
=============== */
export const deleteTheater = async (req, res) =>{
     try {
       await TheaterOwner.findByIdAndDelete(req.params.id);
       res.status(200).json({ message: "Theater deleted successfully" });
     } catch (error) {
       res
         .status(500)
         .json({ message: "Internal server error", error: error.message });
     }
}