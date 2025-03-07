import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import { TheaterOwner } from "../models/theaterModel.js";
import { Admin } from "../models/adminModel.js";

// Middleware to Verify Token and Identify User Role
export const verifyMovieAccess = async (req, res, next) => {
  try {
    // Extracting token from cookies or authorization header
    const token =
      req.cookies.token || req.headers["authorization"]?.split(" ")[1];
    // If no token is found, return an unauthorized response
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized, No Token Provided" });
    }
    // Verifying the token using the secret key
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    let user;

    // Fetch User Based on Role
    if (decoded.role === "user") {
      user = await User.findById(decoded.id).select("-password");
    } else if (decoded.role === "theaterOwner") {
      user = await TheaterOwner.findById(decoded.id).select("-password");
    } else if (decoded.role === "admin") {
      user = await Admin.findById(decoded.id).select("-password");
    }
    // If no user is found in the database, return an error response
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user; // Attach user data to request
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or Expired Token" });
  }
};

// Role-Based Authorization Middlewares for Movies

// Middleware to allow only normal users
export const authorizedMovieUser = (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "Access Denied: Users Only" });
  }
  next();
};

// Middleware to allow only theater owners
export const authorizedMovieTheaterOwner = (req, res, next) => {
  if (req.user.role !== "theaterOwner") {
    return res
      .status(403)
      .json({ message: "Access Denied: Theater Owners Only" });
  }
  next();
};

// Middleware to allow only admins
export const authorizedMovieAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access Denied: Admins Only" });
  }
  next();
};
