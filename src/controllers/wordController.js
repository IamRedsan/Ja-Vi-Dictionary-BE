import Word from "../models/Word.js";

export const getAllWords = async (req, res) => {
    try {
        const words = await Word.find();
        res.status(200).send(words);
    } catch (error) {
        console.log('Lỗi khi lấy dữ liệu word: ', error);
        res.status(500).send(error);
    }
};