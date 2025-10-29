import express from 'express';
import { createBlog, getAllBlogsAdmin, getPublishedBlogs, getBlogBySlug, updateBlog, deleteBlog, getFeaturedBlogs } from '../controllers/blogController.js';
import adminAuth from '../middleware/adminAuth.js';
import upload from '../middleware/multer.js';

const blogRouter = express.Router();

// Public routes
blogRouter.get('/list', getPublishedBlogs);
blogRouter.get('/featured', getFeaturedBlogs);
blogRouter.get('/:slug', getBlogBySlug);

// Admin routes
blogRouter.post('/add', upload.fields([{ name: 'image', maxCount: 1 }]), adminAuth, createBlog);
blogRouter.get('/admin/list', adminAuth, getAllBlogsAdmin);
blogRouter.post('/update', upload.fields([{ name: 'image', maxCount: 1 }]), adminAuth, updateBlog);
blogRouter.post('/remove', adminAuth, deleteBlog);

export default blogRouter;