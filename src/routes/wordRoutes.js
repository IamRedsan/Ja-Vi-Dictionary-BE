import express from "express";
import {
    getAllWords
} from "../controllers/wordController.js";

const wordRouter = express.Router();

wordRouter.route("/").get(getAllWords);

export default wordRouter;


