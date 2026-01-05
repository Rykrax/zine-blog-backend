// import RefreshToken from '../model/refreshToken.js';
import { StatusCodes } from 'http-status-codes';
import User from '../model/user.js'
import { jwtProvider } from '../provider/jwtProvider.js';
import ApiError from '../util/apiError.js';
import { EMAIL_REGEX, PASSWORD_REGEX } from '../util/regex.js';
import bcrypt from 'bcrypt';
import 'dotenv/config'
import mongoose from 'mongoose';
const saltRounds = 10;

const createUserService = async (username, email, password) => {
    if (!username || !email || !password) {
        throw new ApiError(400, "Vui lòng điền đầy đủ thông tin!");
    }

    if (!EMAIL_REGEX.test(email)) {
        throw new ApiError(400, "Email không đúng định dạng!");
    }

    if (!PASSWORD_REGEX.test(password)) {
        throw new ApiError(400, "Mật khẩu cần từ 6 ký tự gồm chữ hoa, thường và số.");
    }

    const exitsUser = await User.findOne({
        $or: [
            { email: email },
            { username: username }
        ]
    });

    if (exitsUser) {
        if (exitsUser.email === email) {
            throw new ApiError(409, "Email đã tồn tại!");
        } else {
            throw new ApiError(409, "Tên đăng nhập đã tồn tại!");
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
        throw new ApiError(400, "Mật khẩu mới cần từ 6 ký tự gồm chữ hoa, thường và số.");
    }

    if (oldPassword === newPassword) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Mật khẩu mới trùng với mật khẩu cũ");
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
            email: decoder.email
        }
        const access_token = await jwtProvider.generateToken(
            payload,
            process.env.ACCESS_TOKEN,
            process.env.ACCESS_TOKEN_EXPIRE
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
    return await User.find().select("-password");
}

const getUserByIdService = async (_id) => {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User Id không hợp lệ");
    }

    const user = await User.findById(_id).select("-password");

    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User không tồn tại");
    }
    return user;
}

export const userService = {
    createUserService,
    loginService,
    changePasswordService,
    refreshTokenService,
    getAllUserService,
    getUserByIdService
}