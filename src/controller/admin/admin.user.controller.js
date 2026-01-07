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

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await userService.deleteUserService(id);
        return res.status(StatusCodes.NO_CONTENT).json({
            message: "Xóa thành công"
        })
    } catch (error) {
        return res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: error.message || "Internal server error"
        });
    }
}

export const adminController = {
    getUsers,
    getUserById,
    deleteUser
}