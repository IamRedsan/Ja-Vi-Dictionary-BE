import { StatusCodes } from "http-status-codes";
import User from "../models/User.js";
import Kanji from "../models/Kanji.js";
import Word from "../models/Word.js";

const getDashboard = async (req, res) => {
    try {
        // Đếm tổng số user, kanji và word
        const user = await User.countDocuments();
        const kanji = await Kanji.countDocuments();
        const word = await Word.countDocuments();

        const currentDate = new Date();

        const userRegister = [];

        for (let i = 5; i >= 0; i--) {
            const month = currentDate.getMonth() - i;
            const year = currentDate.getFullYear();

            // Điều chỉnh tháng và năm khi tháng < 0 hoặc > 11
            const adjustedMonth = (month + 12) % 12;
            const adjustedYear = year + Math.floor(month / 12);

            // Xác định ngày đầu và cuối tháng
            const startOfMonth = new Date(adjustedYear, adjustedMonth, 1);
            const endOfMonth = new Date(adjustedYear, adjustedMonth + 1, 0);

            // Đếm số lượng user đăng ký trong tháng
            const count = await User.countDocuments({
                created_at: { $gte: startOfMonth, $lte: endOfMonth },
            });

            userRegister.push({
                count,
                month: adjustedMonth + 1, 
                year: adjustedYear,
            });
        }

        // Trả về dữ liệu theo yêu cầu
        return {
            user,
            kanji,
            word,
            userRegister,
        };
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: error.message,
        });
    }
};


export const dashboardService = {
    getDashboard
}