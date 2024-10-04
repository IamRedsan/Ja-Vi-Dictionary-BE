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