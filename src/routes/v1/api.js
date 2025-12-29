import express from 'express'
import { userController } from '../../controller/userController.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get("/test-api", (req, res) => {
    res.send("Test API");
})

// Public route

router.post("/register", userController.createUser);
router.post("/login", userController.handleLogin);
router.delete("/logout", userController.handleLogout);
// router.put("/refresh-token", userController.refreshToken);

// Protected route

router.get("/access", authMiddleware.isAuthorized, (req, res) => {
    res.json({
        user: req.jwtDecoder
    });
})

export default router;