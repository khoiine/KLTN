import { useContext, useEffect, useState, useCallback } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'

const AdminReviews = () => {
  const { backendUrl, token, userInfo } = useContext(ShopContext)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  // Kiểm tra quyền admin
  const isAdmin = userInfo && userInfo.email === 'admin@gmail.com'

  // Lấy tất cả reviews
  const fetchAllReviews = useCallback(async () => {
    try {
      const response = await axios.post(
        backendUrl + '/api/review/admin/all',
        {},
        { headers: { token } }
      )
      
      if (response.data.success) {
        setReviews(response.data.reviews)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error('Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }, [backendUrl, token])

  // Xóa review
  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      try {
        const response = await axios.post(
          backendUrl + '/api/review/admin/delete',
          { reviewId },
          { headers: { token } }
        )

        if (response.data.success) {
          toast.success('Đã xóa đánh giá')
          fetchAllReviews() // Refresh reviews
        } else {
          toast.error(response.data.message)
        }
      } catch (error) {
        console.log(error)
        toast.error('Có lỗi xảy ra')
      }
    }
  }

  // Render stars
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <img
        key={index}
        src={index < rating ? assets.star_icon : assets.star_dull_icon}
        alt=""
        className="w-4 h-4"
      />
    ))
  }

  // Format date
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  useEffect(() => {
    if (token && isAdmin) {
      fetchAllReviews()
    } else if (userInfo && !isAdmin) {
      toast.error('Bạn không có quyền truy cập trang này')
    }
  }, [token, isAdmin, userInfo, fetchAllReviews])

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-lg text-gray-500">Bạn không có quyền truy cập trang này</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Quản lý đánh giá</h1>
      
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review, index) => (
            <div key={index} className="bg-white border rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-medium text-gray-900">{review.userName}</h3>
                  <p className="text-sm text-gray-500">{review.userEmail}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex gap-1">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(review.date)}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDeleteReview(review._id)}
                  className="text-red-500 hover:text-red-700 px-3 py-1 border border-red-200 hover:border-red-300 rounded transition-colors"
                >
                  Xóa
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Mã sản phẩm: {review.productId}</p>
                <p className="text-gray-800">{review.comment}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Chưa có đánh giá nào</p>
        </div>
      )}
    </div>
  )
}

export default AdminReviews
