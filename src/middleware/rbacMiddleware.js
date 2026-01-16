import { StatusCodes } from "http-status-codes";

const isValidPermission = (allowedRoles) => async (req, res, next) => {
    try {
        console.log("token: ", req.jwtDecoder);

        const userRole = req.jwtDecoder.role;
        if (!userRole || !allowedRoles.includes(userRole)) {
            res.status(StatusCodes.FORBIDDEN).json({
                message: "Bạn không có quyền truy cập. Quyền admin đã bị thu hồi."
            });
            return;
        }
        next();
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Oops! Something went wrong"
        })
    }
}

export const rbacMiddleware = {
    isValidPermission
}