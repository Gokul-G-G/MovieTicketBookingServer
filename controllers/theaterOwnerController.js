import { TheaterOwner } from "../models/theaterModel.js";
import generateProfilePic from "../utils/profilePicGenerator.js";
import { generateToken } from "../utils/token.js";
import bcrypt from "bcrypt";

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
      role: "theaterOwner",
    });
    await newtheaterOwner.save();
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
    if (!userExist.isVerified || !userExist.isActive) {
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
        console.log("Hashed pwd===",user.password);        
        // Save user with updated password
        await user.save();
        res.status(200).json({ message: "Password changed successfully" });
      } catch (error) {
        res.status(500).json({ message: error.message || "Internal Server Error" });
      }
}