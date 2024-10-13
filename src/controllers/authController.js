import User from "../models/User.js";
import BadRequestError from "../errors/BadRequestError.js";
import bcrypt from "bcrypt";
import nodemailer from 'nodemailer';
import InternalServerError from "../errors/InternalServerError .js";
import dotenv from "dotenv";
import NotFoundError from "../errors/NotFoundError.js";
import { StatusCodes } from "http-status-codes";

dotenv.config();

// Tạo transporter cho nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD 
    },
});

//Sign up
export const signUp = async (req, res, next) => {
    let {username, password, email, fullname} = req.body;

    try {
        if(username == "" || email == "" || password == "" || fullname == ""){
            throw new BadRequestError("Thông tin nhập vào không hợp lệ!");
        }
        
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds)
            .then((hashedPass) => {
                const newUser = new User({
                    username,
                    password: hashedPass,
                    email, 
                    fullname,
                    role: "user",
                    verified: false
                });

                newUser.save().then((result) => {
                    sendOTPVerificationEmail({email}, res, next);
                });
            })
    } catch(err){
        next(err);
    }
};

const sendOTPVerificationEmail = async ({email}, res, next) => {
    try{
        const user = await User.findOne({email});

        if(!user){
            throw new NotFoundError("Không tìm thấy thông tin người dùng, vui lòng đăng ký!");
        }
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
        const mailOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: "GAKU - Xác thực email",
            html: `<p>Mã xác thực của bạn là: <b>${otp}</b></p>
            <br>
            <p>Mã xác thực sẽ hết hạn trong 1 giờ!</p>`
        }

        const saltRounds = 10;
        const hashedOTP = await bcrypt.hash(otp, saltRounds);
        user.otpVerification = {
            otp: hashedOTP,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 60 * 60 * 1000)
        }
        await user.save();

        const info = await transporter.sendMail(mailOptions);
        if (info.accepted.length <= 0){
            throw new InternalServerError("Lỗi khi gửi mã xác thực, xin hãy thử lại!");
        } 

        return res.status(StatusCodes.OK).json({
            status: "pending",
            message: "Mã OTP đã được gửi tới email của bạn!",
            data: user
        });

    } catch(err){
        next(err);
    }
};

export const verifyOTP = async (req, res, next) => {
    try {
        const {id, otp} = req.body;
        if(!id || !otp){
            throw new BadRequestError("OTP không hợp lệ!");
        }
        const user = await User.findById(id);
        if(user.length <= 0){
            throw new NotFoundError("Không tìm thấy tài khoản người dùng, xin vui lòng đăng ký!");
        }
        const {expiresAt} = user.otpVerification;
        const hashedOTP = user.otpVerification.otp;
        if (expiresAt < Date.now()) {
            user.otpVerification = {}; 
            await user.save(); 
            throw new BadRequestError("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.");
        }
        const validOTP = await bcrypt.compare(otp, hashedOTP);
        if(!validOTP){
            throw new Error("Ma OTP khong hop le!");
        }
        user.verified = true;
        user.otpVerification = undefined;
        await user.save();
        return res.status(StatusCodes.OK).json({
            status: "verified",
            message: "Xác thực tài khoản thành công!"
        });
    } catch(error) {
        next(error);
    }
};

//Resend OTP
export const resendOTP = async (req, res, next) => {
    try{
        const {email} = req.body;
        if(!email){
            throw new BadRequestError("Thông tin không hợp lệ, vui lòng thử lại!");
        }
        const user = await User.findOne({email});
        user.otpVerification = {};
        sendOTPVerificationEmail(user, res, next);

        return res.status(StatusCodes.OK).json({
            status: "success",
            message: "Mã OTP đã được gửi tới email của bạn!"
        });

    } catch(error){
        next(error);
    }
}; 


//Login
export const login = async (req, res, next) => {

};