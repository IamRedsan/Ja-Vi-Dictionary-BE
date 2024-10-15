import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const OTPSchema = new mongoose.Schema({
    otp: {type: String},
    createdAt: {type: Date},
    expiresAt: {type: Date},
});

const UserSchema = new mongoose.Schema({
    username: {type: String, require:true},
    password: { type: String, required: true },
    email: { type: String, require:true },
    fullname: { type: String , require:true },
    role: { type: String , require:true },
    verified: {type: Boolean, require: true},
    otpVerification: {type: OTPSchema},
    refreshToken: { type: String } 
}, {
    collection: 'user'
});

const User = mongoose.model("user", UserSchema);

export default User;