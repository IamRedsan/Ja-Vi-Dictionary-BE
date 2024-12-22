import Composition from "../models/Composition.js";
import NotFoundError from "../errors/NotFoundError.js";
import BadRequestError from "../errors/BadRequestError.js";
import Kanji from "../models/Kanji.js";
import ForbiddenError from "../errors/ForbiddenError.js";

const getAllCompositions = async (data) => {
    const page = parseInt(data.query.page);
    const limit = parseInt(data.query.limit);

    try {
        // Nếu không có page hoặc limit, trả về tất cả compositions
        if (!page || !limit) {
            const results = await Composition.find();
            return {
                totalPages: 1,
                currentPage: 1,
                data: results
            };
        }

        const total = await Composition.countDocuments();
        const totalPages = Math.ceil(total / limit);

        // Kiểm tra nếu page lớn hơn totalPages
        if (page > totalPages) {
            throw new NotFoundError("Không có dữ liệu!");
        }

        // Lấy compositions với phân trang
        const results = await Composition.find()
            .skip((page - 1) * limit)
            .limit(limit);

        // Nếu không tìm thấy kết quả
        if (results.length > 0) {
            return {
                totalPages,
                currentPage: page,
                data: results
            };
        } else {
            throw new NotFoundError("Không tìm thấy bài sáng tác!");
        }
    } catch (error) {
        throw error;
    }
};

const addNewComposition = async (req) => {
    try{
        const {raw_text, phonetic} = req.body;

        const existingComp = await Composition.findOne({raw_text});
        if(existingComp) {
            throw new BadRequestError("Bộ đã tồn tại!");
        }

        if(!raw_text || !phonetic) {
            throw new BadRequestError("Thiếu thông tin để thêm bộ mới!");
        }

        const newComp = new Composition({
            raw_text,
            phonetic
        })

        const savedComp = await newComp.save();
        return savedComp;
    }catch(error){
        throw error;
    }
}

const updateComposition = async (req) => {
    try {
        const { id } = req.params; // Lấy ID từ URL
        const { raw_text, phonetic } = req.body; // Lấy dữ liệu từ payload

        // Kiểm tra ID
        if (!id) {
            throw new BadRequestError("Thiếu ID của bộ cần cập nhật!");
        }

        // Tìm bộ cần cập nhật
        const existingComp = await Composition.findById(id);
        if (!existingComp) {
            throw new NotFoundError("Không tìm thấy bộ cần cập nhật!");
        }

        // Cập nhật các trường cần thiết
        existingComp.raw_text = raw_text || existingComp.raw_text;
        existingComp.phonetic = phonetic || existingComp.phonetic;

        // Lưu thay đổi
        const updatedComp = await existingComp.save();
        return updatedComp;
    } catch (error) {
        throw error;
    }
};

const deleteComposition = async (req) => {
    try {
        const { id } = req.params; // Lấy ID từ URL

        // Kiểm tra ID
        if (!id) {
            throw new BadRequestError("Thiếu ID của bộ cần xóa!");
        }

        // Tìm bộ cần xóa
        const existingComp = await Composition.findById(id);
        if (!existingComp) {
            throw new NotFoundError("Không tìm thấy bộ cần xóa!");
        }

        // Kiểm tra xem composition có đang được sử dụng trong bất kỳ Kanji nào không
        const kanjiUsingComp = await Kanji.findOne({ composition: id });
        if (kanjiUsingComp) {
            throw new ForbiddenError("Không thể xóa bộ này vì nó đang được sử dụng trong một hoặc nhiều kanji!");
        }

        // Nếu không có kanji nào sử dụng composition, thực hiện xóa
        await Composition.findByIdAndDelete(id);

        return { message: "Bộ đã được xóa thành công!" };
    } catch (error) {
        throw error;
    }
};

const getCompositionByID = async (req) => {
    try {
        const { id } = req.params; // Lấy ID từ URL

        // Kiểm tra ID
        if (!id) {
            throw new BadRequestError("Thiếu ID của bộ cần lấy!");
        }

        // Tìm bộ theo ID
        const composition = await Composition.findById(id);
        if (!composition) {
            throw new NotFoundError("Không tìm thấy bộ với ID đã cho!");
        }

        // Trả về bộ đã tìm thấy
        return composition;
    } catch (error) {
        throw error;
    }
};

const getCompositionByRawText = async (req) => {
    try {
        const { raw_text } = req.params; 

        // Kiểm tra raw_text
        if (!raw_text) {
            throw new BadRequestError("Thiếu thông tin raw_text để tìm bộ!");
        }

        const composition = await Composition.findOne({ raw_text });
        if (!composition) {
            throw new NotFoundError("Không tìm thấy bộ với raw_text đã cho!");
        }

        return composition;
    } catch (error) {
        throw error;
    }
};


export const compositionService = {
    getAllCompositions,
    updateComposition,
    deleteComposition,
    addNewComposition,
    getCompositionByID,
    getCompositionByRawText
}