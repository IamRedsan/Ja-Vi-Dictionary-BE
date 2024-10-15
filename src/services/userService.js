import User from "../models/User.js";
import NotFoundError from "../errors/NotFoundError.js";
import BadRequestError from "../errors/BadRequestError.js";


const getAllUsers = async (data) => {
    try{
        const users = await User.find();  
        return users;
    } catch(error){
        throw error;
    }
};

const getUserById = async (data) => {
    try{
        const {id} = data.params;
        if(!id){
            throw new BadRequestError("Tham số không hợp lệ!");
        }
        const user = await User.findById(id);
        if(!user){
            throw new NotFoundError("Không tìm thấy thông tin người dùng!");
        }
        return user;
    } catch(error){
        throw error;
    }
};

export const UserService = {
    getAllUsers,
    getUserById
};