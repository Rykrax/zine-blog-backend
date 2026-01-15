import { StatusCodes } from "http-status-codes";
import { postService } from "../service/post.service.js";

const createPost = async (req, res, next) => {
    try {
        const { title, content, thumbnail, is_published } = req.body;
        const data = {
            title,
            content,
            thumbnail,
            is_published,
            author: req.jwtDecoder.user_id
        }
        const post = await postService.createPostService(data);

        return res.status(StatusCodes.OK).json({
            message: "Đăng bài thành công",
            data: post
        });
    } catch (err) { next(err); }
};

// const getPosts = async (req, res) => {
//     try {
//         const { id } = req.params;
//         console.log(id);
//         const posts = await postService.getAllPostService(id, req.query);
//         // return res.status(StatusCodes.OK).json({
//         //     message: "Load dữ liệu thành công",
//         //     data: posts
//         // });
//         return res.status(StatusCodes.OK).json({
//             message: "Load dữ liệu thành công",
//             data: posts.items,
//             pagination: posts.pagination
//         });
//     } catch (error) {
//         return res.status(StatusCodes.BAD_REQUEST).json({
//             message: error.message
//         });
//     }
// }

const getPosts = async (req, res) => {
    try {
        const posts = await postService.getAllPostService(req.query);

        const items = posts.items.map(post => ({
            ...post.toObject(),
            fullSlug: `${post.slug}-${post._id}`
        }));

        return res.status(StatusCodes.OK).json({
            message: "Load dữ liệu thành công",
            data: items,
            pagination: posts.pagination
        });
    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: error.message
        });
    }
}

const getPostDetail = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await postService.getPostDetailService(postId);
        if (!post) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Bài viết không tồn tại"
            });
        }

        res.status(StatusCodes.OK).json({
            message: "Load dữ liệu thành công",
            data: post
        });
    } catch (err) {
        console.error(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Lỗi server"
        });
    }
}

export const postController = {
    createPost,
    getPosts,
    getPostDetail
};