import BadRequestError from "../errors/BadRequestError.js";
import InternalServerError from "../errors/InternalServerError .js";
import NotFoundError from "../errors/NotFoundError.js";
import Kanji from "../models/Kanji.js";
import { StatusCodes } from "http-status-codes";

//Get /api/v1/kanjis
export const getAllKanjis = async (req, res, next) => {
    try {
        const kanjis = await Kanji.find().populate('composition');
        res.status(StatusCodes.OK).send(kanjis);
    } catch (error) {
        next(error);
    }
};

//Get /api/v1/kanjis/list?page=2&limit=60
export const getKanjiList = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 60;
    try {
        const total = await Kanji.countDocuments();
        const totalPages = Math.ceil(total / limit);

        if (page > totalPages) {
            throw new NotFoundError("Không có dữ liệu!");
        }
        const results = await Kanji.find({}, { text: 1, phonetic: 1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const formattedResults = results.map(kanji => ({
            id: kanji._id,
            text: kanji.text,
            phonetic: kanji.phonetic[0]
        }));

        return res.status(StatusCodes.OK).json({
            totalPages,
            currentPage: page,
            kanjis: formattedResults
        });
    } catch (error) {
        next(error);
    }
}

//GET /api/v1/kanjis/jlpt/3?page=2&limit=10
export const getKanjiByJLPTLevel = async (req, res, next) => {
    const level  = parseInt(req.query.level) || 5;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 60;

    try {
        const total = await Kanji.countDocuments({ jlpt_level: level} );
        const totalPages = Math.ceil(total / limit);

        if (page > totalPages) {
            throw new NotFoundError("Không có dữ liệu!");
        }

        const results = await Kanji.find({ jlpt_level: level }, { text: 1, phonetic: 1 }).
            skip((page - 1) * limit).limit(limit);

        const formattedResults = results.map(kanji => ({
            id: kanji._id,
            text: kanji.text,
            phonetic: kanji.phonetic[0]
        }));

        if (formattedResults.length > 0) {
            return res.status(StatusCodes.OK).json({
                totalPages,
                currentPage: page,
                kanjis: formattedResults
            });
        } else {
            throw new NotFoundError('Không tìm thấy kanji theo cấp độ JLPT được chỉ định!')
        }
    } catch (error) {
        next(error);
    }
};

//GET /api/v1/kanjis/getById/670151f0e13093d82a7e1d6e
export const getKanjiById = async (req, res, next) => {
    const { id } = req.params;
    
    try {
        if (!id || id.trim() === '') {
            throw new BadRequestError("Bad Request!");
        }

        const result = await Kanji.findById(id).populate("composition");
        console.log(result);
        if (result) {
            return res.status(StatusCodes.OK).json(result);
        } else {
            throw new NotFoundError("Không tìm thấy kanji!");
        }
    } catch (error) {
        next(error);
    }
};

//GET /api/v1/kanjis/getByText/容
export const getKanjiByText = async (req, res, next) => {
    const { text } = req.params;

    try {
        if (!text || text.trim() === '') {
            throw new BadRequestError("Bad Request!");
        }

        const result = await Kanji.findOne({ text });
        if (result) {
            return res.status(StatusCodes.OK).json(result);
        } else {
            throw new NotFoundError("Không tìm thấy kanji!");
        }
    } catch (error) {
        next(error);
    }
};

//GET /api/v1/kanjis/search?text=ニ
export const searchKanji = async (req, res, next) => {
    const { text } = req.query;

    try {
        if (!text || text.trim() === '') {
            throw new BadRequestError("Bad request");
        }

        // Tạo truy vấn cho tiền tố
        const prefixQuery = {
            $or: [
                { text: { $regex: `^${text}`, $options: 'i' } },
                { romanji: { $regex: `^${text}`, $options: 'i' } },
                { onyomi: { $regex: `^${text}`, $options: 'i' } },
                { kunyomi: { $regex: `^${text}`, $options: 'i' } },
                {
                    kunyomi: {
                        $elemMatch: {
                            $regex: `^-?${text}`,
                            $options: 'i'
                        }
                    }
                }
            ]
        };

        const prefixResults = await Kanji.find(prefixQuery).limit(10); // Giới hạn kết quả tìm kiếm là 10

        const formattedResults = prefixResults.map(kanji => ({
            id: kanji._id,
            text: kanji.text,
            phonetic: kanji.phonetic[0]
        }));

        if (prefixResults.length >= 10) {
            return res.status(StatusCodes.OK).json(formattedResults); // Trả về kết quả nếu đủ 10
        }

        // Nếu không đủ 10 kết quả, tạo truy vấn cho hậu tố
        const suffixQuery = {
            $or: [
                { text: { $regex: `${text}$`, $options: 'i' } },
                { romanji: { $regex: `${text}$`, $options: 'i' } },
                { onyomi: { $regex: `${text}$`, $options: 'i' } },
                { kunyomi: { $regex: `${text}$`, $options: 'i' } },
                {
                    kunyomi: {
                        $elemMatch: {
                            $regex: `^-?${text}$`,
                            $options: 'i'
                        }
                    }
                }
            ]
        };

        const suffixResults = await Kanji.find(suffixQuery).limit(10 - prefixResults.length); // Giới hạn số kết quả thêm vào

        const combinedResults = [...prefixResults, ...suffixResults];

        const formattedResults2 = combinedResults.map(kanji => ({
            id: kanji._id,
            text: kanji.text,
            phonetic: kanji.phonetic[0]
        }));

        if (combinedResults.length > 0) {
            return res.status(StatusCodes.OK).json(formattedResults2);
        } else {
            throw new NotFoundError("Không tìm thấy kanji nào!");
        }
    } catch (error) {
        next(error);
    }
};

