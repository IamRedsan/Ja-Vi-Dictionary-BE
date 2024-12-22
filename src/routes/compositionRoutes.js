import express from "express";
import { compositionController } from "../controllers/compositionController.js";

const router = express.Router();

router.route("/").get(compositionController.getAllCompositions);
router.route("/").post(compositionController.addNewComposition);
router.route("/raw_text/:raw_text").get(compositionController.getCompositionByRawText);
router.route("/:id").get(compositionController.getCompositionByID);
router.route("/:id").put(compositionController.updateComposition);
router.route("/:id").delete(compositionController.deleteComposition);

export default router;


