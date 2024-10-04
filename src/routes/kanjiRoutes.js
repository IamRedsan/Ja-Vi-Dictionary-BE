import express from "express";
import {
    getAllKanjis,
    searchKanji,
    getKanjiByText,
    getKanjiByJLPTLevel,
    getKanjiList
} from "../controllers/kanjiController.js";

const kanjiRouter = express.Router();

kanjiRouter.route("/").get(getAllKanjis);
kanjiRouter.route("/list").get(getKanjiList);
kanjiRouter.route("/jlpt/:level").get(getKanjiByJLPTLevel);
kanjiRouter.route("/:text").get(getKanjiByText);
kanjiRouter.route("/search").get(searchKanji);

export default kanjiRouter;


