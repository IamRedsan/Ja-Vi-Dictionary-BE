import BadRequestError from "../errors/BadRequestError.js";
import NotFoundError from "../errors/NotFoundError.js";
import Kanji from "../models/Kanji.js";
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
            phonetic: kanji.phonetic[0]
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
            throw new BadRequestError("Bad Request!");
        }

        const result = await Kanji.findById(id).populate("composition");

        if (result) {
            return result;
        } else {
            throw new NotFoundError("Không tìm thấy kanji!");
        }
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

const isKanji = (char) => {
    const code = char.charCodeAt(0);
    return (code >= 0x4E00 && code <= 0x9FBF); // Phạm vi Unicode cho Kanji
};

const searchKanji = async (data) => {
    const { text } = data.query;

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
            result = await Kanji.find(kanjiQuery).limit();
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
            result = await Kanji.find(query).limit(10);

            if (result.length < 10) {
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
            phonetic: kanji.phonetic[0],
            onyomi: kanji.onyomi,
            kunyomi: kanji.kunyomi
        }));

        if (formattedResults.length > 0) {
            return formattedResults;
        } else {
            throw new NotFoundError("Không tìm thấy kanji nào!");
        }

    } catch (error) {
        throw error;
    }
};

export const kanjiService = {
    getAllKanjis,
    getKanjiByJLPTLevel,
    getKanjiById,
    getKanjiByText,
    searchKanji
}