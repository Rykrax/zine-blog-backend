import { StatusCodes } from 'http-status-codes';
import { jwtProvider } from '../provider/jwtProvider.js'
import User from '../model/user.js';

const isAuthorized = async (req, res, next) => {
    const accessToken = req.cookies?.access_token;
    console.log(req.cookie);
    console.log(`Access token from cookie: ${req.cookies.access_token}`);
    if (!accessToken) {
        res.status(StatusCodes.BAD_REQUEST).json({
            message: "Unauthorized (Not Found)"
        })
        return;
    }
    try {
        const accessTokenDecoder = await jwtProvider.verifyToken(
            accessToken,
            process.env.ACCESS_TOKEN
        )
        const user = await User.findById(accessTokenDecoder.user_id)
            .select("_id username email role status");

        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "User not found"
            });
        }

        req.jwtDecoder = {
            user_id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role,
            iat: accessTokenDecoder.iat,
            exp: accessTokenDecoder.exp
        };
        next();
    } catch (error) {
        console.log("Lỗi from middleware:", error.message);
        if (error.message?.includes('jwt expired')) {
            res.status(StatusCodes.GONE).json({
                message: "Need to refresh token"
            })
            return;
        }
        res.status(StatusCodes.BAD_REQUEST).json({
            message: "Unathorized (Log in)"
        })
    }
}

const checkUserStatus = async (req, res, next) => {
    try {
        const user_id = req.jwtDecoder?.user_id;
        console.log(user_id);
        const user = await User.findById(user_id).select("status");
        if (!user) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Unauthorized (Not Found)"
            })

        }
        if (user.status === "banned") {
            return res.status(StatusCodes.FORBIDDEN).json({
                message: "Tài khoản đã bị khóa"
            });
        }

        if (user.status === "deleted") {
            return res.status(StatusCodes.FORBIDDEN).json({
                message: "Tài khoản đã bị xóa"
            });
        }
        next();
    } catch (err) { next(err); }
}

export const authMiddleware = {
    isAuthorized,
    checkUserStatus
}