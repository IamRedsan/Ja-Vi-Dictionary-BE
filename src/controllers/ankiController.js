import { StatusCodes } from "http-status-codes";
import { ankiService } from "../services/ankiService.js";

const getDecks = async (req, res, next)=>{
    try{
        const results = await ankiService.getDecks(req);
        return res.status(StatusCodes.OK).json({
            status: "success",
            data: results
        })
    }catch(err){
        next(err);
    }
};


const updateAnki = async (req, res, next) => {
    try{
        const result = await ankiService.updateAnki(req);

        return res.status(StatusCodes.OK).json({
            status: "success",
            data: result
        });
    }catch(err){
        next(err);
    }
}

const getAnkiInfo = async (req, res, next) => {
    try{
        const result = await ankiService.getAnkiInfo(req);
        return res.status(StatusCodes.OK).json({
            status: "success",
            data: result
        });
    }catch(err){
        next(err); 
    }
};  

const getActionLogs = async (req, res, next) => {
    try{
        const result = await ankiService.getActionLogs(req);
        return res.status(StatusCodes.OK).json({
            status: "success",
            data: result
        });
    }catch(err){
        next(err); 
    }
};

const mergeFromClient = async (req, res, next) => {
    try{
        await ankiService.mergeFromClient(req);
        return res.status(StatusCodes.OK).json({
            status: "success",
        });
    }catch(err){
        next(err); 
    }
};

const fillLogs = async (req, res, next) => {
    try{
        const filledLogs = await ankiService.fillLogs(req);
        return res.status(StatusCodes.OK).json({
            status: "success",
            data: filledLogs
        });
    }catch(err){
        next(err); 
    }
};

export const ankiController = {
    getDecks,
    updateAnki,
    getAnkiInfo,
    getActionLogs,
    mergeFromClient,
    fillLogs
} 