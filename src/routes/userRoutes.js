import express from "express";
import { UserController } from "../controllers/userController.js";
import upload from "../middlewares/avatarUpload.js"
import { Auth } from "../middlewares/Auth.js";

const router = express.Router();

// router.all("*", Auth.AdminAuth);
router.route("/").get(Auth.AdminAuth, UserController.getAllUsers);
router.route("/profile").get(Auth.UserAuth, UserController.getUserByToken);
router.route("/profile").put(Auth.UserAuth, upload, UserController.updateUserProfile);
router.route("/:id").put(Auth.AdminAuth, upload, UserController.updateUserInfo);
router.route("/:id").get(Auth.AdminAuth, UserController.getUserById);


export default router;