import express from "express";
import {
    signUp, 
    login, 
    verifyOTP
} from "../controllers/authController.js";

const router = express.Router();

router.route("/sign-up").post(signUp);
router.route("/login").post(login);
router.route("/verify").post(verifyOTP);

export default router;
