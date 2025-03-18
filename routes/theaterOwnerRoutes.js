import express from "express";
import {
  getBookings,
  getMovie,
  getShows,
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
import {
  addMovie,
  deleteMovie,
  getAllMovies,
  updateMovie,
} from "../controllers/movieController.js";
import {
  authorizedTheaterOwnerOrAdmin,
  verifyMovieAccess,
} from "../middlewares/authorizeRoles.js";
import {
  addShow,
  deleteShow,
  editShow,
} from "../controllers/showController.js";
import { loginUser } from "../controllers/authController.js";
const router = express.Router();

// Authentication Routes
router.post("/signup", ownerSignup);
router.put("/login",loginUser,ownerLogin);
router.post("/logout", ownerLogout);

// User Profile Routes
router.get("/profile", authorizeTheaterOwner, OwnerProfile);
router.put("/profile-edit", authorizeTheaterOwner, ownerProfileEdit);
router.put("/profile-deactivate",authorizeTheaterOwner,ownerProfileDeactivate);

// Password Management
router.put("/password-change", authorizeTheaterOwner, ownerPasswordChange);
router.post("/password-forgot", ownerForgotPassword);

//Movie Management
router.get("/movies",authorizeTheaterOwner,getAllMovies)
router.get("/movie", authorizeTheaterOwner, getMovie); //All movies created by admin
router.post("/movie",verifyMovieAccess,authorizedTheaterOwnerOrAdmin,addMovie); //Add Movie
router.put("/movies/:id",verifyMovieAccess,authorizedTheaterOwnerOrAdmin,updateMovie); //Edit Movie 
router.delete("/movies/:id",verifyMovieAccess,authorizedTheaterOwnerOrAdmin,deleteMovie); //Delete Movie

//Showtime Management
router.get("/showtimes", authorizeTheaterOwner, getShows); //All Shows
router.post("/showtimes", authorizeTheaterOwner, addShow); // Add show
router.put("/showtimes/:id", authorizedTheaterOwnerOrAdmin, editShow); // Edit Show
router.delete("/showtimes/:id", authorizeTheaterOwner, deleteShow); // Delete Show

//Booking management
 router.get("/bookings",authorizeTheaterOwner,getBookings); // All bookings

//Earnings Report
// router.get("/earnings"); // Earnings report

// Customer Feedback
// router.get("/feedbacks");
// router.post("/feedbacks/:id/reply");

// Check if user exists
router.get("/check-user");

export default router;
