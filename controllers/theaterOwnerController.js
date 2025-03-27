import { TheaterOwner } from "../models/theaterModel.js";
import { notifyAdmin } from "../utils/notifyAdmin.js";
import generateProfilePic from "../utils/profilePicGenerator.js";
import { generateToken } from "../utils/token.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import { Movie } from "../models/movieModel.js";
import { Show } from "../models/showsModel.js";
import { Booking } from "../models/bookingsModel.js";

/*==========
   SIGNUP
============ */
export const ownerSignup = async (req, res) => {
  try {
    // Get Data from body
    const { name, email, phone, location, password, profilePic } = req.body;

    // Validation
    if (!name || !email || !phone || !location || !password) {
      return res.status(400).json({
        message: "All fields are required,",
      });
    }

    // Check if owner already exists
    const existOwner = await TheaterOwner.findOne({ email });
    if (existOwner) {
      return res.status(400).json({ message: "Owner already exists" });
    }

    // Provide default profile picture
    const profilePicUrl = profilePic || generateProfilePic(name);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save to DB
    const newTheaterOwner = new TheaterOwner({
      name,
      email,
      phone,
      location,
      password: hashedPassword,
      profilePic: profilePicUrl,
      isVerified: false,
      role: "theaterOwner",
    });

    await newTheaterOwner.save();

    // Notify admin about the new theater owner request
    notifyAdmin(newTheaterOwner);

    // Generate Token
    const token = generateToken(newTheaterOwner._id, newTheaterOwner.role);
    res.cookie("token", token, { httpOnly: true, secure: true });

    // Send data to frontend Without password
    const ownerWithoutPassword = newTheaterOwner.toObject();
    delete ownerWithoutPassword.password;

    res
      .status(200)
      .json({ data: ownerWithoutPassword, message: "Owner Signup Successful" });
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
    console.log(userExist)
    if (!userExist) {
      res.status(400).json({ message: "User not exist" });
    }
    //password check
    const passwordMatch = await bcrypt.compare(password, userExist.password);
    if (!passwordMatch) {
      res.status(400).json({ message: "Invalid Credentials" });
    }
    // Check if user is rejected
    if (userExist.isRejected) {
      return res
        .status(403)
        .json({ message: "User account is rejected by Admin" });
    }
    //Check user profile is Verified
    if (!userExist.isVerified) {
      return res.status(400).json({ message: "User account is not Verifed" });
    }
    //Check user profile is Active
    if (!userExist.isActive) {
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
    res.status(200).json({data:req.user, message: "User fetched successfully" });
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
    // Get User ID from authenticated request
    const userId = req.user.id;

    // Extract other fields from request body
    const { name, phone, location, acType } = req.body;
    
    // Handle profile picture upload
    const profilePic = req.files?.profilePic?.[0]?.path || "";
  
    // Update database
    const updateData = await TheaterOwner.findByIdAndUpdate(
      userId,
      { name, phone, location, acType, profilePic },
      { new: true }
    ).select("-password");

    // Check if user exists
    if (!updateData) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      data: updateData,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("❌ Profile Update Error:", error);
    res.status(error.statusCode || 500).json({
      message: error.message || "Internal Server Error",
    });
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
  GET MOVIES (For Theater Owners to Select)  
============ */  
export const getMovies = async (req, res) => {  
  try {  
    // Fetch all movies from the centralized collection  
    const movies = await Movie.find();  

    if (!movies.length) {  
      return res.status(404).json({  
        success: false,  
        message: "No movies available.",  
      });  
    }  

    res.status(200).json({  
      success: true,  
      data: movies,  
    });  
  } catch (error) {  
    res.status(500).json({ message: error.message || "Internal Server Error" });  
  }  
};  

/*==========
  ADD SHOWS   (Add show for the selected movie)
============ */
export const addShow = async (req, res) => {
  try {
    // Get data from request body
    const { movieId, date, timeSlots, screenNumber, ticketPrice } = req.body;

    // Validate input
    if (!movieId || !date || !timeSlots || !screenNumber || !ticketPrice) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Check if the movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found.",
      });
    }
    // Create a new show entry
    const newShow = new Show({
      movieId,
      theaterId: req.user._id, // Theater owner's ID
      date,
      timeSlots, // Array of time slots for the show
      screenNumber,
      ticketPrice,
    });

    // Save to database
    await newShow.save();

    res.status(201).json({
      success: true,
      message: "Show added successfully!",
      data: newShow,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

/*==========
  GET SHOWS
============ */
export const getShows = async (req, res) => {
  try {
    //Get user Id from the Request
    const ownerId = req.user.id;
    // Find all movies where the theaterOwnerId matches
    const show = await Show.find({ createdBy: ownerId });
    // Check if movies exist
    if (!show || show.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Shows found for this theater owner",
      });
    }
    res.status(200).json({
      success: true,
      data: show,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
}; 

/*==========
  BOOKING DETAILS
============ */
export const getBookings = async (req, res) => {
  try {
    // Ensure the user is a theater owner
    if (req.user.role !== "theaterOwner") {
      return res.status(403).json({
        success: false,
        message: "Access Denied! Only theater owners can view bookings.",
      });
    }

    // Find all shows created by this theater owner
    const shows = await Show.find({ theaterId: req.user._id });

    // Extract the IDs of the shows
    const showIds = shows.map((show) => show._id);

    // Find all bookings for the shows owned by the theater owner
    const bookings = await Booking.find({ showId: { $in: showIds } })
      .populate("userId", "name email") // Fetch user details
      .populate("showId", "movieId date timeSlots") // Fetch movie and show details
      .populate({
        path: "showId",
        populate: {
          path: "movieId",
          select: "title duration genre",
        },
      });

    res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully!",
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};