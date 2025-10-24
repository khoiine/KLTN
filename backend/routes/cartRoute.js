import express from 'express';
import { addToCart, updateCart, getUserCart, clearUserCart } from '../controllers/cartController.js';
import authUser from '../middleware/auth.js';

const cartRouter = express.Router();

cartRouter.post('/get', authUser, getUserCart); //get user cart data
cartRouter.post('/add', authUser, addToCart); //add product to user cart
cartRouter.post('/update', authUser, updateCart); //update user cart
cartRouter.post('/clear', authUser, clearUserCart); //clear user cart

export default cartRouter;