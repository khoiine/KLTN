import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";
import reviewModel from "../models/reviewModel.js";

// Lấy thống kê tổng quan cho dashboard
const getDashboardStats = async (req, res) => {
    try {
        // Tổng số sản phẩm
        const totalProducts = await productModel.countDocuments();
        
        // Tổng số đơn hàng
        const totalOrders = await orderModel.countDocuments();
        
        // Tổng số người dùng
        const totalUsers = await userModel.countDocuments();
        
        // Thống kê đánh giá theo sao
        const ratingStats = await reviewModel.aggregate([
            {
                $group: {
                    _id: "$rating",
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // Chuyển đổi thống kê đánh giá thành object
        const ratingStatsObj = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        ratingStats.forEach(stat => {
            ratingStatsObj[stat._id] = stat.count;
        });
        
        // Thống kê sản phẩm theo danh mục
        const categoryStats = await productModel.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    category: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ]);
        
        // Đơn hàng gần đây (10 đơn gần nhất)
        const recentOrders = await orderModel.find()
            .sort({ date: -1 })
            .limit(10);
        
        // Thống kê đơn hàng theo tháng (6 tháng gần nhất)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const monthlyOrderStats = await orderModel.aggregate([
            {
                $match: {
                    date: { $gte: sixMonthsAgo.getTime() }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: { $toDate: "$date" } },
                        month: { $month: { $toDate: "$date" } }
                    },
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$amount" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);
        
        const dashboardData = {
            totalProducts,
            totalOrders,
            totalUsers,
            ratingStats: ratingStatsObj,
            categoryStats,
            recentOrders,
            monthlyOrderStats
        };
        
        res.json({
            success: true,
            data: dashboardData
        });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { getDashboardStats };
