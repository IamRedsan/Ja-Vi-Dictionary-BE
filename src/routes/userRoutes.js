import express from "express";
import { UserController } from "../controllers/userController.js";
import { Auth } from "../middlewares/Auth.js";
import upload from "../middlewares/avatarUpload.js"

const router = express.Router();

// router.all("*", Auth.AdminAuth);
router.route("/").get(UserController.getAllUsers);
router.route("/:id").put(upload, UserController.updateUserInfo);
router.route("/:id").get(UserController.getUserById);

export default router;