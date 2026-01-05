import express from 'express'
import { userController } from "../../controller/user.controller.js";
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { cloudinaryController } from '../../controller/cloudinary.controller.js';

const router = express.Router();

router.post("/register", userController.createUser);

router.post("/login", userController.login);

router.delete("/logout", userController.logout);

router.put("/refresh-token", userController.refreshToken);

router.get("/access", authMiddleware.isAuthorized, (req, res) => {
    res.json({
        user: req.jwtDecoder
    });
})

router.get(
    "/cloudinary-sign",
    authMiddleware.isAuthorized,
    cloudinaryController.getUploadSignature
);

export default router;