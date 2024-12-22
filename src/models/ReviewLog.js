import mongoose from "mongoose";

const ReviewLogSchema = new mongoose.Schema({
    id: { type: Number, require: true },
    cardId: { 
        type: String, 
        required: true 
    },
    difficulty: { 
        type: Number, 
        required: true 
    },
    due: { 
        type: Date, 
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
        type: Date, 
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
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    createdDate: { 
        type: Date, 
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
