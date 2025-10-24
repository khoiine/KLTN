import SubCategory from '../models/subCategoryModel.js';

// Get all subcategories (REMOVED auto-seed)
const getSubCategories = async (req, res) => {
    try {
        const subCategories = await SubCategory.find({}).sort({ createdAt: -1 });
        res.json({ success: true, subCategories });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Create a new subcategory
const createSubCategory = async (req, res) => {
    const { name } = req.body;

    try {
        const existingSubCategory = await SubCategory.findOne({ name });
        if (existingSubCategory) {
            return res.json({ success: false, message: 'Loại sản phẩm đã tồn tại' });
        }

        await SubCategory.create({ name });

        // Return updated list
        const subCategories = await SubCategory.find({}).sort({ createdAt: -1 });
        res.json({ success: true, message: 'Tạo loại sản phẩm thành công', subCategories });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update a subcategory
const updateSubCategory = async (req, res) => {
    const { id, name } = req.body;

    try {
        const existingSubCategory = await SubCategory.findOne({ name, _id: { $ne: id } });
        if (existingSubCategory) {
            return res.json({ success: false, message: 'Tên loại sản phẩm đã tồn tại' });
        }

        await SubCategory.findByIdAndUpdate(id, { name }, { new: true });

        // Return updated list
        const subCategories = await SubCategory.find({}).sort({ createdAt: -1 });
        res.json({ success: true, message: 'Cập nhật loại sản phẩm thành công', subCategories });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete a subcategory
const deleteSubCategory = async (req, res) => {
    const { id } = req.body;

    try {
        await SubCategory.findByIdAndDelete(id);

        // Return updated list
        const subCategories = await SubCategory.find({}).sort({ createdAt: -1 });
        res.json({ success: true, message: 'Xóa loại sản phẩm thành công', subCategories });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export { createSubCategory, getSubCategories, updateSubCategory, deleteSubCategory };