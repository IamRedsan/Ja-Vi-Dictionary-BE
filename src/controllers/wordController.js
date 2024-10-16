import { StatusCodes } from "http-status-codes";
import { wordService } from "../services/wordService.js";

const getAllWords = async (req, res) => {
    try {
        const words = await wordService.getAllWords();

        res.status(StatusCodes.OK).send({
            status: "success",
            data: words
        });
    } catch (error) {
        next(error);
    }
};

//GET /api/v1/words/{id}
const getWordById = async (req, res, next)=>{
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
const searchWord = async (req, res, next) => {
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

export const wordController = {
    getAllWords,
    getWordById, 
    searchWord
};