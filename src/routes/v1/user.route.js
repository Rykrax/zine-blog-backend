import express from 'express'
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { userController } from '../../controller/user.controller.js';

const router = express.Router();

router.get("/users", authMiddleware.isAuthorized, userController.getUsers);
router.get("/users/:id", authMiddleware.isAuthorized, userController.getUserById);
router.put("/change-password", authMiddleware.isAuthorized, userController.changePassword);

export default router;