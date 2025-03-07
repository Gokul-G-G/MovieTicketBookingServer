import express from 'express'
import userRouter from './userRoutes.js'
import theaterOwnerRouter from './theaterOwnerRoutes.js'
import adminRouter from './adminRoutes.js'


const router = express.Router()

router.use('/user',userRouter)
router.use('/theater',theaterOwnerRouter)
router.use('/admin',adminRouter)

export {router as apiRouter}