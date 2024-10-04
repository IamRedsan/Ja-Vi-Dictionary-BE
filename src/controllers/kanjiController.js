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

export const getKanjiList = async (req, res) => {
    try {
        const results = await Kanji.find({}, { text: 1, phonetic: 1 });

        const formattedResults = results.map(kanji => ({
            text: kanji.text,
            phonetic: kanji.phonetic[0]
        }));
        return res.json(formattedResults);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const getKanjiByJLPTLevel = async (req, res) => {
    const { level } = req.params;
    if (!level || isNaN(level) || level < 1 || level > 5) {
        return res.status(400).json({ message: 'Please provide a valid JLPT level (1-5)' });
    }

    try {

        const results = await Kanji.find({ jlpt_level: level }, { text: 1, phonetic: 1 });
        const formattedResults = results.map(kanji => ({
            text: kanji.text,
            phonetic: kanji.phonetic[0]
        }));

        if (formattedResults.length > 0) {
            return res.json(formattedResults);
        } else {
            return res.status(404).json({ message: 'No Kanji found for the specified JLPT level' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
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
