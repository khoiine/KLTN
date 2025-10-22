import express from 'express';
import { addToCart, updateCart, getUserCart, clearCart } from '../controllers/cartController.js';
import authUser from '../middleware/auth.js';

const cartRouter = express.Router();

cartRouter.post('/add', authUser, addToCart); //add product to user cart
cartRouter.post('/update', authUser, updateCart); //update user cart
cartRouter.post('/get', authUser, getUserCart); //get user cart data
cartRouter.post('/clear', authUser, clearCart); //clear user cart

export default cartRouter;