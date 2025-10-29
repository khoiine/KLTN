import blogModel from '../models/blogModel.js';
import userModel from '../models/userModel.js';
import { v2 as cloudinary } from 'cloudinary';

// Create blog post (Admin)
const createBlog = async (req, res) => {
    try {
        const { title, excerpt, content, category, tags, status, featured } = req.body;
        const adminId = req.userId;

        const admin = await userModel.findById(adminId);
        if (!admin) {
            return res.json({ success: false, message: 'Admin không tồn tại' });
        }

        // Upload image to cloudinary
        const image = req.files.image && req.files.image[0];
        if (!image) {
            return res.json({ success: false, message: 'Vui lòng tải lên hình ảnh' });
        }

        const imageUpload = await cloudinary.uploader.upload(image.path, {
            resource_type: 'image',
            folder: 'blogs'
        });

        // Create slug from title
        const slug = title.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();

        const blogData = {
            title,
            slug: `${slug}-${Date.now()}`,
            excerpt,
            content,
            image: imageUpload.secure_url,
            author: adminId,
            authorName: admin.name,
            category,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            status: status || 'draft',
            featured: featured === 'true'
        };

        const blog = await blogModel.create(blogData);

        res.json({ success: true, message: 'Blog đã được tạo', blog });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get all blogs (Admin)
const getAllBlogsAdmin = async (req, res) => {
    try {
        const blogs = await blogModel.find().sort({ createdAt: -1 });
        res.json({ success: true, blogs });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get published blogs (Public)
const getPublishedBlogs = async (req, res) => {
    try {
        const blogs = await blogModel.find({ status: 'published' }).sort({ createdAt: -1 });
        res.json({ success: true, blogs });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get single blog by slug
const getBlogBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const blog = await blogModel.findOne({ slug });

        if (!blog) {
            return res.json({ success: false, message: 'Blog không tồn tại' });
        }

        // Increment views
        blog.views += 1;
        await blog.save();

        res.json({ success: true, blog });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update blog (Admin)
const updateBlog = async (req, res) => {
    try {
        const { id, title, excerpt, content, category, tags, status, featured } = req.body;

        const blog = await blogModel.findById(id);
        if (!blog) {
            return res.json({ success: false, message: 'Blog không tồn tại' });
        }

        // Update fields
        if (title) {
            blog.title = title;
            const slug = title.toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            blog.slug = `${slug}-${Date.now()}`;
        }
        if (excerpt) blog.excerpt = excerpt;
        if (content) blog.content = content;
        if (category) blog.category = category;
        if (tags) blog.tags = tags.split(',').map(tag => tag.trim());
        if (status) blog.status = status;
        if (featured !== undefined) blog.featured = featured === 'true';

        // Update image if provided
        if (req.files && req.files.image && req.files.image[0]) {
            const image = req.files.image[0];
            const imageUpload = await cloudinary.uploader.upload(image.path, {
                resource_type: 'image',
                folder: 'blogs'
            });
            blog.image = imageUpload.secure_url;
        }

        await blog.save();

        res.json({ success: true, message: 'Blog đã được cập nhật', blog });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete blog (Admin)
const deleteBlog = async (req, res) => {
    try {
        const { id } = req.body;
        await blogModel.findByIdAndDelete(id);
        res.json({ success: true, message: 'Blog đã được xóa' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get featured blogs
const getFeaturedBlogs = async (req, res) => {
    try {
        const blogs = await blogModel.find({ status: 'published', featured: true })
            .sort({ createdAt: -1 })
            .limit(3);
        res.json({ success: true, blogs });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { 
    createBlog, 
    getAllBlogsAdmin, 
    getPublishedBlogs, 
    getBlogBySlug, 
    updateBlog, 
    deleteBlog,
    getFeaturedBlogs
};