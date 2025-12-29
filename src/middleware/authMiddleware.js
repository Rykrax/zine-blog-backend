import { StatusCodes } from 'http-status-codes';
import { jwtProvider } from '../provider/jwtProvider.js'

const isAuthorized = async (req, res, next) => {
    const accessToken = req.cookies?.access_token;
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
        req.jwtDecoder = accessTokenDecoder;
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

export const authMiddleware = {
    isAuthorized
}