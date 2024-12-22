import express from "express";
import {
   kanjiController
} from "../controllers/kanjiController.js";
import  {Auth} from "../middlewares/Auth.js";

const kanjiRouter = express.Router();

kanjiRouter.route("/").get(kanjiController.getAllKanjis);
kanjiRouter.route("/").post(Auth.AdminAuth, kanjiController.addNewKanji);
kanjiRouter.route("/jlpt/").get(kanjiController.getKanjiByJLPTLevel);
kanjiRouter.route("/text/:text").get(kanjiController.getKanjiByText);
kanjiRouter.route("/search").get(kanjiController.searchKanji);
kanjiRouter.route("/:kanjiId/comments").get(kanjiController.getKanjiComments);
kanjiRouter.route("/:kanjiId/comments").post(kanjiController.kanjiComment);
kanjiRouter.route("/:id").get(kanjiController.getKanjiById);
kanjiRouter.route("/:id").put(Auth.AdminAuth, kanjiController.updateKanji);
kanjiRouter.route("/:id").delete(Auth.AdminAuth, kanjiController.deleteKanji);

export default kanjiRouter;


