import express from "express";
import {
  changePassword,
  userAvailable,
  userSignup,
  userLogin,
  userLogout,
  userProfile,
  userDeactivate,
  profileEdit,
} from "../controllers/userController.js";
import { authorizeUser } from "../middlewares/userAuthMiddleware.js";
import { getAllMovies } from "../controllers/movieController.js";
import { bookShow, getUserBookings } from "../controllers/bookingController.js";
import { loginUser } from "../controllers/authController.js";
import { getAllShows, getSeats } from "../controllers/showController.js";


const router = express.Router();

// Authentication Routes
router.post("/signup", userSignup);
router.put("/login",loginUser, userLogin);
router.post("/logout", userLogout);

// User Profile Routes
router.get("/profile", authorizeUser, userProfile);
router.put("/profile-edit", authorizeUser, profileEdit);
router.put("/profile-deactivate", authorizeUser, userDeactivate);

// Password Management
router.put("/password-change", authorizeUser, changePassword);

// Check if user exists
router.get("/check-user", authorizeUser, userAvailable);

//Movie Booking
router.get("/movies", authorizeUser, getAllMovies);
// Route to book a show (protected route)

router.get("/book/:id", authorizeUser,getAllShows);
router.post("/booked", authorizeUser,bookShow);
router.get("/booked/:showId",authorizeUser,getSeats)

// ✅ Add User Bookings Route
router.get("/bookings", authorizeUser, getUserBookings);



export default router;
