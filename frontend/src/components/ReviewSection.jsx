import { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const ReviewSection = ({ productId }) => {
    const { token, backendUrl, userInfo, isAdmin } = useContext(ShopContext)
    const [reviews, setReviews] = useState([])
    const [userReview, setUserReview] = useState(null)
    const [showReviewForm, setShowReviewForm] = useState(false)
    const [newReview, setNewReview] = useState({
        rating: 5,
        comment: ''
    })

    // Fetch reviews for this product
    const fetchReviews = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/review/product/${productId}`)
            if (response.data.success) {
                setReviews(response.data.reviews)
                
                // Check if current user has already reviewed this product
                if (userInfo && token) {
                    const existingReview = response.data.reviews.find(review => review.userId === userInfo._id)
                    setUserReview(existingReview)
                }
            }
        } catch (error) {
            console.log('Error fetching reviews:', error)
        }
    }

    // Submit new review
    const submitReview = async () => {
        if (!token) {
            toast.error('Bạn cần đăng nhập để đánh giá sản phẩm')
            return
        }

        if (!newReview.comment.trim()) {
            toast.error('Vui lòng nhập bình luận')
            return
        }

        try {
            const response = await axios.post(`${backendUrl}/api/review/add`, {
                productId,
                rating: newReview.rating,
                comment: newReview.comment
            }, {
                headers: { token }
            })

            if (response.data.success) {
                toast.success('Đánh giá thành công!')
                setShowReviewForm(false)
                setNewReview({ rating: 5, comment: '' })
                fetchReviews() // Reload reviews
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log('Error submitting review:', error)
            toast.error('Có lỗi xảy ra khi gửi đánh giá')
        }
    }

    // Delete review (for admin or own review)
    const deleteReview = async (reviewId) => {
        try {
            const response = await axios.delete(`${backendUrl}/api/review/delete/${reviewId}`, {
                headers: { token }
            })

            if (response.data.success) {
                toast.success('Xóa đánh giá thành công')
                fetchReviews() // Reload reviews
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log('Error deleting review:', error)
            toast.error('Có lỗi khi xóa đánh giá')
        }
    }

    // Format date
    const formatDate = (dateString) => {
        try {
            if (!dateString) return 'Chưa xác định'
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return 'Ngày không hợp lệ'
            
            const day = String(date.getDate()).padStart(2, '0')
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const year = date.getFullYear()
            return `${day}/${month}/${year}`
        } catch {
            return 'Ngày không hợp lệ'
        }
    }

    // Check if user can delete review (admin or own review)
    const canDeleteReview = (review) => {
        if (!userInfo || !token) return false
        return isAdmin || review.userId === userInfo._id
    }

    useEffect(() => {
        if (productId) {
            fetchReviews()
        }
    }, [productId, userInfo])

    return (
        <div className='mt-10'>
            <div className='flex justify-between items-center mb-6'>
                <h3 className='text-lg font-semibold'>Đánh giá sản phẩm ({reviews.length})</h3>
                
                {/* Show review button only if user is logged in and hasn't reviewed yet */}
                {token && userInfo && !userReview && (
                    <button
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className='bg-black text-white px-4 py-2 text-sm rounded hover:bg-gray-800'
                    >
                        {showReviewForm ? 'Hủy' : 'Viết đánh giá'}
                    </button>
                )}
            </div>

            {/* Review Form */}
            {showReviewForm && (
                <div className='bg-gray-50 p-4 rounded-lg mb-6'>
                    <h4 className='font-medium mb-3'>Viết đánh giá của bạn</h4>
                    
                    {/* Rating */}
                    <div className='mb-4'>
                        <label className='block text-sm font-medium mb-2'>Đánh giá:</label>
                        <div className='flex gap-1'>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setNewReview({ ...newReview, rating: star })}
                                    className={`text-2xl ${
                                        star <= newReview.rating ? 'text-yellow-500' : 'text-gray-300'
                                    } hover:text-yellow-500`}
                                >
                                    ★
                                </button>
                            ))}
                            <span className='ml-2 text-sm text-gray-600'>({newReview.rating}/5)</span>
                        </div>
                    </div>

                    {/* Comment */}
                    <div className='mb-4'>
                        <label className='block text-sm font-medium mb-2'>Bình luận:</label>
                        <textarea
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            placeholder='Chia sẻ trải nghiệm của bạn về sản phẩm...'
                            className='w-full border border-gray-300 rounded px-3 py-2 h-24 resize-none'
                            required
                        />
                    </div>

                    <div className='flex gap-2'>
                        <button
                            onClick={submitReview}
                            className='bg-black text-white px-4 py-2 text-sm rounded hover:bg-gray-800'
                        >
                            Gửi đánh giá
                        </button>
                        <button
                            onClick={() => {
                                setShowReviewForm(false)
                                setNewReview({ rating: 5, comment: '' })
                            }}
                            className='bg-gray-300 text-gray-700 px-4 py-2 text-sm rounded hover:bg-gray-400'
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            )}

            {/* Reviews List */}
            <div className='space-y-4'>
                {reviews.length === 0 ? (
                    <div className='text-center py-8 text-gray-500'>
                        <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                        {token && userInfo ? (
                            <p className='mt-2'>Hãy là người đầu tiên đánh giá!</p>
                        ) : (
                            <p className='mt-2'>Đăng nhập để có thể đánh giá sản phẩm.</p>
                        )}
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review._id} className='border border-gray-200 rounded-lg p-4'>
                            <div className='flex justify-between items-start mb-2'>
                                <div>
                                    <div className='flex items-center gap-2 mb-1'>
                                        <span className='font-medium'>{review.userName}</span>
                                        <div className='flex'>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span
                                                    key={star}
                                                    className={`text-sm ${
                                                        star <= review.rating ? 'text-yellow-500' : 'text-gray-300'
                                                    }`}
                                                >
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                        <span className='text-sm text-gray-500'>({review.rating}/5)</span>
                                    </div>
                                    <p className='text-sm text-gray-500'>{formatDate(review.createdAt)}</p>
                                </div>
                                
                                {/* Delete button for admin or own review */}
                                {canDeleteReview(review) && (
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
                                                deleteReview(review._id)
                                            }
                                        }}
                                        className='text-red-500 hover:text-red-700 text-sm'
                                    >
                                        Xóa
                                    </button>
                                )}
                            </div>
                            
                            <p className='text-gray-700'>{review.comment}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default ReviewSection
