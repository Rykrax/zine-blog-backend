import mongoose, { Schema } from "mongoose";

const PostSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        index: true
    },
    content: String,
    thumbnail: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true
    },
    stats: {
        views: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        comment_count: { type: Number, default: 0 }
    },
    is_published: { type: Boolean, default: true }
}, {
    timestamps: true
});

export default mongoose.model("Post", PostSchema);
