import express from "express";
const router = express.Router();
import {Auth} from "../middlewares/Auth.js";
import { ankiController } from "../controllers/ankiController.js";

router.route("/").get(Auth.UserAuth, ankiController.getAnkiInfo);
router.route("/").put(Auth.UserAuth, ankiController.updateAnki);
router.route("/decks").get(Auth.UserAuth, ankiController.getDecks);
router.route("/action-logs").get(Auth.UserAuth, ankiController.getActionLogs);
router.route("/push").post(Auth.UserAuth, ankiController.mergeFromClient);
router.route("/pull").post(Auth.UserAuth, ankiController.fillLogs);

export default router;
