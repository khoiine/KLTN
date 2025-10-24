import express from 'express';
import { createSubCategory, getSubCategories, updateSubCategory, deleteSubCategory } from '../controllers/subCategoryController.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

router.post('/create', adminAuth, createSubCategory);
router.get('/list', getSubCategories);  
router.post('/update', adminAuth, updateSubCategory);
router.post('/delete', adminAuth, deleteSubCategory);

export default router;