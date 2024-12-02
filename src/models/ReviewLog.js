import mongoose from "mongoose";

const ReviewLogSchema = new mongoose.Schema({
    cardId: {
        type: String,
        require: true
    },
    difficulty: {type: Number},
    due: {type: Date},
    elapsed_days: {type: Number},
    last_elapsed_days: {type: Number},
    rating: {type: Number},
    review: {type: Date},
    scheduled_days: {type: Number},
    stability: {type: Number},
    state: {type: Number},
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
});

ReviewLogSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.createdBy;
        return ret;
    }
});

const ReviewLog = mongoose.model("review-log", ReviewLogSchema);

export default ReviewLog;