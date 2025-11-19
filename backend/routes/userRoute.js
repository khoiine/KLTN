import express from 'express';
import { loginUser, registerUser, adminLogin, getUserInfo, updateProfile, getAllUsers, forgotPassword, resetPassword , changePassword , googleLogin , listUsers , getUser , updateUser , deleteUser } from '../controllers/userController.js';
import authUser from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const userRouter = express.Router();

userRouter.post('/login', loginUser);
userRouter.post('/register', registerUser);
userRouter.post('/admin', adminLogin);
userRouter.get('/info', authUser, getUserInfo);
userRouter.post('/update-profile', authUser, updateProfile);
userRouter.get('/list', adminAuth, getAllUsers);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password/:token', resetPassword);
userRouter.post('/change-password', authUser, changePassword);
userRouter.post('/google-login', googleLogin);
userRouter.get('/list', listUsers)
userRouter.get('/:id', getUser)
userRouter.post('/update', updateUser)
userRouter.post('/delete', deleteUser)



export default userRouter;