import express from 'express'
import authRoutes from './auth.route.js'
import userRoutes from './user.route.js'
import postRoutes from './post.route.js'
import commentRoutes from './comment.route.js'
import adminRoutes from './admin.route.js'
import { authMiddleware } from '../../middleware/authMiddleware.js'
import { rbacMiddleware } from '../../middleware/rbacMiddleware.js'

const router = express.Router();

router.use("/auth", authRoutes);

router.use("/users",
    authMiddleware.isAuthorized,
    authMiddleware.checkUserStatus,
    userRoutes);

router.use("/posts",
    authMiddleware.isAuthorized,
    authMiddleware.checkUserStatus,
    postRoutes);

router.use("/comments",
    authMiddleware.isAuthorized,
    authMiddleware.checkUserStatus,
    commentRoutes);

router.use("/admin",
    authMiddleware.isAuthorized,
    authMiddleware.checkUserStatus,
    rbacMiddleware.isValidPermission(['admin']),
    adminRoutes
);

export default router;