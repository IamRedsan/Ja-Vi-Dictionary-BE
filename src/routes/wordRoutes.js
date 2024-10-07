import express from "express";
import {
    getAllWords, 
    getWordById,
    searchWord
} from "../controllers/wordController.js";

const wordRouter = express.Router();

wordRouter.route("/").get(getAllWords);
wordRouter.route("/search").get(searchWord);
wordRouter.route("/:id").get(getWordById);

export default wordRouter;


