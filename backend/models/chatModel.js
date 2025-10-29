import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, enum: ['user', 'admin'], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
});

const chatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    messages: [messageSchema],
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
    lastMessage: { type: Date, default: Date.now },
    unreadCount: { type: Number, default: 0 }
}, { timestamps: true });

const chatModel = mongoose.models.chat || mongoose.model("chat", chatSchema);

export default chatModel;