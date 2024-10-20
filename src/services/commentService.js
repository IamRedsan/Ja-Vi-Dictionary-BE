import { StatusCodes } from "http-status-codes";
import BadRequestError from "../errors/BadRequestError.js";
import Kanji from "../models/Kanji.js";
import Word from "../models/Word.js";
import NotFoundError from "../errors/NotFoundError.js";
import User from "../models/User.js";

const createComment = async (req) => {
    try {
        const {kanjiId, wordId} = req.query;
        const { content } = req.body;
        const userId = req.userId;

        if((kanjiId && wordId) || (!kanjiId && !wordId)){
            throw new BadRequestError("Chỉ được truyền 1 kanjiId hoặc 1 wordId");
        }
        if(!content){
            throw new BadRequestError("Nội dung không hợp lệ!");
        }

        let textObject = {};
        if(kanjiId){
            textObject = await Kanji.findById(kanjiId);
        }
        if(wordId){
            textObject = await Word.findById(wordId);
        }
        if(!textObject){
            throw new NotFoundError("Không tìm thấy thông tin Kanji hoặc Word!");
        }

        const user = await User.findById(userId);
        if(!user){
            throw new NotFoundError("Không tìm thấy thông tin người dùng!");
        }
        
        const newComment = {
            user: user._id,
            content,
            liked_by: [],
            crecreated_at: new Date()
        }

        if(!textObject.comments){
            textObject.comments = [newComment];
        }else {
            textObject.comments.push(newComment);
        }
        await textObject.save();

        return textObject.comments;
    }catch(error){
        throw error;
    }
};

const likeComment = async(req)=>{
    try{
        const {kanjiId, wordId, commentId} = req.query;
        const userId = req.userId;

        if((kanjiId && wordId) || (!kanjiId && !wordId)){
            throw new BadRequestError("Chỉ được truyền 1 kanjiId hoặc 1 wordId");
        }

        if(!commentId){
            throw new BadRequestError("Thiếu có commentID!");
        }

        let textObject = {};
        if(kanjiId){
            textObject = await Kanji.findById(kanjiId);
        }
        if(wordId){
            textObject = await Word.findById(wordId);
        }
        if(!textObject){
            throw new NotFoundError("Không tìm thấy thông tin Kanji hoặc Word!");
        }

        const comment = textObject.comments.id(commentId);
        if(!comment){
            throw new NotFoundError("Không tìm thấy bình luận!");
        }

        const userIndex = comment.liked_by.indexOf(userId);
        if (userIndex !== -1) {
            comment.liked_by.splice(userIndex, 1); 
        } else {
            comment.liked_by.push(userId);
        }

        await textObject.save();
        return textObject.comments;
    }catch(error){
        throw error;
    }
};


export const CommentService = {
    createComment,
    likeComment
}