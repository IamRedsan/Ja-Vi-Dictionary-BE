import express from "express";
import {
    signUp, 
    login, 
    verifyOTP,
    resendOTP
} from "../controllers/authController.js";

const router = express.Router();

router.route("/sign-up").post(signUp);
router.route("/login").post(login);
router.route("/resend-otp").post(resendOTP);
router.route("/verify").post(verifyOTP);

export default router;
