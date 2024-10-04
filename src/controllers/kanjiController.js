import Kanji from "../models/Kanji.js";

export const getAllKanjis = async (req, res) => {
    try {
        const kanjis = await Kanji.find().populate('composition');
        res.status(200).send(kanjis);
    } catch (error) {
        console.log('Lỗi khi lấy dữ liệu kanji: ', error);
        res.status(500).send(error);
    }
};

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

export const searchKanji = async (req, res) => {
    const { text } = req.query;

    if (!text || text.trim() === '') {
        return res.status(400).json({ message: 'Please provide a valid search term' });
    }

    try {
        const query = {
            $or: [
                { text: { $regex: `^${text}`, $options: 'i' } },
                { onyomi: { $regex: `^${text}`, $options: 'i' } },
                { kunyomi: { $regex: `^${text}`, $options: 'i' } },
            ]
        };

        const results = await Kanji.find(query);

        if (results.length > 0) {
            return res.json(results);
        } else {
            return res.status(404).json({ message: 'No kanji found matching your search' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
