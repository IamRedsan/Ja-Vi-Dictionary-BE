import mongoose from "mongoose";
import BadRequestError from "../errors/BadRequestError.js";
import Card from "../models/Card.js";
import Deck from "../models/Deck.js";
import ReviewLog from "../models/ReviewLog.js";
import ActionLog from "../models/ActionLog.js";
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

const getActionLogs = async (req) => {
    try{
        const userId = req.userId;
        if (!userId) {
            throw new Error("User ID không được cung cấp!");
        };

        const objectId = new mongoose.Types.ObjectId(userId);
        const actionLogs = await ActionLog.find({createdBy: objectId}).sort({createdDate: 'asc'}); 
        return actionLogs;
    }catch(err){
        throw err;
    }
}

const mergeFromClient = async (req) => {
    try{
        const {logs, modoruLogsLength, actionLogs, isCompletelyDifferent} = req.body;
        const userId = req.userId;
    
        if(isCompletelyDifferent) {
            await ActionLog.deleteMany({createdBy: userId});
        } else {
            await ActionLog.deleteMany({createdBy: userId, createdDate: {$gt: actionLogs[0]?.createdDate ?? new Date().toISOString()}});
        }
        await ActionLog.create(actionLogs.map((v) => ({...v, createdBy: userId})));
    
        for(let i = 0; i !== logs.length; ++i) {
            const log = logs[i];
    
            switch(log.tableId) {
                case 0: //Table.DECK:
                    switch(log.action) {
                        case 0: //Action.CREATE:
                            if(log.data !== null) {
                                if(i < modoruLogsLength) {
                                    await Deck.create({...log.data.deck, createdBy: userId});
                                    await Card.create(log.data.cards.map((v) => ({...v, createdBy: userId})));
                                    await ReviewLog.create(log.data.reviewLogs.map((v) => ({...v, createdBy: userId})));
                                } else {
                                    await Deck.create({...log.data, createdBy: userId});
                                }
                            }
                            break;
                        case 1: //Action.UPDATE:
                            if(log.data !== null) {
                                await Deck.updateOne({createdBy: userId, id: log.targetId}, log.data);
                            }
                            break;
                        case 2: //Action.DELETE:
                            await Deck.deleteOne({createdBy: userId, id: log.targetId});
                            await Card.deleteMany({createdBy: userId, deckId: log.targetId});
                            await ReviewLog.deleteMany({createdBy: userId, deckId: log.targetId})
                            break;
                    }
                    break;
                case 1: //Table.CARD:
                    switch(log.action) {
                        case 0: //Action.CREATE:
                            if(log.data !== null) {
                                if(i < modoruLogsLength) {
                                    await Card.create({...log.data.card, createdBy: userId});
                                    await ReviewLog.create(log.data.reviewLogs.map((v) => ({...v, createdBy: userId})));
                                } else {
                                    await Card.create({...log.data, createdBy: userId});
                                }
                            }
                            break;
                        case 1: //Action.UPDATE:
                            if(log.data !== null) {
                                await Card.updateOne({createdBy: userId, id: log.targetId}, log.data);
                            }
                            break;
                        case 2: //Action.DELETE:
                            await Card.deleteOne({createdBy: userId, id: log.targetId});
                            await ReviewLog.deleteMany({createdBy: userId, cardId: log.targetId})
                            break;
                    }
                    break;
                case 2: //Table.REVIEW_LOG:
                    switch(log.action) {
                        case 0: //Action.CREATE:
                            if(log.data !== null) {
                                await ReviewLog.create({...log.data, createdBy: userId});
                            }
                            break;
                        case 1: //Action.UPDATE:
                            break;
                        case 2: //Action.DELETE:
                            await ReviewLog.deleteOne({createdBy: userId, id: log.targetId})
                            break;
                    }
                    break;
              }
        }
    }catch(err){
        throw err;
    }
}

const fillLogs = async (req) => {
    try{
        const {logs, modoruLogsLength} = req.body;
        const userId = req.userId;
    
        for(let i = 0; i !== logs.length; ++i) {
            const log = logs[i];

            switch(log.tableId) {
                case 0: //Table.DECK:
                    switch(log.action) {
                        case 0: //Action.CREATE:
                            if(i < modoruLogsLength) {
                                log.data = {
                                    deck: await Deck.findOne({createdBy: userId, id: log.targetId}),
                                    cards: await Card.find({createdBy: userId, deckId: log.targetId}),
                                    reviewLogs: await ReviewLog.find({createdBy: userId, deckId: log.targetId})
                                }
                            } else {
                                log.data = await Deck.findOne({createdBy: userId, id: log.targetId});
                            }
                            break;
                        case 1: //Action.UPDATE:
                            log.data = await Deck.findOne({createdBy: userId, id: log.targetId});
                            break;
                        case 2: //Action.DELETE:
                            break;
                    }
                    break;
                case 1: //Table.CARD:
                    switch(log.action) {
                        case 0: //Action.CREATE:
                            if(i < modoruLogsLength) {
                                log.data = {
                                    card: await Card.findOne({createdBy: userId, id: log.targetId}),
                                    reviewLogs: await ReviewLog.find({createdBy: userId, cardId: log.targetId})
                                }
                            } else {
                                log.data = await Card.findOne({createdBy: userId, id: log.targetId});
                            }
                            break;
                        case 1: //Action.UPDATE:
                            log.data = await Card.findOne({createdBy: userId, id: log.targetId});
                            break;
                        case 2: //Action.DELETE:
                            break;
                    }
                    break;
                case 2: //Table.REVIEW_LOG:
                    switch(log.action) {
                        case 0: //Action.CREATE:
                            log.data = await ReviewLog.findOne({createdBy: userId, id: log.targetId});
                            break;
                        case 1: //Action.UPDATE:
                            break;
                        case 2: //Action.DELETE:
                            break;
                    }
                    break;
              }
        }

        return logs;
    }catch(err){
        throw err;
    }
}

export const ankiService = {
    getDecks,
    getCards, 
    getReviewLogs,
    updateAnki,
    getAnkiInfo,
    getActionLogs,
    mergeFromClient,
    fillLogs
} 