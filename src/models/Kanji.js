import mongoose from "mongoose";
import composition from "./Composition.js"

const KanjiSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    text: { type: String, required: true },
    phonetic: [{ type: String }],
    onyomi: [{ type: String }],
    kunyomi: [{ type: String }],
    strokes: { type: Number },
    jlpt_level: { type: Number },
    composition: [{ type: mongoose.Schema.Types.ObjectId, ref: 'compositions' }],
    meaning: { type: String },
    romanji: [{ type: String }]
}, {
    collection: 'kanji'
});

const Kanji = mongoose.model("kanji", KanjiSchema);


export default Kanji;