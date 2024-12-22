import mongoose from "mongoose";

const DeckSchema = new mongoose.Schema({
    id: { type: Number, require: true },
    name: { type: String, require: true }, 
    newCardQuantity: { type: Number, require: true },
    createdDate: { 
        type: String, 
        require: true, 
        default: () => new Date().toISOString() 
    },
    updatedDate: {
        type: String, 
        require: true, 
        default: () => new Date().toISOString() 
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    }
});

// Middleware để cập nhật updatedDate trước khi lưu
// DeckSchema.pre('save', function (next) {
//     this.updatedDate = new Date().toISOString();
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
