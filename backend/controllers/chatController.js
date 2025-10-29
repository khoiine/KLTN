import chatModel from '../models/chatModel.js';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';

// Tạo chat người dùng
const getUserChat = async (req, res) => {
    try {
        const { userId } = req.body;

        let chat = await chatModel.findOne({ userId, status: 'active' });

        if (!chat) {
            const user = await userModel.findById(userId);
            if (!user) {
                return res.json({ success: false, message: 'Người dùng không tồn tại' });
            }

            chat = await chatModel.create({
                userId: user._id,
                userName: user.name,
                userEmail: user.email,
                messages: []
            });
        }

        res.json({ success: true, chat });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Send message
const sendMessage = async (req, res) => {
    try {
        const { userId, message, senderRole } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'Người dùng không tồn tại' });
        }

        let chat = await chatModel.findOne({ userId, status: 'active' });

        if (!chat) {
            chat = await chatModel.create({
                userId: user._id,
                userName: user.name,
                userEmail: user.email,
                messages: []
            });
        }

        const newMessage = {
            sender: userId,
            senderName: user.name,
            senderRole: senderRole || 'user',
            message,
            timestamp: new Date(),
            read: false
        };

        chat.messages.push(newMessage);
        chat.lastMessage = new Date();
        await chat.save();

        // Emit socket event
        const io = req.app.get('io');
        io?.to(`chat_${chat._id}`).emit('message:new', { chatId: chat._id, message: newMessage });

        res.json({ success: true, message: 'Tin nhắn đã được gửi', chat });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
    try {
        const { userId } = req.body;

        const chat = await chatModel.findOne({ userId, status: 'active' });

        if (!chat) {
            return res.json({ success: true, unreadCount: 0 });
        }

        // Count unread messages from admin
        const unreadCount = chat.messages.filter(
            msg => msg.senderRole === 'admin' && !msg.read
        ).length;

        res.json({ success: true, unreadCount });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Mark messages as read
const markAsRead = async (req, res) => {
    try {
        const { userId } = req.body;

        const chat = await chatModel.findOne({ userId, status: 'active' });

        if (!chat) {
            return res.json({ success: true, message: 'Không có tin nhắn' });
        }

        // Mark all admin messages as read
        chat.messages.forEach(msg => {
            if (msg.senderRole === 'admin' && !msg.read) {
                msg.read = true;
            }
        });

        await chat.save();

        // Emit socket event to update unread count
        const io = req.app.get('io');
        io?.to(`chat_${chat._id}`).emit('messages:read', { chatId: chat._id });

        res.json({ success: true, message: 'Đã đánh dấu đã đọc' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get all chats (Admin only)
const getAllChats = async (req, res) => {
    try {
        const chats = await chatModel.find().sort({ lastMessage: -1 });
        res.json({ success: true, chats });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get specific chat (Admin)
const getChatById = async (req, res) => {
    try {
        const { chatId } = req.body;
        const chat = await chatModel.findById(chatId);

        if (!chat) {
            return res.json({ success: false, message: 'Cuộc trò chuyện không tồn tại' });
        }

        res.json({ success: true, chat });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Lấy tổng số tin nhắn chưa đọc cho admin
const getAdminUnreadCount = async (req, res) => {
    try {
        const chats = await chatModel.find({ status: 'active' });
        
        let totalUnread = 0;
        chats.forEach(chat => {
            const unreadFromUser = chat.messages.filter(
                msg => msg.senderRole === 'user' && !msg.read
            ).length;
            totalUnread += unreadFromUser;
        });

        res.json({ success: true, unreadCount: totalUnread });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Admin đánh dấu tất cả tin nhắn từ user là đã đọc
const adminMarkAsRead = async (req, res) => {
    try {
        const { chatId } = req.body;

        const chat = await chatModel.findById(chatId);

        if (!chat) {
            return res.json({ success: false, message: 'Cuộc trò chuyện không tồn tại' });
        }

        // Đánh dấu tất cả tin nhắn từ user là đã đọc
        chat.messages.forEach(msg => {
            if (msg.senderRole === 'user' && !msg.read) {
                msg.read = true;
            }
        });

        await chat.save();

        res.json({ success: true, message: 'Đã đánh dấu đã đọc' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// Admin gửi tin nhắn cho user - SIMPLIFIED
const adminSendMessage = async (req, res) => {
    try {
        const { chatId, message } = req.body;
        let adminId = req.userId;

        if (!adminId && req.headers.token) {
            try {
                const decoded = jwt.verify(req.headers.token, process.env.JWT_SECRET);
                if (decoded && decoded.id) adminId = decoded.id;
            } catch {
                // ignore
            }
        }

        if (!adminId) {
            return res.json({ success: false, message: 'Không tìm thấy thông tin admin từ token' });
        }

        const chat = await chatModel.findById(chatId);
        if (!chat) return res.json({ success: false, message: 'Cuộc trò chuyện không tồn tại' });

        const admin = await userModel.findById(adminId);
        if (!admin) {
            return res.json({ success: false, message: 'Admin không tồn tại trong database' });
        }

        const newMessage = {
            sender: adminId,
            senderName: admin.name || 'Admin',
            senderRole: 'admin',
            message,
            timestamp: new Date(),
            read: false
        };

        chat.messages.push(newMessage);
        chat.lastMessage = new Date();
        await chat.save();

        // Emit socket event
        const io = req.app.get('io');
        io?.to(`chat_${chat._id}`).emit('message:new', { chatId: chat._id, message: newMessage });

        res.json({ success: true, message: 'Tin nhắn đã được gửi', chat });
    } catch (error) {
        console.log('Error in adminSendMessage:', error);
        res.json({ success: false, message: error.message });
    }
};

// Tắt chat
const closeChat = async (req, res) => {
    try {
        const { chatId } = req.body;
        const chat = await chatModel.findByIdAndUpdate(
            chatId,
            { status: 'closed' },
            { new: true }
        );

        if (!chat) {
            return res.json({ success: false, message: 'Cuộc trò chuyện không tồn tại' });
        }

        res.json({ success: true, message: 'Đã đóng cuộc trò chuyện', chat });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { getUserChat, sendMessage, getAllChats, getChatById, adminSendMessage, closeChat, getUnreadCount, markAsRead, getAdminUnreadCount, adminMarkAsRead };