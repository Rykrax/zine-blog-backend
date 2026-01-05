import mongoose, { Schema } from "mongoose";

const CommentSchema = new Schema({
    content: {
        type: String,
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },

    parent_id: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },

    likes: { type: Number, default: 0 }
}, {
    timestamps: true
});

const Comment = mongoose.model('Comment', CommentSchema);

export default Comment;