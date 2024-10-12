import BadRequestError from "../errors/BadRequestError.js";
import NotFoundError from "../errors/NotFoundError.js";
import Word from "../models/Word.js";
import { StatusCodes } from "http-status-codes";

export const getAllWords = async (req, res) => {
    try {
        const words = await Word.find();
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
    const {id} = req.params;
    try{
        if (!id || id.trim() === '') {
            throw new BadRequestError("Bad Request!");
        }

        const result = await Word.findById(id).populate("kanji");

        if(result){
            return res.status(StatusCodes.OK).json({
                status: "success",
                data: result
            });
        } else {
            throw new NotFoundError("Không tìm thấy dữ liệu!");
        }
    } catch(error){
        next(error);
    }
};

//GET /api/v1/words/search?text={}
export const searchWord = async (req, res, next) => {
    const { text } = req.query;

    try {
        // Kiểm tra nếu không có từ khóa tìm kiếm
        if (!text || text.trim() === "") {
            throw new BadRequestError("Bad request");
        }

        // Xây dựng điều kiện truy vấn tìm kiếm theo tiền tố
        const prefixCondition = {
            $or: [
                { text: { $regex: `^${text}`, $options: 'i' } },          // Tìm tiền tố trong trường 'text'
                { hiragana: { $regex: `^${text}`, $options: 'i' } },      // Tìm tiền tố trong trường 'hiragana'
                { romanji: { $regex: `^${text}`, $options: 'i' } },        // Tìm tiền tố trong 'romanji'
                { "meaning.content": { $regex: `^${text}`, $options: 'i' } }  // Tìm tiền tố trong 'meaning.content'
            ]
        };

        // Thực hiện truy vấn với điều kiện tiền tố
        const prefixResults = await Word.find(prefixCondition).limit(10); // Giới hạn kết quả tối đa là 10

        // Nếu đã có đủ 10 kết quả, trả về ngay
        if (prefixResults.length >= 10) {
            return res.status(StatusCodes.OK).json({
                status: "success",
                data: prefixResults});
        }

        // Nếu chưa đủ 10 kết quả, thực hiện truy vấn bổ sung theo hậu tố
        const suffixCondition = {
            $or: [
                { text: { $regex: `${text}`, $options: 'i' } },          // Tìm hậu tố trong trường 'text'
                { hiragana: { $regex: `${text}`, $options: 'i' } },      // Tìm hậu tố trong trường 'hiragana'
                { romanji: { $regex: `${text}`, $options: 'i' } },        // Tìm hậu tố trong 'romanji'
                { "meaning.content": { $regex: `${text}`, $options: 'i' } }  // Tìm hậu tố trong 'meaning.content'
            ]
        };

        // Thực hiện truy vấn với điều kiện hậu tố
        const suffixResults = await Word.find(suffixCondition).limit(10 - prefixResults.length); // Giới hạn theo số lượng còn lại

        // Kết hợp kết quả từ cả hai truy vấn
        const results = [...prefixResults, ...suffixResults];

        const formattedResults = results.map(word => ({
            _id: word._id,
            text: word.text,
            hiragana: word.hiragana[0],
            meaning: word.meaning[0].content
        }));
        // Kiểm tra và trả về kết quả
        if (results.length > 0) {
            return res.status(StatusCodes.OK).json({
                status: "success",
                data: formattedResults
            });
        } else {
            throw new NotFoundError("Không tìm thấy từ nào phù hợp.");
        }

    } catch (error) {
        next(error);  
    }
};

