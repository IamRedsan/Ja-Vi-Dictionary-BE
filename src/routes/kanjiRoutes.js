import express from "express";
import {
    getAllKanjis,
    searchKanji,
    getKanjiByText,
    getKanjiById,
    getKanjiByJLPTLevel,
} from "../controllers/kanjiController.js";

const kanjiRouter = express.Router();

kanjiRouter.route("/").get(getAllKanjis);
kanjiRouter.route("/jlpt/").get(getKanjiByJLPTLevel);
kanjiRouter.route("/text/:text").get(getKanjiByText);
kanjiRouter.route("/search").get(searchKanji);
kanjiRouter.route("/:id").get(getKanjiById);

export default kanjiRouter;


