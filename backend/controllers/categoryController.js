import Category from '../models/categoryModel.js';

// Seed default categories (run once to initialize)
const seedDefaultCategories = async (req, res) => {
    try {
        const defaultCategories = ['Men', 'Women', 'Kids'];

        for (const categoryName of defaultCategories) {
            const exists = await Category.findOne({ name: categoryName });
            if (!exists) {
                await Category.create({ name: categoryName });
            }
        }

        res.json({ success: true, message: 'Default categories seeded successfully' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Create a new category
const createCategory = async (req, res) => {
    const { name } = req.body;

    try {
        // Check if category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.json({ success: false, message: 'Danh mục đã tồn tại' });
        }

        const category = new Category({ name });
        await category.save();
        res.json({ success: true, message: 'Tạo danh mục thành công', category });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get all categories
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({}).sort({ createdAt: -1 });
        res.json({ success: true, categories });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update a category
const updateCategory = async (req, res) => {
    const { id, name } = req.body;

    try {
        // Check if another category with the same name exists
        const existingCategory = await Category.findOne({ name, _id: { $ne: id } });
        if (existingCategory) {
            return res.json({ success: false, message: 'Tên danh mục đã tồn tại' });
        }

        const category = await Category.findByIdAndUpdate(id, { name }, { new: true });
        if (!category) {
            return res.json({ success: false, message: 'Không tìm thấy danh mục' });
        }
        res.json({ success: true, message: 'Cập nhật danh mục thành công', category });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete a category
const deleteCategory = async (req, res) => {
    const { id } = req.body;

    try {
        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return res.json({ success: false, message: 'Không tìm thấy danh mục' });
        }
        res.json({ success: true, message: 'Xóa danh mục thành công' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export { createCategory, getCategories, updateCategory, deleteCategory, seedDefaultCategories };