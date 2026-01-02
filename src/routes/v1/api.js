import express from 'express'
import { userController } from '../../controller/user.controller.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get("/test-api", (req, res) => {
    res.send("Test API");
})

// Public route

router.post("/register", userController.createUser);
router.post("/login", userController.login);
router.delete("/logout", userController.logout);
router.put("/refresh-token", userController.refreshToken);

// Protected route

router.get("/access", authMiddleware.isAuthorized, (req, res) => {
    res.json({
        user: req.jwtDecoder
    });
})

router.get("/users", authMiddleware.isAuthorized, userController.getUsers);
router.get("/users/:id", authMiddleware.isAuthorized, userController.getUserById);

export default router;