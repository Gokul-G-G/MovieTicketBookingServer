import express from "express";
import {
  changePassword,
  forgotPassword,
  userAvailable,
  userSignup,
} from "../controllers/userController.js";
import { userLogin } from "../controllers/userController.js";
import { userLogout } from "../controllers/userController.js";
import { userProfile } from "../controllers/userController.js";
import {authorizeUser} from "../middlewares/userAuthMiddleware.js"
import { profileEdit } from "../controllers/userController.js";
import { userDeactivate } from "../controllers/userController.js";

const router = express.Router();

// Authentication Routes
router.post("/signup", userSignup);
router.put("/login", userLogin);
router.post("/logout", userLogout);

// User Profile Routes
router.get("/profile", authorizeUser, userProfile);
router.put("/profile-edit",authorizeUser, profileEdit);
router.put("/profile-deactivate",authorizeUser, userDeactivate);

// Password Management
router.put("/password-change",authorizeUser, changePassword);
router.post("/password-forgot", forgotPassword);

// Check if user exists
router.get("/check-user",authorizeUser, userAvailable);

export default router;
