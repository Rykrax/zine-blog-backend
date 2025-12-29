// import RefreshToken from '../model/refreshToken.js';
import User from '../model/user.js'
import { jwtProvider } from '../provider/jwtProvider.js';
import ApiError from '../util/apiError.js';
import { EMAIL_REGEX, PASSWORD_REGEX } from '../util/regex.js';
import bcrypt from 'bcrypt';
const saltRounds = 10;
import 'dotenv/config'
import ms from 'ms'

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
        throw new ApiError(404, "Email/Mật khẩu không chính xác");
    }
    if (user) {
        const isMatching = await bcrypt.compare(password, user.password);
        if (!isMatching) {
            throw new ApiError(401, "Email/Password không chính xác");
        } else {
            const payload = {
                user_id: user._id.toString(),
                username: user.username,
                email: user.email
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
    return {
        status: 200,
        message: "Đăng nhập thành công!"
    }
}

const logoutService = async (res) => {
    try {
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });

        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });

        return {
            message: 'Logout successfully'
        };
    } catch (err) {
        console.log(err);
    }
}

// const refreshTokenService = async (req) => {
//     try {
//         const refreshTokenFromCookie = req?.cookies?.refresh_token;

//         const decoder = await jwtProvider.verifyToken(
//             refreshTokenFromCookie,
//             process.env.REFRESH_TOKEN
//         )
//         console.log(decoder);
//         const payload = {
//             user_id: decoder.user_id,
//             username: decoder.username,
//             email: decoder.email
//         }
//         const access_token = await jwtProvider.generateToken(
//             payload,
//             process.env.ACCESS_TOKEN,
//             process.env.ACCESS_TOKEN_EXPIRE
//         );
//         return {
//             // user: payload,
//             accessToken: access_token,
//         }
//     } catch (err) {
//         console.log(err.message);
//         throw new ApiError(401, "Refresh token không hợp lệ hoặc hết hạn!");
//     }
// }

export {
    createUserService,
    loginService,
    logoutService,
    // refreshTokenService
}