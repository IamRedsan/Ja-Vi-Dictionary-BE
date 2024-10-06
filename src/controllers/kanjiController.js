import Kanji from "../models/Kanji.js";

//Get /api/v1/kanjis
export const getAllKanjis = async (req, res) => {
    try {
        const kanjis = await Kanji.find().populate('composition');
        res.status(200).send(kanjis);
    } catch (error) {
        console.log('Lỗi khi lấy dữ liệu kanji: ', error);
        res.status(500).send(error);
    }
};

//Get /api/v1/kanjis/list?page=2&limit=60
export const getKanjiList = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 60;
    try {
        const total = await Kanji.countDocuments();
        const totalPages = Math.ceil(total / limit);

        if (page > totalPages) {
            return res.json({
                message: 'No data',
                totalPages: totalPages,
                currentPage: page,
                kanjis: []
            });
        }
        const results = await Kanji.find({}, { text: 1, phonetic: 1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const formattedResults = results.map(kanji => ({
            text: kanji.text,
            phonetic: kanji.phonetic[0]
        }));

        return res.json({
            totalPages,
            currentPage: page,
            kanjis: formattedResults
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

//GET /api/v1/kanjis/jlpt/3?page=2&limit=10
export const getKanjiByJLPTLevel = async (req, res) => {
    const { level } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 60;

    if (!level || isNaN(level) || level < 1 || level > 5) {
        return res.status(400).json({ message: 'Please provide a valid JLPT level (1-5)' });
    }

    try {
        const total = await Kanji.countDocuments();
        const totalPages = Math.ceil(total / limit);

        if (page > totalPages) {
            return res.json({
                message: 'No data',
                totalPages: totalPages,
                currentPage: page,
                kanjis: []
            });
        }

        const results = await Kanji.find({ jlpt_level: level }, { text: 1, phonetic: 1 }).
            skip((page - 1) * limit).limit(limit);

        const formattedResults = results.map(kanji => ({
            text: kanji.text,
            phonetic: kanji.phonetic[0]
        }));

        if (formattedResults.length > 0) {
            return res.json({
                totalPages,
                currentPage: page,
                kanjis: formattedResults
            });
        } else {
            return res.status(404).json({ message: 'No Kanji found for the specified JLPT level' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

//GET /api/v1/kanjis/getById/670151f0e13093d82a7e1d6e
export const getKanjiById = async (req, res) => {
    const { id } = req.params;

    if (!id || id.trim() === '') {
        return res.status(400).json({ message: 'Error' });
    }

    try {
        const result = await Kanji.findById(id);
        if (result) {
            return res.json(result);
        } else {
            return res.status(404).json({ message: 'Kanji not found' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

//GET /api/v1/kanjis/getByText/容
export const getKanjiByText = async (req, res) => {
    const { text } = req.params;

    if (!text || text.trim() === '') {
        return res.status(400).json({ message: 'Please provide a valid Kanji character' });
    }

    try {
        const result = await Kanji.findOne({ text });
        if (result) {
            return res.json(result);
        } else {
            return res.status(404).json({ message: 'Kanji not found' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

//GET /api/v1/kanjis/search?text=ニ
export const searchKanji = async (req, res) => {
    const { text } = req.query;

    if (!text || text.trim() === '') {
        return res.status(400).json({ message: 'NotFound' });
    }

    try {
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

        if (prefixResults.length >= 10) {
            return res.json(prefixResults); // Trả về kết quả nếu đủ 10
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

        // Tìm kiếm kết quả với hậu tố
        const suffixResults = await Kanji.find(suffixQuery).limit(10 - prefixResults.length); // Giới hạn số kết quả thêm vào

        // Kết hợp kết quả tiền tố và hậu tố
        const combinedResults = [...prefixResults, ...suffixResults];

        if (combinedResults.length > 0) {
            return res.json(combinedResults);
        } else {
            return res.status(404).json({ message: 'No kanji found matching your search' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

