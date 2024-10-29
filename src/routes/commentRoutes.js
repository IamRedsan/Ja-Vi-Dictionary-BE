import express from "express";
import { CommentController } from "../controllers/commentController.js";
import { Auth } from "../middlewares/Auth.js";

const router = express.Router();

router.route("/").post(Auth.UserAuth, CommentController.createComment);
router.route("/like").post(Auth.UserAuth, CommentController.likeComment);
router.route("/").put(Auth.UserAuth, CommentController.updateComment);
router.route("/").delete(Auth.UserAuth, CommentController.deleteComment);

export default router;
