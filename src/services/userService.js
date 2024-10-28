import User from "../models/User.js";
import NotFoundError from "../errors/NotFoundError.js";
import BadRequestError from "../errors/BadRequestError.js";
import bcrypt from "bcrypt";

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

const updateUserInfo = async (req) => {
    try{
        const {id} = req.params;
        const {username, password, fullname, email, role} = req.body;
        const avatar = req.file.path;

        if(!id) {
            throw new BadRequestError("Tham số không hợp lệ!");
        }

        const user = await User.findById(id);
        if(!user){
            throw new NotFoundError("Không tìm thấy người dùng!");
        }

        if (fullname) user.fullname = fullname;
        if (username) user.username = username;
        if (email) user.email = email;
        if (role) user.role = role;
        if (avatar) user.avatar = avatar; 

        if (password) {
            const saltRounds = 10;
            const hashedPass = await bcrypt.hash(password, saltRounds); 
            user.password = hashedPass; 
        }

        await user.save();
        return user;
    }catch(error){
        throw error;
    }
}

const updateUserAvatar = async (req) => {
    try{
        const {id} = req.params;
        const avtPath = req.file.path;

        if(!id || !avtPath){
            throw new BadRequestError("Tham số không hợp lệ!");
        }

        const user = await User.findById(id);
        if(!user){
            throw new NotFoundError("Không tìm thấy người dùng!");
        }

        user.avatar = avtPath;
        await user.save();
        return user;
    }catch(error){
        throw error;
    }
};

export const UserService = {
    getAllUsers,
    getUserById,
    updateUserInfo,
    updateUserAvatar
};