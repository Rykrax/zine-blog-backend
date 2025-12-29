import ms from "ms";
import {
    createUserService,
    loginService,
    logoutService,
    // refreshTokenService 
} from "../service/userService.js";

const createUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const data = await createUserService(username, email, password);
        console.log(data);
        return res.status(200).json({ message: "Tạo tài khoản thành công!" });
    } catch (err) {
        console.log(err);
        return res.status(err.status).json({ message: err.message });
    }
}

const handleLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { user, accessToken, refreshToken } = await loginService(email, password);

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

const handleLogout = async (req, res) => {
    try {
        const result = await logoutService(res);
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
    }
}

// const refreshToken = async (req, res) => {
//     try {
//         const { accessToken } = await refreshTokenService(req);

//         const isProd = process.env.NODE_ENV === 'production';
//         res.cookie('access_token', accessToken, {
//             httpOnly: true,
//             secure: isProd,
//             sameSite: isProd ? 'none' : 'lax',
//             maxAge: ms('7d')
//         });
//         res.status(200).json({
//             message: "Refresh token successful",
//             data: {
//                 accessToken,
//             }
//         });
//     } catch (err) {
//         console.log(err);
//         return res.status(err.status).json({ message: err.message });
//     }
// }

export const userController = {
    createUser,
    handleLogin,
    handleLogout,
    // refreshToken
}