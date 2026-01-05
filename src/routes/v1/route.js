import express from 'express'
import authRoutes from './auth.route.js'
import userRoutes from './user.route.js'
import postRoutes from './user.route.js'
import 'dotenv/config'

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/post", postRoutes);

export default router;