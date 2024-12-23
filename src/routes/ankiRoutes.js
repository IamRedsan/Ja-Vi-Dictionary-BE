import express from "express";
const router = express.Router();
import {Auth} from "../middlewares/Auth.js";
import { ankiController } from "../controllers/ankiController.js";

router.route("/").get(Auth.UserAuth, ankiController.getAnkiInfo);
router.route("/").put(Auth.UserAuth, ankiController.updateAnki);
router.route("/decks").get(Auth.UserAuth, ankiController.getDecks);

export default router;
