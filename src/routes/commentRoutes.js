import express from "express";
import { CommentController } from "../controllers/commentController.js";
import { Auth } from "../middlewares/Auth.js";

const router = express.Router();

router.route("/").post(Auth.UserAuth, CommentController.createComment);
router.route("/like").post(Auth.UserAuth, CommentController.likeComment);

export default router;
