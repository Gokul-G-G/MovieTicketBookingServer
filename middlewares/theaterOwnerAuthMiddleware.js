import jwt from 'jsonwebtoken'
import { TheaterOwner } from '../models/theaterModel.js';

export const authorizeTheaterOwner = async (req,res,next) =>{
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
      // Fetching theater owner details from the database without password
      req.user = await TheaterOwner.findById(decoded.id).select("-password");
      if (!req.user) {
      // If theater owner does not exist, return a "User not found" response
        return res.status(404).json({ message: "User not found" });
      }
      next();
    } catch (error) {
         console.error("Token Verification Error:", error.message); 
         res.status(401).json({ message: "Invalid or Expired Token" });
    }
}