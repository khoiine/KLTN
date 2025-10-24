import express from 'express';
import { createCategory, getCategories, updateCategory, deleteCategory, seedDefaultCategories } from '../controllers/categoryController.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

router.post('/seed', adminAuth, seedDefaultCategories); 
router.post('/create', adminAuth, createCategory);
router.get('/list', getCategories); 
router.post('/update', adminAuth, updateCategory);
router.post('/delete', adminAuth, deleteCategory);

export default router;