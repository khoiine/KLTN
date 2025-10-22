import { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const AdminReviews = ({ token }) => {
    const [reviews, setReviews] = useState([])
    const [products, setProducts] = useState([])

    // Fetch all reviews
    const fetchReviews = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/review/all', {
                headers: { token }
            })
            console.log('Reviews response:', response.data) // Debug log
            if (response.data.success) {
                setReviews(response.data.reviews)
            } else {
                toast.error(response.data.message || 'Không thể tải danh sách đánh giá')
            }
        } catch (error) {
            console.log('Error fetching reviews:', error)
            toast.error('Có lỗi khi tải danh sách đánh giá: ' + error.message)
        }
    }

    // Fetch all products for display
    const fetchProducts = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/product/list')
            if (response.data.success) {
                setProducts(response.data.products)
            }
        } catch (error) {
            console.log(error)
        }
    }

    // Delete review
    const deleteReview = async (reviewId) => {
        try {
            const response = await axios.delete(backendUrl + `/api/review/admin/delete/${reviewId}`, {
                headers: { token }
            })
            if (response.data.success) {
                toast.success('Xóa đánh giá thành công')
                fetchReviews() // Reload reviews
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error('Có lỗi khi xóa đánh giá: ' + error.message)
        }
    }

    // Get product name by ID
    const getProductName = (productId) => {
        const product = products.find(p => p._id === productId)
        return product ? product.name : 'Sản phẩm không tồn tại'
    }

    // Format date helper function
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

    useEffect(() => {
        fetchReviews()
        fetchProducts()
    }, [])

    return (
        <div>
            <h3 className="text-2xl font-semibold mb-6">Quản lý đánh giá</h3>
            
            {reviews.length === 0 ? (
                <p className="text-gray-500">Chưa có đánh giá nào.</p>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review._id} className="bg-white p-4 rounded-lg shadow border">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h4 className="font-medium text-lg mb-2">
                                        {getProductName(review.productId)}
                                    </h4>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-medium">Người đánh giá:</span>
                                        <span>{review.userName}</span>
                                        <span className="text-gray-500">({review.userEmail})</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-medium">Đánh giá:</span>
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span
                                                    key={star}
                                                    className={`text-lg ${
                                                        star <= review.rating
                                                            ? 'text-yellow-500'
                                                            : 'text-gray-300'
                                                    }`}
                                                >
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            ({review.rating}/5)
                                        </span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="font-medium">Bình luận:</span>
                                        <p className="text-gray-700 mt-1">{review.comment}</p>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Ngày đánh giá: {formatDate(review.createdAt)}
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
                                            deleteReview(review._id)
                                        }
                                    }}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm ml-4"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default AdminReviews
