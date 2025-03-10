import { TheaterOwner } from "../models/theaterModel.js";
import { notifyAdmin } from "../utils/notifyAdmin.js";
import generateProfilePic from "../utils/profilePicGenerator.js";
import { generateToken } from "../utils/token.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import { Movie } from "../models/movieModel.js";

/*==========
   SIGNUP
============ */
export const ownerSignup = async (req, res) => {
  try {
    //Get Data from body
    const { name, email, phone, location, acType, password, profilePic } =
      req.body;
    //validation
    if (!email || !phone || !location || !password) {
      res.status(401).json({ message: "All fields are needed" });
    }
    //Check already exist
    const existOwner = await TheaterOwner.findOne({ email });
    if (existOwner) {
      res.status(401).json({ message: "Owner already exist" });
    }
    //provide default profile picture
    const profilePicUrl = profilePic || generateProfilePic(name);
    //password hash
    const hashedPassword = await bcrypt.hash(password, 10);
    //save to DB
    const newtheaterOwner = new TheaterOwner({
      name,
      email,
      phone,
      location,
      acType,
      password: hashedPassword,
      profilePic: profilePicUrl,
      isVerified: false,
      role: "theaterOwner",
    });

    await newtheaterOwner.save();
    // Notify admin about the new theater owner request
    notifyAdmin(newtheaterOwner);
    //Generate Token
    const token = generateToken(newtheaterOwner._id, newtheaterOwner.role);
    res.cookie("token", token, { httpOnly: true, secure: true });
    //Send data to frontend Without password
    const ownerWithoutPassword = newtheaterOwner.toObject();
    delete ownerWithoutPassword.password;
    res
      .status(200)
      .json({ data: ownerWithoutPassword, message: "Owner Signup Success" });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

/*==========
   SIGNIN
============ */
export const ownerLogin = async (req, res) => {
  try {
    //Get data from body
    const { email, password } = req.body;
    //Check User exist
    const userExist = await TheaterOwner.findOne({ email });
    if (!userExist) {
      res.status(400).json({ message: "User not exist" });
    }
    //password check
    const passwordMatch = await bcrypt.compare(password, userExist.password);
    if (!passwordMatch) {
      res.status(400).json({ message: "Invalid Credentials" });
    }
    //Check user profile is Verified
    if (!userExist.isVerified) {
      return res.status(400).json({ message: "User account is not Verifed" });
    }
    //Check user profile is Active
    if(!userExist.isActive){
      return res.status(400).json({ message: "User account is not Active" });
    }
    //Generate Token
    const token = generateToken(userExist._id, userExist.role);
    res.cookie("token", token, { httpOnly: true, secure: true });
    //Send data to frontend without password
    const ownerWithoutPassword = userExist.toObject();
    delete ownerWithoutPassword.password;
    res
      .status(200)
      .json({ data: ownerWithoutPassword, message: "Owner Signup Success" });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

/*==========
   LOGOUT
============ */
export const ownerLogout = async (req, res) => {
  try {
    // Clear the authentication cookie
    res.clearCookie("token", { httpOnly: true, secure: true });

    // Send success response
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res
      .status(error.statuscode || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
};

/*==========
   PROFILE VIEW
============ */
export const OwnerProfile = async (req, res) => {
  try {
    res.status(200).json({ message: "User fetched successfully" });
  } catch (error) {
    res
      .status(error.statuscode || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
};

/*==========
   PROFILE EDIT
============ */
export const ownerProfileEdit = async (req, res) => {
  try {
    //Get User Id from cookie
    const userId = req.user.id
    //Get data to be edited
    const {name,phone,location,acType,profilePic}=req.body
    //Edit the data and save to DB
    const updateData = await TheaterOwner.findByIdAndUpdate(
      userId,
      {
        name,
        phone,
        location,
        acType,
        profilePic,
      },
      { new: true }
    ).select("-password");
    if(!updateData){
         return res.status(404).json({ message: "User not found" });
    }
     res.status(200).json({
       data: updateData,
       message: "Profile updated successfully",
     });
  } catch (error) {
    res
      .status(error.statuscode || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
};

/*==========
   PROFILE DEACTIVATE
============ */
export const ownerProfileDeactivate = async (req,res)=>{
  try {
    //Get Id from Cookie
    const userid = req.user.id;
    //Get the user using id
    const user = await TheaterOwner.findById(userid);
    //check user Available
    if(!user){
       return res.status(404).json({ message: "User not found" });
    }
    // Deactivate user (set  isActive: false)
    user.isActive=false
    await user.save()
   
    res.status(200).json({
      message: "User account deactivated successfully",
      data: user.toObject(),
    });
  } catch (error) {
     res
       .status(error.statuscode || 500)
       .json({ message: error.message || "Internal Server Error" });
  }
}

/*==========
   PASSWORD CHANGE
============ */
export const ownerPasswordChange = async (req,res)=>{
    try {
        // Get details from the body
        const { oldPassword, newPassword } = req.body;
        //Find user by id
        const userId = req.user.id;
        const user = await TheaterOwner.findById(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        // Check old password matches
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Old password is incorrect" });
        }
        //Hash new password
        user.password = await bcrypt.hash(newPassword, 10);      
        // Save user with updated password
        await user.save();
        res.status(200).json({ message: "Password changed successfully" });
      } catch (error) {
        res.status(500).json({ message: error.message || "Internal Server Error" });
      }
}

/*==========
   PASSWORD FORGOT
============ */
export const ownerForgotPassword = async (req, res) => {
  try {
    //Get email from frontend
    const { email } = req.body;
    //Check Owner found in DB
    const owner = await TheaterOwner.findOne({ email });
    if (!owner) {
      return res.status(404).json({ message: "Theater Owner not found" });
    }

    // Generate a new password (auto-reset)
    const newPassword = crypto.randomBytes(4).toString("hex"); // Example: "1a2b3c4d"

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    owner.password = await bcrypt.hash(newPassword, salt);

    await owner.save();

    // Send email with the new password
    const subject = "Password Reset Successful";
    const message = `Your new password is: ${newPassword}. Please login and change your password immediately.`;

    await sendEmail(owner.email, subject, message);

    res
      .status(200)
      .json({ message: "A new password has been sent to your email" });
  } catch (error) {
        res
          .status(500)
          .json({ message: error.message || "Internal Server Error" });
  }
}

/*==========
  GET MOVIES
============ */
export const getMovies = async (req, res) => {
  try {
    //Get user Id from the Request
    const ownerId = req.user.id;
    // Find all movies where the theaterOwnerId matches
    const movies = await Movie.find({ createdBy:ownerId });
    // Check if movies exist
    if (!movies || movies.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No movies found for this theater owner",
      });
    }
    res.status(200).json({
      success: true,
      data: movies,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
} 