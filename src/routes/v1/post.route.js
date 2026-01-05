import express from "express"
import { authMiddleware } from "../../middleware/authMiddleware";
import { postController } from "../../controller/post.controller";

const router = express.Router();

router.get(
    "/posts/:id",
    authMiddleware.isAuthorized,
    postController.getPosts
);

router.post(
    "/posts",
    authMiddleware.isAuthorized,
    postController.createPost
);

export default router;