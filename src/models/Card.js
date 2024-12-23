import mongoose from "mongoose";

const CardSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    word: { type: String, required: true },
    sentence: { type: String, required: true },
    reading: { type: String, required: true },
    meaning: { type: String, required: true },
    difficulty: { type: Number, required: true },
    due: { type: Date, required: true },
    elapsed_days: { type: Number, required: true },
    lapses: { type: Number, required: true },
    last_review: { type: Date },
    reps: { type: Number, required: true },
    scheduled_days: { type: Number, required: true },
    stability: { type: Number, required: true },
    state: { type: Number, required: true },
    deckId: { type: String, required: true },
    createdDate: { type: Date, required: true },
    updatedDate: { type: Date, required: true },
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
