import { StatusCodes } from "http-status-codes"
import { env } from "../config/environment.js";

export const errorHandlingMiddleware = (err, req, res, next) => {
    // nếu dev thiếu status code => trả về 500
    if (!err.statusCode) err.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

    const responseError = {
        message: err.message || StatusCodes[err.statusCode],
        stack: err.stack
    }

    // console.log("env.BUILD_MODE: ", env.BUILD_MODE);
    if (env.BUILD_MODE !== 'dev') delete responseError.stack;
    res.status(err.statusCode).json(responseError);
}