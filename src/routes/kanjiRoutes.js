import express from "express";
import {
    getAllKanjis
} from "../controllers/kanjiController.js";

const kanjiRouter = express.Router();

kanjiRouter.route("/").get(getAllKanjis);

export default kanjiRouter;


