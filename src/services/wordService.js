import Word from "../models/Word.js";
import Kanji from "../models/Kanji.js";
import BadRequestError from "../errors/BadRequestError.js";
import NotFoundError from "../errors/NotFoundError.js";
import toRomaji from "../utils/toRomaji.js";
import extractKanjiCharacters from "../utils/extractKanjiCharacters.js";

const getAllWords = async (data) => {
    const page = parseInt(data.query.page);
    const limit = parseInt(data.query.limit);

    try {
        if (!page || !limit) {
            const results = await Word.find();
            return {
                totalPages: 1,
                currentPage: 1,
                data: results
            };
        }

        const total = await Word.countDocuments();
        const totalPages = Math.ceil(total / limit);

        if (page > totalPages) {
            throw new NotFoundError("Không có dữ liệu!");
        }

        const results = await Word.find()
            .skip((page - 1) * limit)
            .limit(limit);

        if (results.length > 0) {
            return {
                totalPages,
                currentPage: page,
                data: results
            };
        } else {
            throw new NotFoundError("Không tìm thấy từ vựng!");
        }
    } catch (error) {
        throw error;
    };
};

const getWordById = async (data) => {
    try {
        const { id } = data.params;

        if (!id || id.trim() === '') {
            throw new BadRequestError("ID không hợp lệ!");
        }
        
        const result = await Word.findById(id).populate({
            path: "comments.user",
            select: 'fullname avatar' 
        }).lean();
        if (result) {
            if (result.comments && Array.isArray(result.comments)) {
                result.comments.sort((a, b) => {
                    const likesDiff = (b.liked_by?.length || 0) - (a.liked_by?.length || 0); 
                    if (likesDiff !== 0) {
                        return likesDiff; 
                    }
                    return new Date(b.created_at) - new Date(a.created_at); 
                });
            }

            const kanjiInfoPromises = result.kanji.map(async (kanjiChar) => {
                const kanjiData = await Kanji.find({ text: kanjiChar });
 
                if (kanjiData && kanjiData.length > 0) {
                    return kanjiData;
                } else {
                    return; 
                }
            });

            const kanjiInfoArray = await Promise.all(kanjiInfoPromises);
            const flattenedKanjiInfoArray = kanjiInfoArray.flat().filter(item => item);

            result.kanji = flattenedKanjiInfoArray || {};
            return result;
        } else {
            throw new NotFoundError("Không tìm thấy dữ liệu!");
        }   
    } catch (error) {
        throw error;
    }
};

const searchWord = async (data) => {
    const { text } = data.query;
    try {
        if (!text || text.trim() === "") {
            throw new BadRequestError("Bad request");
        }

        const prefixCondition = {
            $or: [
                { text: { $regex: `^${text}`, $options: 'i' } },          
                { hiragana: { $regex: `^${text}`, $options: 'i' } },      
                { romanji: { $regex: `^${text}`, $options: 'i' } },       
                { "meaning.content": { $regex: `^${text}`, $options: 'i' } } 
            ]
        };

        let results = await Word.find(prefixCondition).limit(10); 

        if (results.length < 10) {
            const suffixCondition = {
                $or: [
                    { text: { $regex: `${text}`, $options: 'i' } },          // Tìm hậu tố trong trường 'text'
                    { hiragana: { $regex: `${text}`, $options: 'i' } },      // Tìm hậu tố trong trường 'hiragana'
                    { romanji: { $regex: `${text}`, $options: 'i' } },        // Tìm hậu tố trong 'romanji'
                    { "meaning.content": { $regex: `${text}`, $options: 'i' } }  // Tìm hậu tố trong 'meaning.content'
                ]
            };

            const suffixResults = await Word.find(suffixCondition).limit(10 - results.length); // Giới hạn theo số lượng còn lại
            
            results = [...results, ...suffixResults];
        }

        const uniqueResults = {};
        results.forEach(kanji => {
            uniqueResults[kanji._id] = kanji; 
        });

        const formattedResults = Object.values(uniqueResults).map(word => ({
            _id: word._id,
            text: word.text,
            hiragana: word.hiragana[0],
            meaning: word.meaning[0].content
        }));

        
        return formattedResults;

    } catch (error) {
        throw error;
    }
};

const addNewWord = async (data) => {
    try{
        const { text, hiragana, meaning, examples } = data.body;

        if (!text || !meaning) {
            throw new BadRequestError("Thiếu thông tin cần thiết để thêm từ mới.");
        }
        
        const existingWord = await Word.findOne({text});
        if(existingWord){
            throw new BadRequestError("Từ kanji này đã tồn tại!");
        }

        const romanji = hiragana.map(hira => toRomaji(hira));
        const kanji = extractKanjiCharacters(text);
        const word = new Word({
            text, 
            hiragana,
            meaning,
            examples,
            romanji, 
            kanji
        });

        const savedWord = await word.save();
        return savedWord;
    }catch(error){
        throw error;
    }
}

const updateWord = async (req) => {
    try {
        const { id } = req.params; // Lấy ID từ URL
        const { text, hiragana, meaning, examples } = req.body; // Lấy dữ liệu từ payload

        // Kiểm tra ID và các trường cần thiết
        if (!id) {
            throw new BadRequestError("Thiếu ID từ cần cập nhật.");
        }

        // Tìm từ cần cập nhật
        const existingWord = await Word.findById(id);
        if (!existingWord) {
            throw new NotFoundError("Không tìm thấy từ cần cập nhật.");
        }

        // Cập nhật các trường cần thiết
        existingWord.text = text || existingWord.text;
        existingWord.hiragana = hiragana || existingWord.hiragana;
        existingWord.meaning = meaning || existingWord.meaning;
        existingWord.examples = examples || existingWord.examples;

        // Cập nhật romanji và kanji
        existingWord.romanji = hiragana.map(hira => toRomaji(hira));
        existingWord.kanji = extractKanjiCharacters(text);

        // Lưu lại thay đổi
        const updatedWord = await existingWord.save();
        return updatedWord;
    } catch (error) {
        throw error;
    }
};

const deleteWord = async (req) => {
    try {
        const { id } = req.params; 

        if (!id) {
            throw new BadRequestError("Thiếu ID từ cần xóa.");
        }

        const existingWord = await Word.findById(id);
        if (!existingWord) {
            throw new NotFoundError("Không tìm thấy từ cần xóa.");
        }

        await Word.findByIdAndDelete(id);

        return { message: "Từ đã được xóa thành công." };
    } catch (error) {
        throw error;
    }
};

export const wordService = {
    getAllWords,
    getWordById,
    searchWord,
    addNewWord,
    updateWord,
    deleteWord
} 