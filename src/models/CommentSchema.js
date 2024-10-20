import mongoose from "mongoose";


const CommentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref:"user" ,required: true },   
    content: { type: String, required: true },        
    liked_by: [{ type: mongoose.Schema.Types.ObjectId}],           
    created_at: { type: Date, default: Date.now },
});


export default CommentSchema;