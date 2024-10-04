import express from "express";
import {
    getAllKanjis,
    searchKanji
} from "../controllers/kanjiController.js";

const kanjiRouter = express.Router();

kanjiRouter.route("/").get(getAllKanjis);
kanjiRouter.route("/search").get(searchKanji);

export default kanjiRouter;


