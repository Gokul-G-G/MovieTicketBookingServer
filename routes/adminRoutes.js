import express from "express";
import { adminLogin, adminLogout, adminProfile, deleteTheater, deleteUser, getAdminBookingsData, getAdminNotifications, getAllTheater, getAllUsers, markNotificationAsReadAndVerify} from "../controllers/adminController.js";
import { authorizedAdmin } from "../middlewares/adminAuthMiddleware.js";
import { authorizedTheaterOwnerOrAdmin, verifyMovieAccess } from "../middlewares/authorizeRoles.js";
import { addMovie,updateMovie,deleteMovie,getAllMovies } from "../controllers/movieController.js";
import { loginUser } from "../controllers/authController.js";
import upload from "../middlewares/uploadMiddleware.js";

const   router = express.Router();

//Admin Authentication Routes
router.post("/login",loginUser,adminLogin);
router.post("/logout", authorizedAdmin,adminLogout);
router.get("/profile", authorizedAdmin,adminProfile);

//Admin Notification control Routes
router.get("/notifications",authorizedAdmin,getAdminNotifications)
router.put("/notifications/:id",authorizedAdmin,markNotificationAsReadAndVerify)

//User Management Routes
router.get("/users", authorizedAdmin,getAllUsers);
router.delete("/users/:id", authorizedAdmin,deleteUser);

//Theater Management Routes
router.get("/theaters", authorizedAdmin,getAllTheater);
router.delete("/theaters/:id", authorizedAdmin,deleteTheater);

//Movie Management Routes
router.get("/movies", authorizedAdmin,getAllMovies);
router.post("/movies", authorizedAdmin, upload.fields([{ name: "posterImage" }, { name: "bannerImage" }]), addMovie); // ✅ Upload images
router.put("/movies/:id", authorizedAdmin, upload.fields([{ name: "posterImage" }, { name: "bannerImage" }]), updateMovie); // ✅ Update with images
router.delete("/movies/:id",verifyMovieAccess,authorizedTheaterOwnerOrAdmin,deleteMovie); //delete movie

//Booking Reports Routes
router.get("/bookings", authorizedAdmin,getAdminBookingsData);
// router.get("/revenue", authorizedAdmin,);

//Support & Feedback Routes
// router.get("/feedback", authorizedAdmin,);
// router.delete("/feedback/:id", authorizedAdmin,);

export default router;
