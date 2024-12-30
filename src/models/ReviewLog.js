import mongoose from "mongoose";

const ReviewLogSchema = new mongoose.Schema({
    id: { type: Number, require: true },
    difficulty: { 
        type: Number, 
        required: true 
    },
    due: { 
        type: String, 
        required: true 
    },
    elapsed_days: { 
        type: Number, 
        required: true 
    },
    last_elapsed_days: { 
        type: Number, 
        required: true 
    },
    rating: { 
        type: Number, 
        required: true 
    },
    review: { 
        type: String, 
        required: true 
    },
    scheduled_days: { 
        type: Number, 
        required: true 
    },
    stability: { 
        type: Number, 
        required: true 
    },
    state: { 
        type: Number, 
        required: true 
    },
    deckId: {
        type: Number, 
        required: true 
    },
    cardId: {
        type: Number, 
        required: true 
    },
    createdDate: { 
        type: String, 
        required: true 
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

ReviewLogSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.createdBy;
        return ret; 
    }
});

const ReviewLog = mongoose.model("ReviewLog", ReviewLogSchema);

export default ReviewLog;
