import express from "express";
import {
  changePassword,
  forgotPassword,
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
import { bookShow } from "../controllers/bookingController.js";

const router = express.Router();

// Authentication Routes
router.post("/signup", userSignup);
router.put("/login", userLogin);
router.post("/logout", userLogout);

// User Profile Routes
router.get("/profile", authorizeUser, userProfile);
router.put("/profile-edit", authorizeUser, profileEdit);
router.put("/profile-deactivate", authorizeUser, userDeactivate);

// Password Management
router.put("/password-change", authorizeUser, changePassword);
router.post("/password-forgot", forgotPassword);

// Check if user exists
router.get("/check-user", authorizeUser, userAvailable);

//Movie Booking
router.get("/movies", authorizeUser, getAllMovies);
// Route to book a show (protected route)
router.post("/book", authorizeUser,bookShow);



export default router;
