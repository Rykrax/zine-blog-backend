import mongoose, { Schema } from "mongoose";
import { USERNAME_REGEX, EMAIL_REGEX } from "../util/regex.js";

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [USERNAME_REGEX, "Username không hợp lệ!"]
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [EMAIL_REGEX, "Email không hợp lệ!"]
    },
    password: {
        type: String,
    },
    avatar: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: ''
    },

    saved_posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }],

    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },

    status: {
        type: String,
        enum: ["active", "banned", "deleted"],
        default: "active",
        index: true
    },

    bannedAt: {
        type: Date,
        default: null
    },

    bannedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    banReason: {
        type: String,
        default: ""
    },

    deletedAt: {
        type: Date,
        default: null
    },

    deletedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', UserSchema);

export default User;