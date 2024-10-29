import { StatusCodes } from "http-status-codes";
import { CommentService } from "../services/commentService.js";

const createComment = async (req, res, next) => {
    try {
        const result = await CommentService.createComment(req);
        return res.status(StatusCodes.CREATED).json({
            status: "success",
            data: result
        })
    }catch(error){
        next(error);
    }
};

const likeComment = async(req, res, next)=>{
    try{
        const result = await CommentService.likeComment(req);
        return res.status(StatusCodes.OK).json({
            status: "success",
            data: result
        });
    }catch(error){
        next(error);
    }
};

const updateComment = async (req, res, next)=>{
    try{
        const result = await CommentService.updateComment(req);
        return res.status(StatusCodes.OK).json({
            status: "success",
            data: result
        });
    }catch(error){
        next(error);
    }
};

const deleteComment = async (req, res, next)=>{
    try{
        const result = await CommentService.deleteComment(req);
        return res.status(StatusCodes.OK).json({
            status: "success",
            data: result
        });
    }catch(error){
        next(error);
    }
};

export const CommentController = {
    createComment,
    likeComment,
    updateComment,
    deleteComment
}