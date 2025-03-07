import express from "express";
import { adminLogin, adminLogout, adminProfile, deleteTheater, deleteUser, getAllTheater, getAllUsers } from "../controllers/adminController.js";
import { authorizedAdmin } from "../middlewares/adminAuthMiddleware.js";
import { verifyMovieAccess } from "../middlewares/authorizeRoles.js";
import { addMovie } from "../controllers/movieController.js";

const router = express.Router();

//Admin Authentication Routes
router.post("/login",adminLogin);
router.post("/logout", authorizedAdmin,adminLogout);
router.get("/profile", authorizedAdmin,adminProfile);

//User Management Routes
router.get("/users", authorizedAdmin,getAllUsers);
router.delete("/users/:id", authorizedAdmin,deleteUser);

//Theater Management Routes
router.get("/theaters", authorizedAdmin,getAllTheater);
router.delete("/theaters/:id", authorizedAdmin,deleteTheater);

//Movie Management Routes
// router.get("/movies", authorizedAdmin, getAllMovies);
router.post("/movies",verifyMovieAccess,authorizedAdmin,addMovie);
// router.put("/movies/:id", authorizedAdmin, updateMovie);
// router.delete("/movies/:id", authorizedAdmin, deleteMovie);

//Booking Reports Routes
// router.get("/bookings", authorizedAdmin, getAllBookings);
// router.get("/revenue", authorizedAdmin, getRevenue);

//Support & Feedback Routes
// router.get("/feedback", authorizedAdmin, getFeedback);
// router.delete("/feedback/:id", authorizedAdmin, deleteFeedback);

export default router;
