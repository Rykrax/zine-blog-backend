import express from 'express'
import { rbacMiddleware } from '../../middleware/rbacMiddleware.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { adminController } from '../../controller/admin/admin.user.controller.js';

const router = express.Router();

router.get("/users/",
    authMiddleware.isAuthorized,
    rbacMiddleware.isValidPermission(['admin']),
    adminController.getUsers
)

router.get("/users/:id",
    authMiddleware.isAuthorized,
    rbacMiddleware.isValidPermission(['admin']),
    adminController.getUserById
);

router.put("/users/:id",
    authMiddleware.isAuthorized,
    rbacMiddleware.isValidPermission(['admin']),
    adminController.deleteUser
);

export default router;