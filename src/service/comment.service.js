import mongoose from "mongoose";
import ApiError from "../util/ApiError.js";
import { StatusCodes } from "http-status-codes";
import Post from '../model/post.js'
import Comment from "../model/comment.js";
import { paginate } from "../util/paginate.js";

const createCommentService = async (data) => {
    // console.log(data);
    const { user_id, content, post_id } = data;
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Có lỗi xảy ra1");
    }
    if (!mongoose.Types.ObjectId.isValid(post_id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Có lỗi xảy ra");
    }

    // if (parent_id && !mongoose.Types.ObjectId.isValid(parent_id)) {
    //     throw new ApiError(
    //         StatusCodes.BAD_REQUEST,
    //         "Có lỗi xảy ra"
    //     );
    // }

    if (!content || content.trim() === "") {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Nội dung comment không được rỗng");
    }
    const post = await Post.findById(post_id);
    if (!post) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Bài viết không tồn tại");
    }

    // if (parent_id) {
    //     const parentComment = await Comment.findById(parent_id);

    //     if (!parentComment) {
    //         throw new ApiError(
    //             StatusCodes.NOT_FOUND,
    //             "Comment cha không tồn tại"
    //         );
    //     }

    //     if (parentComment.post.toString() !== post_id) {
    //         throw new ApiError(
    //             StatusCodes.BAD_REQUEST,
    //             "Reply không thuộc bài viết này"
    //         );
    //     }
    // }

    const comment = await Comment.create({
        content,
        user: user_id,
        post: post_id,
        parent_id: null
    });

    if (!comment) {
        throw new Error("Create comment failed");
    }

    await Post.findByIdAndUpdate(post_id, {
        $inc: { "stats.comment_count": 1 }
    });

    const populatedComment = await Comment.findById(comment._id)
        .populate("user", "username avatar");

    return populatedComment;
}

const getCommentsByPostService = async (postId, query) => {
    const post = await Post.findOne({
        _id: postId,
        is_published: true
    }).populate("author", "username avatar bio");

    if (!post) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "Bài viết không tồn tại"
        );
    }

    return await paginate({
        model: Comment,
        query: {
            post: post._id
        },
        page: query.page,
        limit: query.limit,
        sort: { createdAt: -1 },
        populate: {
            path: "user",
            select: "username avatar"
        }
    });
};

export const commentService = {
    createCommentService,
    getCommentsByPostService
}