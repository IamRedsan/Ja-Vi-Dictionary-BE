import Joi from "joi";
import { StatusCodes } from "http-status-codes";
import ValidationError from "../errors/ValidationError.js";

const signUp = async (req, res, next)=>{
    const user = Joi.object({
        username: Joi.string().required().min(3).max(30).trim().strict(),
        password: Joi.string().required().min(3).max(30).trim().strict(),
        email: Joi.string().email().required(),
        fullname: Joi.string().required().trim().strict(),
    });

    try {
        const value = await user.validateAsync(req.body, { abortEarly: false });
        console.log('Validated Data:', value); // Kiểm tra dữ liệu đã validate

        next();
    } catch(error){
        next(new ValidationError(error.message))
    }
};

export const authValidation = {
    signUp
}