import express from 'express'
import { commentController } from '../../controller/comment.controller.js';

const router = express.Router();

router.post("/", commentController.createComment);

export default router;