import express from "express"
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { postController } from "../../controller/post.controller.js";
import { commentController } from "../../controller/comment.controller.js";

const router = express.Router();

router.get("/posts", postController.getPosts);
router.get("/posts/:slug-:postId", postController.getPostDetail);

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
router.get(
    "/posts/:slug-:postId/comment",
    authMiddleware.isAuthorized,
    commentController.getComment
)

router.post(
    "/posts/:slug-:postId/comment",
    authMiddleware.isAuthorized,
    commentController.createComment
)

export default router;