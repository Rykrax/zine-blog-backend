import ms from "ms";
import {
    userService
} from "../service/user.service.js";
import { StatusCodes } from "http-status-codes";

const createUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const data = await userService.createUserService(username, email, password);
        console.log(data);
        return res.status(StatusCodes.CREATED).json({ message: "Tạo tài khoản thành công!" });
    } catch (err) {
        console.log(err);
        return res.status(err.status).json({ message: err.message });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { user, accessToken, refreshToken } = await userService.loginService(email, password);

        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            maxAge: ms('7d')
        });

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
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
    } catch (err) {
        console.log(err);
        return res.status(err.status).json({ message: err.message });
    }
}

const logout = async (req, res) => {
    const isProd = process.env.NODE_ENV === "production";

    res.clearCookie("access_token", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax"
    });

    res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax"
    });

    return res.status(StatusCodes.OK).json({
        message: "Logout successfully"
    });
};

const refreshToken = async (req, res) => {
    try {
        const refreshTokenFromCookie = req.cookies?.refresh_token;
        const { accessToken } = await userService.refreshTokenService(refreshTokenFromCookie);

        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            maxAge: ms('7d')
        });
        res.status(StatusCodes.OK).json({
            message: "Refresh token successful",
            data: {
                accessToken,
            }
        });
    } catch (err) {
        console.log(err);
        return res.status(err.status).json({ message: err.message });
    }
}

const getUsers = async (req, res) => {
    const user = await userService.getAllUserService();
    console.log(user);
    res.status(StatusCodes.OK).json({
        message: "Get user successfull",
        data: user
    });
}

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserByIdService(id);
        return res.status(StatusCodes.OK).json({
            message: "Get user by id successfully",
            data: user
        });
    } catch (err) {
        console.log(err);
        return res.status(err.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: err.message || "Internal server error"
        });
    }
}

export const userController = {
    createUser,
    login,
    logout,
    refreshToken,
    getUsers,
    getUserById
}