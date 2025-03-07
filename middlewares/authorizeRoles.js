import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import { TheaterOwner } from "../models/theaterModel.js";
import { Admin } from "../models/adminModel.js";

// Common Middleware to Verify Token
export const verifyUser = async (req, res, next) => {
  try {
    const token =
      req.cookies.token || req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized, No Token Provided" });
    }

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

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or Expired Token" });
  }
};

// Role-Based Middleware
export const authorizedAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access Denied: Admin Only" });
  }
  next();
};

export const authorizedTheaterOwner = (req, res, next) => {
  if (req.user.role !== "theaterOwner") {
    return res
      .status(403)
      .json({ message: "Access Denied: Theater Owner Only" });
  }
  next();
};

export const authorizedUser = (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "Access Denied: User Only" });
  }
  next();
};
