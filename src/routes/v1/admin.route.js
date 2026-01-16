import express from 'express'
import { adminController } from '../../controller/admin/admin.user.controller.js';

const router = express.Router();

router.get("/users/", adminController.getUsers)
router.get("/users/:id", adminController.getUserById);
router.patch("/users/:id", adminController.updateUserProfile);
router.patch("/users/:id/status", adminController.updateUserStatus);
router.patch("/users/:id/role", adminController.updateUserRole);
router.delete("/users/:id", adminController.softDeleteUser);

export default router;