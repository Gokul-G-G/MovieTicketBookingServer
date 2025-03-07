import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

export const authorizeUser = async (req, res, next) => {
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
    // Fetching user details from the database without password
    req.user = await User.findById(decoded.id).select("-password");
    // If user does not exist, return a "User not found" response
    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }
    next();
  } catch (error) {
    console.error("Token Verification Error:", error.message);
    res.status(401).json({ message: "Invalid or Expired Token" });
  }
};
