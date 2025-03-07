import jwt from 'jsonwebtoken'
import { TheaterOwner } from '../models/theaterModel.js';

export const authorizeTheaterOwner = async (req,res,next) =>{
    try {
      const token =  req.cookies.token || req.headers["authorization"]?.split(" ")[1];
      if (!token) {
        return res
          .status(401)
          .json({ message: "Unauthorized, No Token Provided" });
      }
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      req.user = await TheaterOwner.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(404).json({ message: "User not found" });
      }
      next();
    } catch (error) {
         console.error("Token Verification Error:", error.message); 
         res.status(401).json({ message: "Invalid or Expired Token" });
    }
}