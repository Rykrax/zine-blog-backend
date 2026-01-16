import ms from "ms";
import { userService } from "../service/user.service.js";
import { StatusCodes } from "http-status-codes";

const createUser = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const data = await userService.createUserService(username, email, password);
        // console.log(data);
        return res.status(StatusCodes.CREATED).json({ message: "Tạo tài khoản thành công!" });
    } catch (err) { next(err) }
}

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { user, accessToken, refreshToken } = await userService.loginService(email, password);

        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'strict' : 'lax',
            maxAge: ms('7d')
        });

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'strict' : 'lax',
            maxAge: ms('7d')
        });

        return res.status(200).json({
            message: "Login successful",
            data: {
                user,
                accessToken,
                refreshToken
            }
        });
    } catch (err) { next(err) }
}

const logout = async (req, res) => {
    const isProd = process.env.NODE_ENV === "production";

    res.clearCookie("access_token", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "strict" : "lax"
    });

    res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "strict" : "lax"
    });

    return res.status(StatusCodes.OK).json({
        message: "Logout successfully"
    });
};

const changePassword = async (req, res, next) => {
    try {
        const user_id = req.jwtDecoder.user_id;
        const { oldPassword, newPassword } = req.body;
        await userService.changePasswordService(user_id, oldPassword, newPassword);
        return res.status(StatusCodes.OK).json({
            message: "Đổi mật khẩu thành công"
        })
    } catch (err) { next(err); }
}

const updateProfile = async (req, res, next) => {
    try {
        const data = {
            ...req.body,
            user_id: req.jwtDecoder.user_id
        }
        const user = await userService.updateProfileService(data);
        console.log(user);
        res.status(StatusCodes.OK).json({
            message: "Cập nhật thành công",
            user
        })
    } catch (err) { next(err); }
}

const refreshToken = async (req, res, next) => {
    try {
        const refreshTokenFromCookie = req.cookies?.refresh_token;
        const { accessToken } = await userService.refreshTokenService(refreshTokenFromCookie);

        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'strict' : 'lax',
            maxAge: ms('7d')
        });
        res.status(StatusCodes.OK).json({
            message: "Refresh token successful",
            data: {
                accessToken,
            }
        });
    } catch (err) { next(err) }
}

const getUsers = async (req, res, next) => {
    try {
        const user = await userService.getAllUserService();
        console.log(user);
        res.status(StatusCodes.OK).json({
            message: "Get user successfull",
            data: user
        });
    } catch (err) { next(err) }

}

const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserByIdService(id);
        return res.status(StatusCodes.OK).json({
            message: "Get user by id successfully",
            data: user
        });
    } catch (err) { next(err); }
}

const getMe = async (req, res, next) => {
    try {
        console.log(req.jwtDecoder);
        const user = await userService.getMeService(req.jwtDecoder.user_id);
        return res.status(StatusCodes.OK).json({
            user
        })
    } catch (error) { next(err); }
}

const toggleSavePost = async (req, res, next) => {
    try {
        const user_id = req.jwtDecoder.user_id;
        const { postId } = req.body;

        if (!postId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Vui lòng cung cấp postId"
            });
        }
        const result = await userService.toggleSavePostService(user_id, postId);

        return res.status(StatusCodes.OK).json({
            message: result.message,
            status: result.status
        });
    } catch (error) { next(err); }
}

export const userController = {
    createUser,
    login,
    logout,
    changePassword,
    refreshToken,
    getUsers,
    getUserById,
    getMe,
    toggleSavePost,
    updateProfile
}