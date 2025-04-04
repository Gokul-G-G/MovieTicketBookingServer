import express from 'express'
import userRouter from './userRoutes.js'
import theaterOwnerRouter from './theaterOwnerRoutes.js'
import adminRouter from './adminRoutes.js'
import paymentRouter from './paymentRoute.js'
import authRouter from "./authRoutes.js";
import { getAllMovies, getMovieById } from '../controllers/movieController.js'
import { verifyMovieAccess } from '../middlewares/authorizeRoles.js'
import { getBookingDetails } from '../controllers/bookingController.js'

 // Creating an instance of an Express router
const router = express.Router()

// Defining route groups for different user roles
router.use('/auth',authRouter) // "/api/auth"
router.use('/user',userRouter) //  "/api/user"
router.use("/theaterOwner", theaterOwnerRouter); //  "/api/theater"
router.use('/admin',adminRouter) //  "/api/admin"
router.use('/payment',paymentRouter) //  "/api/payment"
router.get("/movies/:id", verifyMovieAccess, getMovieById);
router.use('/movies',verifyMovieAccess,getAllMovies)
router.use('/bookings/:id',getBookingDetails)



export {router as apiRouter}