import mongoose from "mongoose";
import BadRequestError from "../errors/BadRequestError.js";
import Card from "../models/Card.js";
import Deck from "../models/Deck.js";
import ReviewLog from "../models/ReviewLog.js";
import User from "../models/User.js";

const getDecks = async (req)=>{
    try{
        const userId = req.userId;
        if (!userId) {
            throw new Error("User ID không được cung cấp!");
        };

        const objectId = new mongoose.Types.ObjectId(userId);
        const decks = await Deck.find({createdBy: objectId}); 
        return decks;
    }catch(err){
        throw err;
    }
};

const getCards = async (req)=>{
    try{
        const userId = req.userId;
        if (!userId) {
            throw new Error("User ID không được cung cấp!");
        };
        const objectId = new mongoose.Types.ObjectId(userId);
        const cards = await Card.find({createdBy: objectId}); 
        return cards;
    }catch(err){
        throw err;
    }
};

const getReviewLogs = async (req)=>{
    try{
        const userId = req.userId;
        if (!userId) {
            throw new Error("User ID không được cung cấp!");
        };

        const objectId = new mongoose.Types.ObjectId(userId);
        const reviewLogs = await ReviewLog.find({createdBy: objectId}); 
        return reviewLogs;
    }catch(err){
        throw err;
    }
};

const getAnkiInfo = async (req) => {
    try{
        const decks = await getDecks(req);
        const cards = await getCards(req);
        const reviewLogs = await getReviewLogs(req);

        return {
            decks,
            cards,
            reviewLogs
        }
    }catch(error){  
        throw error;
    }
};

const updateAnki = async (req) => {
    try{
        const {decks, cards, reviewLogs} = req.body;
        const userId = req.userId;

        if(!decks){
            throw new BadRequestError("Tham số decks không hợp lệ!");
        }

        const user = await User.findById(userId);

        // Cập nhật decks
        for (const deck of decks) {
            switch (deck.action) {
                case 0: // Thêm mới
                    await Deck.create({ ...deck, createdBy: user });
                    break;
                case 1: // Cập nhật
                    await Deck.updateOne(
                        { _id: deck._id },
                        { $set: deck }
                    );
                    break;
                case 2: // Xóa
                    await Deck.deleteOne({ _id: deck._id });
                    break;
                default:
                    break;
            }
        }

        // Cập nhật cards
        if(cards){
            for (const card of cards) {
                switch (card.action) {
                    case 0: // Thêm mới
                        await Card.create({ ...card });
                        break;
                    case 1: // Cập nhật
                        await Card.updateOne(
                            { _id: card._id },
                            { $set: card }
                        );
                        break;
                    case 2: // Xóa
                        await Card.deleteOne({ _id: card._id });
                        break;
                    default:
                        break;
                }
            }    
        }
        
        // Cập nhật reviewLogs
        if(reviewLogs){
            for (const log of reviewLogs) {
                switch (log.action) {
                    case 0: // Thêm mới
                        await ReviewLog.create({ ...log });
                        break;
                    case 1: // Cập nhật
                        await ReviewLog.updateOne(
                            { _id: log._id },
                            { $set: log }
                        );
                        break;
                    case 2: // Xóa
                        await ReviewLog.deleteOne({ _id: log._id });
                        break;
                    default:
                        break;
                }
            }
        }
        
        return {message: "Cập nhật thành công!"};
    }catch(err){
        throw err;
    }
}

export const ankiService = {
    getDecks,
    getCards, 
    getReviewLogs,
    updateAnki,
    getAnkiInfo
} 