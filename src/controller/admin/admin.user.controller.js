import { StatusCodes } from "http-status-codes";
import { userService } from "../../service/user.service.js";

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

const updateUserStatus = async (req, res, next) => {
    try {
        const { id: user_id } = req.params;
        const admin_id = req.jwtDecoder?.user_id;
        const { status, banReason } = req.body;

        const user = await userService.updateUserStatusService({
            user_id,
            admin_id,
            status,
            banReason
        });

        res.status(StatusCodes.OK).json(user);
    } catch (err) { next(err); }
}

const updateUserRole = async (req, res, next) => {
    try {
        const { id: user_id } = req.params;
        const { role } = req.body;
        const admin_id = req.jwtDecoder?.user_id;
        const user = await userService.updateUserRoleService(user_id, admin_id, role);
        res.status(StatusCodes.OK).json(user);
    } catch (err) { next(err); }
}

const softDeleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const admin_id = req.jwtDecoder?.user_id;
        await userService.deleteUserService(id, admin_id);
        return res.status(StatusCodes.NO_CONTENT).end();
    } catch (error) {
        return res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: error.message || "Internal server error"
        });
    }
}

export const adminController = {
    getUsers,
    getUserById,
    updateUserStatus,
    updateUserRole,
    softDeleteUser
}