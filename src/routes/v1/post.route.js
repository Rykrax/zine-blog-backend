import express from "express"
import { postController } from "../../controller/post.controller.js";
import { commentController } from "../../controller/comment.controller.js";

const router = express.Router();

router.get("/", postController.getPosts);
router.get("/:slug-:postId", postController.getPostDetail);

// router.get(
//     "/posts/:id",
//     authMiddleware.isAuthorized,
//     postController.getPosts
// );

router.post(
    "/",
    postController.createPost
);
router.get(
    "/:slug-:postId/comment",
    commentController.getComment
)

router.post(
    "/:slug-:postId/comment",
    commentController.createComment
)

export default router;