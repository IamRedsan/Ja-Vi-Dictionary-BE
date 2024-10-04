import Composition from "../models/Composition.js";

export const getAllCompositions = async (req, res) => {
    try {
        const compositions = await Composition.find();
        res.status(200).send(compositions);
    } catch (error) {
        console.log('Lỗi khi lấy dữ liệu compositions: ', error);
        res.status(500).send(error);
    }
};