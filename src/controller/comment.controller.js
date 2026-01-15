import { StatusCodes } from "http-status-codes";
import { commentService } from "../service/comment.service.js";

const createComment = async (req, res, next) => {
    try {
        const data = {
            ...req.body,
            user_id: req.jwtDecoder.user_id
        }
        const comment = await commentService.createCommentService(data);
        // console.log(comment);
        res.status(StatusCodes.OK).json({
            message: "Comment thành công",
            data: comment
        })
    } catch (err) { next(err); }
}

const getComment = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const comment = await commentService.getCommentsByPostService(postId, req.query);
        res.status(StatusCodes.OK).json({
            message: "Load dữ liệu thành công",
            data: comment.items,
            pagination: comment.pagination
        })
    } catch (err) { next(err); }
}


export const commentController = {
    createComment,
    getComment
}