import BadRequestError from "../errors/BadRequestError.js";
import NotFoundError from "../errors/NotFoundError.js";
import Kanji from "../models/Kanji.js";
import Word from "../models/Word.js";
import { isKanji } from "../utils/isKanji.js";
import User from "../models/User.js";
import toRomaji from "../utils/toRomaji.js";

const getAllKanjis = async (data) => {
    const page = parseInt(data.query.page);
    const limit = parseInt(data.query.limit);

    try {
        if (!page || !limit) {
            const results = await Kanji.find().populate('composition');
            return {
                totalPages: 1,
                currentPage: 1,
                data: results
            };
        }

        const total = await Kanji.countDocuments();
        const totalPages = Math.ceil(total / limit);

        if (page > totalPages) {
            throw new NotFoundError("Không có dữ liệu!");
        }

        const results = await Kanji.find().populate('composition')
            .skip((page - 1) * limit)
            .limit(limit);

        if (results.length > 0) {
            return {
                totalPages,
                currentPage: page,
                data: results
            };
        } else {
            throw new NotFoundError("Không tìm thấy Kanji!");
        }
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
            phonetic: kanji.phonetic,
            jlpt_level: level
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

        if (!result) {
            throw new NotFoundError("Không tìm thấy kanji!");
        }

        if (result.comments && Array.isArray(result.comments)) {
            result.comments.sort((a, b) => {
                const likesDiff = b.liked_by.length - a.liked_by.length;
                if (likesDiff !== 0) {
                    return likesDiff;
                }
                return new Date(b.created_at) - new Date(a.created_at); 
            });
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
            throw new NotFoundError("Không tìm thấy kanji!");
        }

        const user = await User.findById(userId);
        if(!user){
            throw new NotFoundError("Không tìm thấy người dùng!");
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
        throw error;
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

const addNewKanji = async (req) => {
    try{
        const {text, phonetic, onyomi, kunyomi, stroke, jlpt_level, composition, meaning} = req.body;
        if(!text || !phonetic || !onyomi || !kunyomi || !stroke){
            throw new BadRequestError("Thiếu thông tin cần thiết để thêm kanji mới!");
        }

        const existingKanji = await Kanji.findOne({text});
        if(existingKanji) {
            throw new BadRequestError("Kanji đã tồn tại!");
        }

        const romanjiOnyomi = onyomi.map(onyomiReading => toRomaji(onyomiReading));
        const romanjiKunyomi = kunyomi.map(kunyomiReading => toRomaji(kunyomiReading));
        const romanji = [...romanjiOnyomi, ...romanjiKunyomi];

        const newKanji = new Kanji({
            text, 
            phonetic,
            onyomi, 
            kunyomi,
            jlpt_level,
            composition,
            meaning,
            romanji
        });

        const savedKanji = await newKanji.save();
        return savedKanji.populate("composition");
    }catch(error){
        throw error;
    }
}

const updateKanji = async (req) => {
    try {
        const { id } = req.params; // Lấy ID từ URL
        const { text, phonetic, onyomi, kunyomi, stroke, jlpt_level, composition, meaning } = req.body;

        // Kiểm tra ID
        if (!id) {
            throw new BadRequestError("Thiếu ID kanji cần cập nhật.");
        }

        // Tìm kanji cần cập nhật
        const existingKanji = await Kanji.findById(id);
        if (!existingKanji) {
            throw new NotFoundError("Không tìm thấy kanji cần cập nhật.");
        }

        // Cập nhật các trường cần thiết
        existingKanji.text = text || existingKanji.text;
        existingKanji.phonetic = phonetic || existingKanji.phonetic;
        existingKanji.stroke = stroke || existingKanji.stroke;
        existingKanji.jlpt_level = jlpt_level || existingKanji.jlpt_level;
        existingKanji.composition = composition || existingKanji.composition;
        existingKanji.meaning = meaning || existingKanji.meaning;

        // Cập nhật onyomi và kunyomi nếu có
        if (onyomi) {
            existingKanji.onyomi = onyomi;
        }
        if (kunyomi) {
            existingKanji.kunyomi = kunyomi;
        }

        // Cập nhật romanji
        const romanjiOnyomi = existingKanji.onyomi.map(onyomiReading => toRomaji(onyomiReading));
        const romanjiKunyomi = existingKanji.kunyomi.map(kunyomiReading => toRomaji(kunyomiReading));
        existingKanji.romanji = [...romanjiOnyomi, ...romanjiKunyomi];

        // Lưu lại thay đổi
        const updatedKanji = await existingKanji.save();
        return updatedKanji.populate('composition');
    } catch (error) {
        throw error;
    }
};

const deleteKanji = async (req) => {
    try {
        const { id } = req.params; // Lấy ID từ URL

        // Kiểm tra ID
        if (!id) {
            throw new BadRequestError("Thiếu ID kanji cần xóa.");
        }

        // Tìm kanji cần xóa
        const existingKanji = await Kanji.findById(id);
        if (!existingKanji) {
            throw new NotFoundError("Không tìm thấy kanji cần xóa.");
        }

        // Xóa kanji khỏi cơ sở dữ liệu
        await Kanji.findByIdAndDelete(id);

        return { message: "Kanji đã được xóa thành công." };
    } catch (error) {
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
    getKanjiComments,
    addNewKanji,
    updateKanji,
    deleteKanji
}