import mongoose from "mongoose";

const ActionLogSchema = new mongoose.Schema({
    id: { 
        type: String, 
        required: true 
    },
    action: { 
        type: Number, 
        required: true 
    },
    targetTable: { 
        type: Number, 
        required: true 
    },
    targetId: { 
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

ActionLogSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.createdBy;
        return ret; 
    }
});

const ActionLog = mongoose.model("ActionLog", ActionLogSchema);

export default ActionLog;
