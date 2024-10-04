import express from "express";
import {
    getAllCompositions
} from "../controllers/compositionController.js";

const router = express.Router();

router.route("/").get(getAllCompositions);

export default router;


