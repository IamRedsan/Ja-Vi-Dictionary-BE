import express from "express";
import {
    getAllKanjis,
    searchKanji,
    getKanjiByText,
    getKanjiById,
    getKanjiByJLPTLevel,
    getKanjiList
} from "../controllers/kanjiController.js";

const kanjiRouter = express.Router();

kanjiRouter.route("/").get(getAllKanjis);
kanjiRouter.route("/list").get(getKanjiList);
kanjiRouter.route("/jlpt/:level").get(getKanjiByJLPTLevel);
kanjiRouter.route("/getByText/:text").get(getKanjiByText);
kanjiRouter.route("/getById/:id").get(getKanjiById);
kanjiRouter.route("/search").get(searchKanji);

export default kanjiRouter;


