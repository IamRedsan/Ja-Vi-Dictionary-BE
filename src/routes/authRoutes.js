import express from "express";
import {
    authController
} from "../controllers/authController.js";
import { authValidation } from "../validations/authValidation.js";

const router = express.Router();

router.route("/sign-up").post(authValidation.signUp, authController.signUp);
router.route("/login").post(authController.login);
router.route("/resend-otp").post(authController.resendOTP);
router.route("/verify").post(authController.verifyOTP);

export default router;
