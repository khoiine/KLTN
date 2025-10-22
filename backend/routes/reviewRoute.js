import express from 'express';
import { addReview, getProductReviews, deleteReview, getAllReviews, getReviewsByProduct, deleteReviewAsAdmin } from '../controllers/reviewController.js';
import authUser from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const reviewRouter = express.Router();

reviewRouter.post('/add', authUser, addReview);
reviewRouter.get('/product/:productId', getReviewsByProduct);
reviewRouter.delete('/delete/:reviewId', authUser, deleteReview);
reviewRouter.delete('/admin/delete/:reviewId', adminAuth, deleteReviewAsAdmin);
reviewRouter.get('/all', adminAuth, getAllReviews);

export default reviewRouter;