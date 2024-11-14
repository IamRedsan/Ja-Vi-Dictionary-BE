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

const getUserByToken = async (req, res, next) => {
    try{
        const result = await UserService.getUserByToken(req);
        return res.status(StatusCodes.OK).json({
            status: "success",
            data: result
        })
    } catch(error){
        next(error)
    }
}

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

const updateUserProfile = async (req, res, next) => {
    try{
        const result = await UserService.updateUserProfile(req);
        return res.status(StatusCodes.OK).json({
            status: "success",
            data: result
        });
    }catch(error){
        next(error);
    }
};

const updateUserInfo = async (req, res, next) => {
    try{
        const result = await UserService.updateUserInfo(req);
        return res.status(StatusCodes.OK).json({
            status: "success",
            data: result
        });
    }catch(error){
        next(error);
    }
};

const updateUserAvatar = async (req, res, next) => {
    try{
        const result = UserService.updateUserInfo(req);
        return res.status(StatusCodes.OK).json({
            status: "success",
            data: result
        });
    }catch(error){
        next(error);
    }
};

export const UserController = {
    getAllUsers,
    getUserById,
    getUserByToken,
    updateUserInfo,
    updateUserProfile,
    updateUserAvatar
};