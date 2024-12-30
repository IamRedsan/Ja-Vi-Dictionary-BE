import mongoose from "mongoose";

const CardSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    word: { type: String, default: '' },
    sentence: { type: String, default: '' },
    reading: { type: String, default: '' },
    meaning: { type: String, default: '' },
    difficulty: { type: Number, required: true },
    due: { type: String, required: true },
    elapsed_days: { type: Number, required: true },
    lapses: { type: Number, required: true },
    last_review: { type: String },
    reps: { type: Number, required: true },
    scheduled_days: { type: Number, required: true },
    stability: { type: Number, required: true },
    state: { type: Number, required: true },
    deckId: { type: Number, required: true },
    createdDate: { type: String, required: true },
    updatedDate: { type: String, required: true },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
});

CardSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.createdBy;
        return ret; 
    }
});

const Card = mongoose.model("Card", CardSchema);

export default Card;
