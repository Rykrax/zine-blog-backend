import express from 'express'
import { commentController } from '../../controller/comment.controller.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post("/comments", authMiddleware.isAuthorized, commentController.createComment);

export default router;