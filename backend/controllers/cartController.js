import userModel from "../models/userModel.js";

//add product to user cart
const addToCart = async (req, res) => {
    try {
        const { userId, itemId, size, isAdmin } = req.body;

        // Admin không có giỏ hàng
        if (isAdmin) {
            return res.json({ success: false, message: 'Admin không thể thêm sản phẩm vào giỏ hàng' });
        }

        if (!userId) {
            return res.json({ success: false, message: 'User ID không hợp lệ' });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        let cartData = userData.cartData || {};

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            }
            else{
                cartData[itemId][size] = 1;
            }
        }else{
            cartData[itemId] = {};
            cartData[itemId][size] =  1;
        }

        await userModel.findByIdAndUpdate(userId, { cartData });
        res.json({ success: true, message: 'Đã thêm vào giỏ hàng' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
        
    }
};

//update user cart
const updateCart = async (req, res) => {
    try {
        const { userId, itemId, size, quantity, isAdmin } = req.body;

        // Admin không có giỏ hàng
        if (isAdmin) {
            return res.json({ success: false, message: 'Admin không thể cập nhật giỏ hàng' });
        }

        if (!userId) {
            return res.json({ success: false, message: 'User ID không hợp lệ' });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        let cartData = userData.cartData || {};
        
        if (!cartData[itemId]) {
            cartData[itemId] = {};
        }
        cartData[itemId][size] = quantity;

        await userModel.findByIdAndUpdate(userId, { cartData });
        res.json({ success: true, message: 'Cập nhật giỏ hàng thành công' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

//get user cart data
const getUserCart = async (req, res) => {
    
    try {
        const { userId, isAdmin } = req.body;

        // Nếu là admin, trả về giỏ hàng trống
        if (isAdmin) {
            return res.json({ success: true, cartData: {} });
        }

        // Nếu không có userId, trả về lỗi
        if (!userId) {
            return res.json({ success: false, message: "User ID không hợp lệ" });
        }

        const userData = await userModel.findById(userId);
        
        // Nếu không tìm thấy user
        if (!userData) {
            return res.json({ success: false, message: "Không tìm thấy người dùng" });
        }

        let cartData = userData.cartData || {};

        res.json({ success: true, cartData });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

//clear user cart
const clearCart = async (req, res) => {
    try {
        const { userId, isAdmin } = req.body;

        // Admin không có giỏ hàng để xóa
        if (isAdmin) {
            return res.json({ success: true, message: 'Admin không có giỏ hàng để xóa' });
        }

        if (!userId) {
            return res.json({ success: false, message: 'User ID không hợp lệ' });
        }

        await userModel.findByIdAndUpdate(userId, { cartData: {} });
        res.json({ success: true, message: 'Giỏ hàng đã được xóa' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { addToCart, updateCart, getUserCart, clearCart };