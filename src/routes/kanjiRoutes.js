import express from "express";
import {
    getAllKanjis,
    searchKanji,
    getKanjiByText
} from "../controllers/kanjiController.js";

const kanjiRouter = express.Router();

kanjiRouter.route("/").get(getAllKanjis);
kanjiRouter.route("/:text").get(getKanjiByText);
kanjiRouter.route("/search").get(searchKanji);

export default kanjiRouter;


