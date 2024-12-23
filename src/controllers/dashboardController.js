import { StatusCodes } from "http-status-codes";
import { dashboardService } from "../services/dashboardService.js";

const getDashboard = async (req, res, next) => {
    try {
        const result = await dashboardService.getDashboard(req);
        return res.status(StatusCodes.OK).json({
            status: "success",
            data: result
        })
    }catch(error){
        next(error);
    }
}

export const dashboardController = {
    getDashboard
}