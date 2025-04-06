import express from "express";
import userRouter from "./userRoutes.js";
import theaterOwnerRouter from "./theaterOwnerRoutes.js";
import adminRouter from "./adminRoutes.js";
import paymentRouter from "./paymentRoute.js";
import authRouter from "./authRoutes.js";
import { getAllMovies, getMovieById } from "../controllers/movieController.js";
import { verifyMovieAccess } from "../middlewares/authorizeRoles.js";
// import { getBookingDetails } from "../controllers/bookingController.js";
import { userForgotPassword } from "../controllers/userController.js";
import { ownerForgotPassword } from "../controllers/theaterOwnerController.js";

const router = express.Router();

// Mounting routers
router.use("/auth", authRouter); // "/api/auth"
router.use("/user", userRouter); // "/api/user"
router.use("/theaterOwner", theaterOwnerRouter); // "/api/theaterOwner"
router.use("/admin", adminRouter); // "/api/admin"
router.use("/payment", paymentRouter); // "/api/payment"

// Movie routes
router.get("/movies", verifyMovieAccess, getAllMovies);
router.get("/movies/:id", verifyMovieAccess, getMovieById);

// Booking route
// router.get("/bookings/:id", getBookingDetails);

// Forgot password route for User
router.post("/forgot-password/user", userForgotPassword);

// Forgot password route for Theater Owner
router.post("/forgot-password/theater", ownerForgotPassword);

export { router as apiRouter };
