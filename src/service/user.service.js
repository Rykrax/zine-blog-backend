// import RefreshToken from '../model/refreshToken.js';
import { StatusCodes } from 'http-status-codes';
import User from '../model/user.js'
import Post from '../model/post.js'
import { jwtProvider } from '../provider/jwtProvider.js';
import ApiError from '../util/ApiError.js';
import { EMAIL_REGEX, PASSWORD_REGEX } from '../util/regex.js';
import bcrypt from 'bcrypt';
import 'dotenv/config'
import mongoose from 'mongoose';
const saltRounds = 10;

const createUserService = async (username, email, password) => {
    if (!username || !email || !password) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Vui lòng điền đầy đủ thông tin!");
    }

    if (!EMAIL_REGEX.test(email)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Email không đúng định dạng!");
    }

    if (!PASSWORD_REGEX.test(password)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Mật khẩu cần từ 6 ký tự gồm chữ hoa, thường và số.");
    }

    const exitsUser = await User.findOne({
        $or: [
            { email: email },
            { username: username }
        ]
    });

    if (exitsUser) {
        if (exitsUser.email === email) {
            throw new ApiError(StatusCodes.CONFLICT, "Email đã tồn tại!");
        } else {
            throw new ApiError(StatusCodes.CONFLICT, "Tên đăng nhập đã tồn tại!");
        }
    }

    const password_hash = await bcrypt.hash(password, saltRounds);

    const result = await User.create({
        username: username,
        email: email,
        password: password_hash,
        role: 'user'
    });
    return result;
}

const loginService = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Email/Mật khẩu không chính xác");
    }

    if (user.status === "banned" || user.status === "deleted") {
        throw new ApiError(StatusCodes.FORBIDDEN, "Tài khoản không còn quyền truy cập");
    }

    if (user.status !== 'active') {
        throw new ApiError(StatusCodes.FORBIDDEN, "Tài khoản không hợp lệ");
    }

    const isMatching = await bcrypt.compare(password, user.password);
    if (!isMatching) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Email/Password không chính xác");
    } else {
        const payload = {
            user_id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role
        }

        const access_token = await jwtProvider.generateToken(
            payload,
            process.env.ACCESS_TOKEN,
            process.env.ACCESS_TOKEN_EXPIRE
        );

        const refresh_token = await jwtProvider.generateToken(
            payload,
            process.env.REFRESH_TOKEN,
            process.env.REFRESH_TOKEN_EXPIRE
        );

        // await RefreshToken.create({
        //     userId: user._id,
        //     token: refresh_token,
        //     expiresAt: new Date(Date.now() + ms(process.env.REFRESH_TOKEN_EXPIRE))
        // });

        return {
            user: payload,
            accessToken: access_token,
            refreshToken: refresh_token
        }
    }
}

const changePasswordService = async (user_id, oldPassword, newPassword) => {
    if (!oldPassword || !newPassword) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Thiếu dữ liệu");
    }
    if (!PASSWORD_REGEX.test(newPassword)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Mật khẩu mới cần từ 6 ký tự gồm chữ hoa, thường và số.");
    }

    if (oldPassword === newPassword) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Mật khẩu mới trùng với mật khẩu cũ");
    }

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User ID không hợp lệ");
    }
    const user = await User.findById(user_id);
    console.log(user);
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Người dùng không tồn tại");
    }
    const isMatching = await bcrypt.compare(oldPassword, user.password);
    if (!isMatching) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Mật khẩu cũ không chính xác");
    }
    const password_hash = await bcrypt.hash(newPassword, saltRounds);
    user.password = password_hash;
    await user.save();
    return true;
}

// const logoutService = async (res) => {
//     try {
//         res.clearCookie('access_token', {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
//         });

//         res.clearCookie('refresh_token', {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
//         });

//         return {
//             message: 'Logout successfully'
//         };
//     } catch (err) {
//         console.log(err);
//     }
// }

const refreshTokenService = async (refreshToken) => {
    try {
        const decoder = await jwtProvider.verifyToken(
            refreshToken,
            process.env.REFRESH_TOKEN
        )
        // console.log("Decoder: ", decoder);
        const payload = {
            user_id: decoder.user_id,
            username: decoder.username,
            email: decoder.email,
            role: decoder.role
        }
        const access_token = await jwtProvider.generateToken(
            payload,
            process.env.ACCESS_TOKEN,
            process.env.ACCESS_TOKEN_EXPIRE,
        );
        return {
            // user: payload,
            accessToken: access_token,
        }
    } catch (err) {
        console.log(err.message);
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Refresh token không hợp lệ hoặc hết hạn!");
    }
}

const getAllUserService = async () => {
    return await User.find({
        status: { $in: ['active', 'banned'] }
    }).select("-password");
}

const getUserByIdService = async (_id) => {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User Id không hợp lệ");
    }

    const user = await User
        .findById(_id)
        .select("-password")
        .populate({
            path: 'saved_posts',
            select: 'title slug thumbnail createdAt stats content'
        });;

    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User không tồn tại");
    }
    if (user.status === 'deleted') {
        throw new ApiError(StatusCodes.NOT_FOUND, "User không tồn tại");
    }
    return user;
}

const getMeService = async (user_id) => {
    const user = await User
        .findById(user_id)
        .select("_id email username avatar role bio saved_posts")
        .lean();
    if (!user) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User Id không hợp lệ");
    }
    return {
        ...user,
        _id: user._id.toString()
    };
}

const toggleSavePostService = async (user_id, post_id) => {
    if (!mongoose.Types.ObjectId.isValid(post_id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Post ID không hợp lệ");
    }
    const post = await Post.findById(post_id);
    if (!post) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Bài viết không tồn tại");
    }
    const user = await User.findById(user_id);
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Người dùng không tồn tại");
    }
    const isSaved = user.saved_posts.some(id => id.toString() === post_id);

    if (isSaved) {
        await Promise.all([
            User.updateOne(
                { _id: user_id },
                { $pull: { saved_posts: post_id } }
            ),
            Post.updateOne(
                { _id: post_id },
                { $inc: { "stats.likes": -1 } }
            )
        ])
        return {
            status: 'unsaved',
            message: "Đã bỏ lưu bài viết"
        };
    } else {
        await Promise.all([
            User.updateOne(
                { _id: user_id },
                { $addToSet: { saved_posts: post_id } }
            ),
            Post.updateOne(
                { _id: post_id },
                { $inc: { "stats.likes": 1 } }
            )
        ])
        return {
            status: 'saved',
            message: "Đã lưu bài viết"
        };
    }
}

const deleteUserService = async (user_id, admin_id) => {
    const user = await User.findById(user_id);
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }
    await User.findByIdAndUpdate(
        user_id,
        {
            status: 'deleted',
            deletedAt: new Date(),
            deletedBy: admin_id
        },
        { new: true }
    );
}

const updateProfileService = async (data) => {
    const { user_id, username, bio, avatar } = data;
    const user = await User.findById(user_id);
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }
    const updates = {};

    if (username !== undefined) {
        const newUsername = username.trim();

        if (newUsername === '') {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                'Có lỗi xảy ra'
            );
        }

        if (newUsername !== user.username) {
            const existedUser = await User.findOne({
                username: newUsername,
                _id: { $ne: user_id }
            });

            if (existedUser) {
                throw new ApiError(
                    StatusCodes.CONFLICT,
                    'Username đã tồn tại'
                );
            }

            updates.username = newUsername;
        }
    }

    if (bio !== undefined) {
        const newBio = typeof bio === 'string' ? bio.trim() : bio;

        if (newBio !== user.bio) {
            updates.bio = newBio;
        }
    }

    if (avatar !== undefined) {
        const newAvatar = avatar.trim();

        if (newAvatar === '') {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                'Có lỗi xảy ra'
            );
        }

        if (!newAvatar.includes('cloudinary.com')) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                'Có lỗi xảy ra'
            );
        }

        if (newAvatar !== user.avatar) {
            updates.avatar = newAvatar;
        }
    }

    // if (Object.keys(updates).length === 0) {
    //     throw new ApiError(
    //         StatusCodes.BAD_REQUEST,
    //         'Không có dữ liệu nào để cập nhật'
    //     );
    // }

    return await User.findByIdAndUpdate(
        user_id,
        updates,
        { new: true }
    ).select('_id email username avatar role bio saved_posts');
}

// const banUserService = async (data) => {
//     const { user_id, admin_id, reason } = data;
//     if (!mongoose.Types.ObjectId.isValid(user_id)) {
//         throw new ApiError(StatusCodes.BAD_REQUEST, "ID không hợp lệ");
//     }
//     if (!mongoose.Types.ObjectId.isValid(admin_id)) {
//         throw new ApiError(StatusCodes.BAD_REQUEST, "ID không hợp lệ");
//     }
//     const user = await User.findById(user_id);
//     if (!user) {
//         throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy user");
//     }
//     if (user.status === "banned") {
//         throw new ApiError(StatusCodes.BAD_REQUEST, "User đã bị khóa");
//     }
//     if (user.status === "deleted") {
//         throw new ApiError(StatusCodes.BAD_REQUEST, "User đã bị xóa");
//     }
//     // if (user.role === "admin") {
//     //     throw new ApiError(StatusCodes.FORBIDDEN, "Không thể khóa admin");
//     // }
//     // if (user_id === admin_id) {
//     //     throw new ApiError(StatusCodes.FORBIDDEN, "Không thể khóa chính mình");
//     // }
//     const updateUser = await User.findByIdAndUpdate(
//         user_id,
//         {
//             status: "banned",
//             bannedAt: new Date(),
//             bannedBy: admin_id,
//             banReason: reason.trim()
//         },
//         { new: true }
//     ).select("-password");
//     return updateUser;
// }

// const unbanUserService = async (user_id) => {
//     if (!mongoose.Types.ObjectId.isValid(user_id)) {
//         throw new ApiError(StatusCodes.BAD_REQUEST, "ID không hợp lệ");
//     }
//     const user = await User.findById(user_id);
//     if (!user) {
//         throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy user");
//     }
//     if (user.status === "deleted") {
//         throw new ApiError(StatusCodes.BAD_REQUEST, "User đã bị xóa");
//     }
//     if (user.status === "active") {
//         throw new ApiError(StatusCodes.BAD_REQUEST, "User không trong trạng thái bị khóa");
//     }
//     const updatedUser = await User.findByIdAndUpdate(
//         user_id,
//         {
//             status: 'active',
//             bannedAt: null,
//             bannedBy: null,
//             banReason: ""
//         },
//         { new: true }
//     ).select('-password');

//     return updatedUser;
// }

const updateUserStatusService = async (data) => {
    const { user_id, admin_id, status, banReason } = data;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User ID không hợp lệ");
    }

    if (!mongoose.Types.ObjectId.isValid(admin_id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Admin ID không hợp lệ");
    }
    if (!["active", "banned"].includes(status)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Status không hợp lệ");
    }

    const user = await User.findById(user_id);
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy user");
    }
    if (user.status === "deleted") {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User đã bị xóa");
    }

    const update = {};

    if (status === "banned") {
        if (user.status === "banned") {
            throw new ApiError(StatusCodes.BAD_REQUEST, "User đã bị khóa");
        }

        if (user_id.toString() === admin_id.toString()) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Không thể khóa chính mình");
        }

        update.status = "banned";
        update.bannedAt = new Date();
        update.bannedBy = admin_id;
        update.banReason = banReason?.trim() ?? "";
    }

    if (status === "active") {
        if (user.status === "active") {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                "User không trong trạng thái bị khóa"
            );
        }

        update.status = "active";
        update.bannedAt = null;
        update.bannedBy = null;
        update.banReason = "";
    }

    const updatedUser = await User.findByIdAndUpdate(
        user_id,
        update,
        { new: true }
    ).select("-password");

    return updatedUser;
}

const updateUserRoleService = async (user_id, admin_id, role) => {
    const ALLOW_ROLES = ["user", "admin"];
    if (!ALLOW_ROLES.includes(role)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Role không hợp lệ");
    }
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User không hợp lệ");
    }
    const user = await User.findById(user_id);
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy user");
    }
    const updateUser = await User.findByIdAndUpdate(
        user_id,
        { role },
        { new: true }
    ).select("-password");
    return updateUser;
}

export const userService = {
    createUserService,
    loginService,
    changePasswordService,
    refreshTokenService,
    getAllUserService,
    getUserByIdService,
    getMeService,
    toggleSavePostService,
    deleteUserService,
    updateProfileService,
    updateUserStatusService,
    updateUserRoleService
}