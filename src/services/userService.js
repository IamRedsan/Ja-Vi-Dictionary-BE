import User from "../models/User.js";
import NotFoundError from "../errors/NotFoundError.js";
import BadRequestError from "../errors/BadRequestError.js";
import bcrypt from "bcrypt";

const getAllUsers = async (req) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    try {
        if (!page || !limit) {
            const results = await User.find({ role: "user" }); // Lọc người dùng với role = "user"
            return {
                totalPages: 1,
                currentPage: 1,
                data: results,
            };
        }

        const total = await User.countDocuments({ role: "user" }); // Đếm tổng số người dùng có role = "user"
        const totalPages = Math.ceil(total / limit);

        if (page > totalPages) {
            throw new NotFoundError("Không có dữ liệu!");
        }

        const results = await User.find({ role: "user" }) // Lọc theo role = "user"
            .skip((page - 1) * limit)
            .limit(limit);

        if (results.length > 0) {
            return {
                totalPages,
                currentPage: page,
                data: results,
            };
        } else {
            throw new NotFoundError("Không tìm thấy người dùng!");
        }
    } catch (error) {
        throw error;
    }
};

const getUserByToken = async (req) => {
    try{
        const userId = req.userId;
        const user = await User.findById(userId);
        if(!user){
            throw new NotFoundError("Không tìm thấy thông tin người dùng!");
        }
        return user;
    }catch(error){
        throw error;
    }
}

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
        const {password, fullname, email, role} = req.body;
        const avatar = req.file?.path;

        if(!id) {
            throw new BadRequestError("Tham số không hợp lệ!");
        }

        const user = await User.findById(id);
        if(!user){
            throw new NotFoundError("Không tìm thấy người dùng!");
        }

        if (fullname) user.fullname = fullname;
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

const updateUserProfile = async (req) => {
    try{
        const userId = req.userId;
        const {password, fullname} = req.body;
        const avatar = req.file?.path;

        const user = await User.findById(userId);
        if(!user){
            throw new NotFoundError("Không tìm thấy người dùng!");
        }

        if (fullname) user.fullname = fullname;
        if (avatar) user.avatar = avatar; 

        if (password) {
            const {oldPassword} = req.body;
            if(!oldPassword){
                throw new BadRequestError("Mật khẩu cũ không hợp lệ!");
            }
            const checkPass = await bcrypt.compare(oldPassword, user.password);
            if(!checkPass){
                throw new BadRequestError("Mật khẩu cũ không chính xác!");
            }
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

const banUser = async (req) => {
    try{
        const {userId} = req.params;
        if(!userId){
            throw BadRequestError("Thiếu userId!");
        }

        const user = await User.findById(userId);
        if(!user){
            throw NotFoundError("Không tìm thấy người dùng!");
        }
        
        if(!user.isBanned){
            user.isBanned = true;
        }else{
            user.isBanned = false;
        }

        const savedUser = await user.save();
        return savedUser;
    }catch(error){
        throw error;
    }
};

export const UserService = {
    getAllUsers,
    getUserById,
    getUserByToken,
    updateUserInfo,
    updateUserProfile,
    updateUserAvatar,
    banUser
};