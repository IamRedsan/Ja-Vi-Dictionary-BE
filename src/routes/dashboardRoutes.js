import express from "express";
import {Auth} from "../middlewares/Auth.js";
import { dashboardController } from "../controllers/dashboardController.js";

const router = express.Router();

router.route("/").get(Auth.AdminAuth, dashboardController.getDashboard);

export default router;
