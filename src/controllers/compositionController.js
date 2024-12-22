import { StatusCodes } from "http-status-codes";
import Composition from "../models/Composition.js";
import { compositionService } from "../services/compositionService.js";

const getAllCompositions = async (req, res, next) => {
    try {
        const compositions = await compositionService.getAllCompositions(req);
        res.status(200).json({
            status: "success",
            data: compositions
        });
    } catch (error) {
        next(error);
    }
};

const updateComposition = async (req, res, next) => {
    try{    
        const result = await compositionService.updateComposition(req);
        return res.status(StatusCodes.OK).json({
            status: "success",
            data: result
        });
    }catch(error){
        next(error);
    }
};

const deleteComposition = async (req, res, next) => {
    try{    
        const result = await compositionService.deleteComposition(req);
        return res.status(StatusCodes.OK).json({
            status: "success",
            data: result
        });
    }catch(error){
        next(error);
    }
};

const addNewComposition = async (req, res, next) => {
    try{    
        const result = await compositionService.addNewComposition(req);
        return res.status(StatusCodes.CREATED).json({
            status: "success",
            data: result
        });
    }catch(error){
        next(error);
    }
};

const getCompositionByID = async (req, res, next) => {
    try{    
        const result = await compositionService.getCompositionByID(req);
        return res.status(StatusCodes.OK).json({
            status: "success",
            data: result
        });
    }catch(error){
        next(error);
    }
};

const getCompositionByRawText = async (req, res, next) => {
    try{    
        const result = await compositionService.getCompositionByRawText(req);
        return res.status(StatusCodes.OK).json({
            status: "success",
            data: result
        });
    }catch(error){
        next(error);
    }
};


export const compositionController = {
    getAllCompositions,
    updateComposition,
    deleteComposition,
    addNewComposition,
    getCompositionByID,
    getCompositionByRawText
}