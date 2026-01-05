import express from "express"
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { postController } from "../../controller/post.controller.js";

const router = express.Router();

router.get("/posts", postController.getPosts);
router.get("/posts/:slug", postController.getPostDetail);

// router.get(
//     "/posts/:id",
//     authMiddleware.isAuthorized,
//     postController.getPosts
// );

router.post(
    "/posts",
    authMiddleware.isAuthorized,
    postController.createPost
);


export default router;