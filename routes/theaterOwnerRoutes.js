import express from "express";
import {
  getMovies,
  ownerForgotPassword,
  ownerLogin,
  ownerLogout,
  ownerPasswordChange,
  OwnerProfile,
  ownerProfileDeactivate,
  ownerProfileEdit,
  ownerSignup,
} from "../controllers/theaterOwnerController.js";
import { authorizeTheaterOwner } from "../middlewares/theaterOwnerAuthMiddleware.js";
import { addMovie,deleteMovie,updateMovie } from "../controllers/movieController.js";
import { authorizedTheaterOwnerOrAdmin, verifyMovieAccess } from "../middlewares/authorizeRoles.js";


const router = express.Router();

// Authentication Routes
router.post("/signup", ownerSignup);
router.put("/login", ownerLogin);
router.post("/logout", ownerLogout);

// User Profile Routes
router.get("/profile", authorizeTheaterOwner, OwnerProfile);
router.put("/profile-edit", authorizeTheaterOwner, ownerProfileEdit);
router.put(
  "/profile-deactivate",
  authorizeTheaterOwner,
  ownerProfileDeactivate
);

// Password Management
router.put("/password-change", authorizeTheaterOwner, ownerPasswordChange);
router.post("/password-forgot", ownerForgotPassword);

//Movie Management
router.get("/movies", authorizeTheaterOwner, getMovies); //Get All movies
router.post("/movies",verifyMovieAccess,authorizedTheaterOwnerOrAdmin,addMovie);//Add Movie
router.put("/movies/:id",verifyMovieAccess,authorizedTheaterOwnerOrAdmin,updateMovie); //Edit Movie Details
router.delete("/movies/:id",verifyMovieAccess,authorizedTheaterOwnerOrAdmin,deleteMovie); //Delete Movie

//Showtime Management
router.get("/showtimes"); //All Shows
router.post("/showtimes"); // Add show
router.put("/showtimes/:id"); // Edit Show
router.delete("/showtimes/:id"); // Delete Show

//Booking management
router.get("/bookings"); // get all bookings

//Earnings Report
router.get("/earnings"); // Earnings report

// Customer Feedback
router.get("/feedbacks");
router.post("/feedbacks/:id/reply");

// Check if user exists
router.get("/check-user");

export default router;
