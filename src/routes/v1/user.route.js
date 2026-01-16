import express from 'express'
import { userController } from '../../controller/user.controller.js';

const router = express.Router();

router.get("/", userController.getUsers);
router.get("/me", userController.getMe);
router.put("/change-password", userController.changePassword);
router.post("/save-post", userController.toggleSavePost);
router.put("/update-profile", userController.updateProfile);
router.get("/:id", userController.getUserById);

export default router;