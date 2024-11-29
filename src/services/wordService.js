import Word from "../models/Word.js";
import Kanji from "../models/Kanji.js";
import mongoose from "mongoose";
import BadRequestError from "../errors/BadRequestError.js";
import NotFoundError from "../errors/NotFoundError.js";

const getAllWords = async () => {
    try {
        const words = await Word.find();
        return words;
    } catch(error) {
        throw error;
    };
};

const getWordById = async (data) => {
    try {
        const { id } = data.params;

        if (!id || id.trim() === '' || !mongoose.isValidObjectId(id)) {
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
        console.log(error);
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

export const wordService = {
    getAllWords,
    getWordById,
    searchWord
} 