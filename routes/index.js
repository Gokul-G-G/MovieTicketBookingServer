import express from 'express'
import userRouter from './userRoutes.js'
import theaterOwnerRouter from './theaterOwnerRoutes.js'
import adminRouter from './adminRoutes.js'
import paymentRouter from './paymentRoute.js'

 // Creating an instance of an Express router
const router = express.Router()

// Defining route groups for different user roles
router.use('/user',userRouter) //  "/api/user"
router.use('/theater',theaterOwnerRouter) //  "/api/theater"
router.use('/admin',adminRouter) //  "/api/admin"
router.use('/payment',paymentRouter) //  "/api/payment"


export {router as apiRouter}