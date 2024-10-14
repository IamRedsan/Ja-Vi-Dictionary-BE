import BadRequestError from "../errors/BadRequestError.js";
import NotFoundError from "../errors/NotFoundError.js";
import Word from "../models/Word.js";
import Kanji from "../models/Kanji.js";
import { StatusCodes } from "http-status-codes";
import { wordService } from "../services/wordService.js";

export const getAllWords = async (req, res) => {
    try {
        const words = wordService.getAllWords();

        res.status(StatusCodes.OK).send({
            status: "success",
            data: words
        });
    } catch (error) {
        next(error);
    }
};

//GET /api/v1/words/{id}
export const getWordById = async (req, res, next)=>{
    try{
        const result = await wordService.getWordById(req);
        return res.status(StatusCodes.OK).json({
            status: "success",
            data: result
        });
       
    } catch(error){
        next(error);
    }
};

//GET /api/v1/words/search?text={}
export const searchWord = async (req, res, next) => {
    try {
        const result = await wordService.searchWord(req);
        return res.status(StatusCodes.OK).json({
            status: "success",
            data: result
        });
    } catch (error) {
        next(error);  
    }
};

