import express from "express";
import {
    wordController
} from "../controllers/wordController.js";
import {Auth} from "../middlewares/Auth.js"

const wordRouter = express.Router();

wordRouter.route("/").get(wordController.getAllWords);
wordRouter.route("/").post(Auth.AdminAuth, wordController.addNewWord);
wordRouter.route("/search").get(wordController.searchWord);
wordRouter.route("/:id").get(wordController.getWordById);
wordRouter.route("/:id").put(Auth.AdminAuth, wordController.updateWord);
wordRouter.route("/:id").delete(Auth.AdminAuth, wordController.deleteWord);

export default wordRouter;


