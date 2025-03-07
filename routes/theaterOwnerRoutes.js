import express from "express";
import {
  ownerLogin,
  ownerLogout,
  ownerPasswordChange,
  OwnerProfile,
  ownerProfileDeactivate,
  ownerProfileEdit,
  ownerSignup,
} from "../controllers/theaterOwnerController.js";
import { authorizeTheaterOwner } from "../middlewares/theaterOwnerAuthMiddleware.js";


const router = express.Router();

// Authentication Routes
router.post("/signup", ownerSignup);
router.put("/login", ownerLogin);
router.post("/logout", ownerLogout);

// User Profile Routes
router.get("/profile",authorizeTheaterOwner, OwnerProfile);
router.put("/profile-edit", authorizeTheaterOwner, ownerProfileEdit);
router.put("/profile-deactivate", authorizeTheaterOwner, ownerProfileDeactivate);

// Password Management
router.put("/password-change", authorizeTheaterOwner, ownerPasswordChange);
router.post("/password-forgot");

//Movie Management
router.get("/movies");
router.post("/movies");
router.put("/movies/:id");
router.delete("/movies/:id");

//Showtime Management
router.get("/showtimes");
router.post("/showtimes");
router.put("/showtimes/:id");
router.delete("/showtimes/:id");

//Booking management
router.get("/bookings");

//Earnings Report
router.get("/earnings");

// Customer Feedback
router.get("/feedbacks");
router.post("/feedbacks/:id/reply");

// Check if user exists
router.get("/check-user");

export default router;
