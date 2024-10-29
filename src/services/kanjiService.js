import BadRequestError from "../errors/BadRequestError.js";
import NotFoundError from "../errors/NotFoundError.js";
import Kanji from "../models/Kanji.js";
import Word from "../models/Word.js";
import { isKanji } from "../utils/isKanji.js";
import User from "../models/User.js";
const getAllKanjis = async () => {
    try {
        const kanjis = await Kanji.find().populate('composition');
        return kanjis;
    } catch (error) {
        throw error;
    }
};

const getKanjiByJLPTLevel = async (data) => {
    const level  = parseInt(data.query.level) || 5;
    const page = parseInt(data.query.page) || 1;
    const limit = parseInt(data.query.limit) || 60;

    try {
        const total = await Kanji.countDocuments({ jlpt_level: level} );
        const totalPages = Math.ceil(total / limit);

        if (page > totalPages) {
            throw new NotFoundError("Không có dữ liệu!");
        }

        const results = await Kanji.find({ jlpt_level: level }, { text: 1, phonetic: 1 }).
            skip((page - 1) * limit).limit(limit);

        const formattedResults = results.map(kanji => ({
            _id: kanji._id,
            text: kanji.text,
            phonetic: kanji.phonetic
        }));

        if (formattedResults.length > 0) {
            return {
                totalPages,
                currentPage: page,
                data: formattedResults
            };
        } else {
            throw new NotFoundError('Không tìm thấy kanji theo cấp độ JLPT được chỉ định!')
        }
    } catch (error) {
        throw error;
    }
};

const getKanjiById = async (data) => {
    const { id } = data.params;

    try {
        if (!id || id.trim() === '') {
            throw new BadRequestError("Bad Request! ID không hợp lệ.");
        }

        const result = await Kanji.findById(id)
            .populate("composition")
            .populate({
                path: "comments.user",
                select: 'fullname avatar' 
            }).lean();

        // Kiểm tra nếu không tìm thấy kanji
        if (!result) {
            throw new NotFoundError("Không tìm thấy kanji!");
        }

        const relatedWord = await searchWordByKanji(result.text);
        const formattedRelatedWord = relatedWord.map((relatedChild) => ({
            _id: relatedChild._id,
            text: relatedChild.text,
            hiragana: relatedChild.hiragana[0] || '', 
            meaning: relatedChild.meaning[0]?.content || '' 
        }));

        return {
            ...result,
            relatedWord: formattedRelatedWord
        };
    } catch (error) {
        throw error; 
    }
};

const getKanjiByText = async (data) => {
    const { text } = data.params;

    try {
        if (!text || text.trim() === '') {
            throw new BadRequestError("Bad Request!");
        }

        const result = await Kanji.findOne({ text });
        if (result) {
            return result;
        } else {
            throw new NotFoundError("Không tìm thấy kanji!");
        }
    } catch (error) {
        throw error;
    }
};

const searchKanji = async (data) => {
    const { text } = data.query;
    const limit = 16;
    try {
        if (!text || text.trim() === '') {
            throw new BadRequestError("Bad request");
        }
        const kanjiChars = [...text].filter(char => isKanji(char)); 

        let result = [];

        if (kanjiChars.length > 0) {
            const kanjiQueries = kanjiChars.map(char => ({
                text: { $regex: char, $options: 'i' }
            }));

            const kanjiQuery = { $or: kanjiQueries };
            result = await Kanji.find(kanjiQuery).limit(limit);
        } else {
            const query = {
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
            result = await Kanji.find(query).limit(limit);

            if (result.length < limit) {
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
    
                const suffixResults = await Kanji.find(suffixQuery).limit(10 - result.length);
                result = [...result, ...suffixResults];
            }
        }

        const uniqueResults = {};
        result.forEach(kanji => {
            uniqueResults[kanji._id] = kanji; 
        });

        const formattedResults = Object.values(uniqueResults).map(kanji => ({
            _id: kanji._id,
            text: kanji.text,
            phonetic: kanji.phonetic,
            onyomi: kanji.onyomi,
            kunyomi: kanji.kunyomi
        }));

        return formattedResults;
    } catch (error) {
        throw error;
    }
};

const searchWordByKanji = async (text) =>{
    try{
        const limit = 4;
        const query = { text: { $regex: `${text}`, $options: 'i' } }
        const result = await Word.find(query).limit(limit);
        return result;
    }catch(error){
        throw error;
    }
};  

const kanjiComment = async (req) => {
    try{
        const {kanjiId} = req.params;
        const { userId, content } = req.body;

        const kanji = await Kanji.findById(kanjiId);
        if(!kanji){
            throw NotFoundError("Không tìm thấy kanji!");
        }

        const user = await User.findById(userId);
        if(!user){
            throw NotFoundError("Không tìm thấy người dùng!");
        }

        const newComment = {
            user: user._id,
            content,
            liked_by: [],
            crecreated_at: new Date()
        }

        if(!kanji.comments){
            kanji.comments = [newComment];
        }else {
            kanji.comments.push(newComment);
        }
        await kanji.save();

        return kanji.comments;

    }catch(error){
        next(error);
    }
}

const getKanjiComments = async (req) => {
    try{
        const {kanjiId} = req.params;

        const kanji = await Kanji.findById(kanjiId);
        if(!kanji){
            throw new NotFoundError("Không tìm thấy kanji!");
        }

        return kanji.comments || [];
    }catch(error){
        throw error;
    }
};

export const kanjiService = {
    getAllKanjis,
    getKanjiByJLPTLevel,
    getKanjiById,
    getKanjiByText,
    searchKanji,
    kanjiComment,
    getKanjiComments
}