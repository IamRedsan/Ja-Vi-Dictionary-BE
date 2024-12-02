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

export const ankiController = {
    getDecks,
    updateAnki,
    getAnkiInfo
} 