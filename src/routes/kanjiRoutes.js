import express from "express";
import {
   kanjiController
} from "../controllers/kanjiController.js";

const kanjiRouter = express.Router();

kanjiRouter.route("/").get(kanjiController.getAllKanjis);
kanjiRouter.route("/jlpt/").get(kanjiController.getKanjiByJLPTLevel);
kanjiRouter.route("/text/:text").get(kanjiController.getKanjiByText);
kanjiRouter.route("/search").get(kanjiController.searchKanji);
kanjiRouter.route("/:id").get(kanjiController.getKanjiById);

export default kanjiRouter;


