import mongoose from "mongoose";

const CardSchema = new mongoose.Schema({
    _id: {type: String, require: true},
    createdDate: {type: Date},
    updatedDate: {type: Date},
    deckId: {
        type: String,
        require: true

    },
    word: {type: String},
    sentence: {type: String},
    reading: {type: String},
    meaning: {type: String},
    difficulty: {type: Number},
    due: {type: Date},
    elapsed_days: {type: Number},
    lapses: {type: Number},
    last_review: {type: Date},
    reps: {type: Number},
    scheduled_days: {type: Number},
    stability: {type: Number},
    state: {type: Number},
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
});

CardSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.createdBy;
        return ret;
    }
});

const Card = mongoose.model("card", CardSchema);

export default Card;