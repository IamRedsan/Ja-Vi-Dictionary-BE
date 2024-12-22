import { StatusCodes } from "http-status-codes";
import { kanjiService } from "../services/kanjiService.js";

//Get /api/v1/kanjis
const getAllKanjis = async (req, res, next) => {
    try {
        const kanjis = await kanjiService.getAllKanjis(req);
        res.status(StatusCodes.OK).send({
            status: "success",
            data: kanjis
        });
    } catch (error) {
        next(error);
    }
};

//GET /api/v1/kanjis/jlpt/3?page=2&limit=10
const getKanjiByJLPTLevel = async (req, res, next) => {
    try {
        const result = await kanjiService.getKanjiByJLPTLevel(req);
        return res.status(StatusCodes.OK).json({
            status:"success",
            ...result
        });    
    } catch (error) {
        next(error);
    }
};

//GET /api/v1/kanjis/getById/670151f0e13093d82a7e1d6e
const getKanjiById = async (req, res, next) => {
    try {
        const result = await kanjiService.getKanjiById(req);
        return res.status(StatusCodes.OK).json({status: "success", data: result});
    } catch (error) {
        next(error);
    }
};

//GET /api/v1/kanjis/getByText/容
const getKanjiByText = async (req, res, next) => {
    try {
        const result = await kanjiService.getKanjiByText(req);
        return res.status(StatusCodes.OK).json({
            status: "success",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

//GET /api/v1/kanjis/search?text=ニ
const searchKanji = async (req, res, next) => {
    try {
        const result = await kanjiService.searchKanji(req);
        return res.status(StatusCodes.OK).json({
            status: "success",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

//Comments
const kanjiComment = async (req, res, next) => {
    try{
        const result = await kanjiService.kanjiComment(req);

        return res.status(StatusCodes.OK).json({
            status: "success",
            data: result
        });
    }catch(error){
        next(error);
    }
}

const getKanjiComments = async (req, res, next) => {
    try{
        const result = await kanjiService.getKanjiComments(req);
        return res.status(StatusCodes.OK).json({
            status: "success",
            data: result
        });

    }catch(error){
        next(error);
    }
};

const addNewKanji = async (req, res, next) => {
    try{
        const result = await kanjiService.addNewKanji(req);
        return res.status(StatusCodes.CREATED).json({
            status: "success",
            data: result
        });
    }catch(error){
        next(error);
    }

};

const updateKanji = async (req, res, next) => {
    try{
        const result = await kanjiService.updateKanji(req);
        return res.status(StatusCodes.OK).json({
            status: "success",
            data: result
        });
    }catch(error){
        next(error);
    }

};

const deleteKanji = async (req, res, next) => {
    try{
        const result = await kanjiService.deleteKanji(req);
        return res.status(StatusCodes.OK).json({
            status: "success",
            data: result
        });
    }catch(error){
        next(error);
    }
};


export const kanjiController = {
    getAllKanjis,
    getKanjiByJLPTLevel,
    getKanjiById,
    getKanjiByText,
    searchKanji,
    kanjiComment,
    getKanjiComments,
    addNewKanji,
    updateKanji,
    deleteKanji
}