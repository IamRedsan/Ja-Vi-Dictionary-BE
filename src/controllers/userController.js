import { UserService } from "../services/userService.js";
import { StatusCodes } from "http-status-codes";

const getAllUsers = async (req, res, next) => {
    try{
        const result = await UserService.getAllUsers(req);
        return res.status(StatusCodes.OK).json({
            status: "success",
            data: result
        });
    } catch(error){
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try{
        const result = await UserService.getUserById(req);
        return res.status(StatusCodes.OK).json({
            status: "success",
            data: result
        })
    } catch(error){
        next(error)
    }
};

export const UserController = {
    getAllUsers,
    getUserById
};