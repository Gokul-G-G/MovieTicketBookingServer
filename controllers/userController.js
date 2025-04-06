import { User } from "../models/userModel.js";
import crypto from "crypto";
import bcrypt, { compare } from "bcrypt";
import { generateToken } from "../utils/token.js";
import generateProfilePic from "../utils/profilePicGenerator.js";
import sendEmail from "../utils/sendEmail.js";

/*=============
    USER SIGNUP  |
===============*/
export const userSignup = async (req, res, next) => {
  try {
    //collect user data
    const { name, email, phone, password, profilePic } = req.body;
    //data validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are Required" });
    }
    //If user already exist
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "user already exist" });
    }
    //password Hashing
    const hashedPassword = await bcrypt.hash(password, 10);
    // Generate default profile pic if not provided
    const profilePicUrl = profilePic || generateProfilePic(name);
    //Data send to DB
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      profilePic: profilePicUrl,
      role: "user",
    });
    await newUser.save();
    //Generate token using userid and role
    const token = generateToken(newUser._id, newUser.role);
    res.cookie("token", token, { httpOnly: true, secure: true });
    // Convert Mongoose document to plain object and remove password
    const userWithoutPassword = newUser.toObject();
    delete userWithoutPassword.password;
    res
      .status(201)
      .json({ data: userWithoutPassword, message: "signup success" });
  } catch (error) {
    res
      .status(error.statuscode || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
};

/*=============
    USER LOGIN  |
===============*/

export const userLogin = async (req, res, next) => {
  try {
    //collect user data
    const { email, password } = req.body;
    //data validation
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are Required" });
    }
    //User Exist
    const userExist = await User.findOne({ email });
    if (!userExist) {
      return res.status(400).json({ message: "User not exist" });
    }
    //password match
    const passwordMatch = await bcrypt.compare(password, userExist.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid user credentials" });
    }
    //Check user profile active
    if (!userExist.isActive) {
      return res.status(400).json({ message: "User account is not Active" });
    }
    //Generate Token
    const token = generateToken(userExist._id, userExist.role);
    res.cookie("token", token, { httpOnly: true, secure: true });
    // Convert Mongoose document to plain object and remove password
    const userWithoutPassword = userExist.toObject();
    delete userWithoutPassword.password;
    res
      .status(302)
      .json({ data: userWithoutPassword, message: "login success" });
  } catch (error) {
    res
      .status(error.statuscode || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
};

/*=============
    USER LOGOUT  |
===============*/

export const userLogout = async (req, res) => {
  try {
    // Clear the authentication cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None", // For cross-origin requests
  });



    // Send success response
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res
      .status(error.statuscode || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
};

/*=============
    USER PROFILE  |
===============*/

export const userProfile = async (req, res) => {
  try {
    res
      .status(200)
      .json({ data: req.user, message: "Profile fetched successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

/*=============
    EDIT USER PROFILE  |
===============*/

export const profileEdit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, profilePic } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, phone, profilePic },
      { new: true }
    ).select("-password");
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      data: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

/*=============
 DEACTIVATE USER PROFILE  |
===============*/

export const userDeactivate = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Deactivate user (set  isActive: false)
    user.isActive = false;
    await user.save();

    res.status(200).json({
      message: "User account deactivated successfully",
      data: user.toObject(),
    });
  } catch (error) {
    res
      .status(error.statuscode || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
};

/*=============
    USER PASSWORD CHANGE  |
===============*/

export const changePassword = async (req,res)=>{
  try {
    // Get details from the body
    const { oldPassword, newPassword } = req.body;
    //Find user by id
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Check old password matches
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(404).json({ message: "Old password is incorrrect" });
    }
    //Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    // Save user with updated password
    await user.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
}

/*=============
    USER FORGOT PASSWORD  |
===============*/

export const userForgotPassword = async (req, res) => {
  try {
    //Get email from frontend
    const { email } = req.body;
    //Check user found in DB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a new password (auto-reset)
    const newPassword = crypto.randomBytes(4).toString("hex"); // Example: "1a2b3c4d"

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    // Send email with the new password
    const subject = "Password Reset Successful";
    const message = `Your new password is: ${newPassword}. Please login and change your password immediately.`;

    await sendEmail(user.email, subject, message);

    res
      .status(200)
      .json({ message: "A new password has been sent to your email" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

/*=============
    USER EXIST  |
===============*/

export const userAvailable = async (req,res) =>{
try {
  res.status(200).json({ message: "User is Authorized" });
} catch (error) {
   res
     .status(error.statuscode || 500)
     .json({ message: error.message || "Internal Server Error" });
}

}