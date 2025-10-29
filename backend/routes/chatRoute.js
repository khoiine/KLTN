import express from 'express';
import { getUserChat, sendMessage, getAllChats, getChatById, adminSendMessage, closeChat, getUnreadCount, markAsRead, getAdminUnreadCount, adminMarkAsRead } from '../controllers/chatController.js';
import authUser from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const chatRouter = express.Router();

// User routes
chatRouter.post('/get-user-chat', authUser, getUserChat);
chatRouter.post('/send-message', authUser, sendMessage);
chatRouter.post('/unread-count', authUser, getUnreadCount);
chatRouter.post('/mark-read', authUser, markAsRead);

// Admin routes
chatRouter.get('/all', adminAuth, getAllChats);
chatRouter.post('/get-by-id', adminAuth, getChatById);
chatRouter.post('/admin-send', adminAuth, adminSendMessage);
chatRouter.post('/close', adminAuth, closeChat);
chatRouter.get('/admin-unread-count', adminAuth, getAdminUnreadCount);
chatRouter.post('/admin-mark-read', adminAuth, adminMarkAsRead);

export default chatRouter;