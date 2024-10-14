import BadRequestError from "../errors/BadRequestError.js";
import InternalServerError from "../errors/InternalServerError .js";
import NotFoundError from "../errors/NotFoundError.js";
import Kanji from "../models/Kanji.js";
import { StatusCodes } from "http-status-codes";
import { kanjiService } from "../services/kanjiService.js";

//Get /api/v1/kanjis
const getAllKanjis = async (req, res, next) => {
    try {
        const kanjis = await kanjiService.getAllKanjis();
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

export const kanjiController = {
    getAllKanjis,
    getKanjiByJLPTLevel,
    getKanjiById,
    getKanjiByText,
    searchKanji
}