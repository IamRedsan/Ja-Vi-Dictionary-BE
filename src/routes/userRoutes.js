import express from "express";
import { UserController } from "../controllers/userController.js";
import { Auth } from "../middlewares/Auth.js";

const router = express.Router();

router.all("*", Auth.AdminAuth);
router.route("/").get(UserController.getAllUsers);
router.route("/:id").get();

export default router;