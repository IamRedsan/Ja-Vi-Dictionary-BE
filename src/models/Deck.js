import mongoose from "mongoose";

const DeckSchema = new mongoose.Schema({
    _id: { type: String, require: true },
    name: { type: String, require: true },
    createdDate: {
        type: Date,
        default: Date.now
    },
    updatedDate: {
        type: Date,
        default: Date.now
    },
    newCardQuantity: {
        type: Number
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
})

// DeckSchema.pre('save', function (next) {
//     this.updated_at = Date.now();
//     next();
// });

DeckSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.createdBy;
        return ret;
    }
});

const Deck = mongoose.model("deck", DeckSchema);

export default Deck;