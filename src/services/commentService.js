import BadRequestError from "../errors/BadRequestError.js";
import Kanji from "../models/Kanji.js";
import Word from "../models/Word.js";
import NotFoundError from "../errors/NotFoundError.js";
import ForbiddenError from "../errors/ForbiddenError.js"
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

        console.log(newComment);

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

const updateComment = async (req) => {
    try{
        const {wordId, kanjiId, commentId} = req.query;
        const userId = req.userId;
        const {content} = req.body;

        if(wordId && kanjiId && commentId){
            throw new BadRequestError("Không thể truyển cả 3 tham số vào query!");
        }

        if(!commentId){
            throw new BadRequestError("Thiếu tham số commentId!");
        }

        if(!userId){
            throw new ForbiddenError("Không tìm thấy người dùng!");
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

        if (comment.user.toString() !== userId) {
            throw new ForbiddenError("Người dùng không có quyền chỉnh sửa bình luận này!");
        }

        comment.content = content;
        await textObject.save();
        return comment;
    }catch(error){
        throw error;
    }
};

const deleteComment = async (req) => {
    try{
        const userId = req.userId;
        const {wordId, kanjiId, commentId} = req.query;

        if(wordId && kanjiId && commentId){
            throw new BadRequestError("Không thể truyển cả 3 tham số vào query!");
        }

        if(!commentId){
            throw new BadRequestError("Thiếu tham số commentId!");
        }

        const user = User.findById(userId);
        if(!user){
            throw new NotFoundError("Không tìm thấy người dùng!");
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

        const commentIndex = textObject.comments.findIndex(c => c._id.toString() === commentId);
        if (commentIndex === -1) {
            throw new NotFoundError("Không tìm thấy bình luận!");
        }

        // Kiểm tra quyền sở hữu của người dùng
        if (textObject.comments[commentIndex].user.toString() !== userId) {
            throw new ForbiddenError("Người dùng không có quyền xóa bình luận này!");
        }

        // Xóa comment khỏi mảng comments
        textObject.comments.splice(commentIndex, 1);
        await textObject.save();

        return { message: "Xóa bình luận thành công!" };
    }catch(error){
        throw error;
    }
};

export const CommentService = {
    createComment,
    likeComment,
    updateComment,
    deleteComment
}