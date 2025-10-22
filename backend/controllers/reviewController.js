import reviewModel from '../models/reviewModel.js';
import userModel from '../models/userModel.js';

// Add review
const addReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const { userId } = req.body;

        // Check if user already reviewed this product
        const existingReview = await reviewModel.findOne({ 
            productId, 
            userId 
        });

        if (existingReview) {
            return res.json({ 
                success: false, 
                message: "Bạn đã đánh giá sản phẩm này rồi" 
            });
        }

        // Get user info
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ 
                success: false, 
                message: "User not found" 
            });
        }

        // Create new review
        const newReview = new reviewModel({
            productId,
            userId,
            userName: user.name,
            userEmail: user.email,
            rating,
            comment
        });

        await newReview.save();

        res.json({ 
            success: true, 
            message: "Đánh giá đã được thêm" 
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get reviews for a product
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        const reviews = await reviewModel.find({ productId }).sort({ createdAt: -1 });

        res.json({ 
            success: true, 
            reviews 
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete review
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { userId, isAdmin, adminEmail } = req.body;

        // Find the review
        const review = await reviewModel.findById(reviewId);
        if (!review) {
            return res.json({ 
                success: false, 
                message: "Review not found" 
            });
        }

        // Check if user is admin (from token)
        if (isAdmin) {
            await reviewModel.findByIdAndDelete(reviewId);
            return res.json({ 
                success: true, 
                message: "Đánh giá đã được admin xóa" 
            });
        }

        // Check if user owns the review (for regular users)
        if (!userId || review.userId.toString() !== userId) {
            return res.json({ 
                success: false, 
                message: "Không có quyền xóa đánh giá này" 
            });
        }

        await reviewModel.findByIdAndDelete(reviewId);

        res.json({ 
            success: true, 
            message: "Đánh giá đã được xóa" 
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete review as admin (no ownership check)
const deleteReviewAsAdmin = async (req, res) => {
    try {
        const { reviewId } = req.params;

        // Find the review
        const review = await reviewModel.findById(reviewId);
        if (!review) {
            return res.json({ 
                success: false, 
                message: "Review not found" 
            });
        }

        await reviewModel.findByIdAndDelete(reviewId);

        res.json({ 
            success: true, 
            message: "Đánh giá đã được xóa" 
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get all reviews (admin only)
const getAllReviews = async (req, res) => {
    try {
        const reviews = await reviewModel.find().sort({ createdAt: -1 });
        
        res.json({ 
            success: true, 
            reviews 
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get reviews by product ID
const getReviewsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const reviews = await reviewModel.find({ productId })
            .sort({ createdAt: -1 }); // Sort by newest first

        res.json({
            success: true,
            reviews
        });

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

export { addReview, getProductReviews, deleteReview, getAllReviews, getReviewsByProduct, deleteReviewAsAdmin };