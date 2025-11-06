import { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { assets } from '../assets/assets'

const ReviewSection = ({ productId, onReviewAdded }) => {
    const { backendUrl, token, userInfo } = useContext(ShopContext)
    const [reviews, setReviews] = useState([])
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchReviews()
    }, [productId])

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/review/product/${productId}`)
            if (response.data.success) {
                setReviews(response.data.reviews)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleSubmitReview = async (e) => {
        e.preventDefault()

        if (!token) {
            toast.error('Vui lòng đăng nhập để đánh giá')
            return
        }

        try {
            setLoading(true)
            const response = await axios.post(
                `${backendUrl}/api/review/add`,
                {
                    productId,
                    rating,
                    comment
                },
                { headers: { token } }
            )

            if (response.data.success) {
                toast.success('Đánh giá của bạn đã được gửi!')
                setRating(5)
                setComment('')
                await fetchReviews()

                // Call parent callback to refresh rating
                if (onReviewAdded) {
                    onReviewAdded()
                }
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const renderStars = (count, isInteractive = false) => {
        const stars = []
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <img
                    key={i}
                    src={i <= count ? assets.star_icon : assets.star_dull_icon}
                    alt="star"
                    className={`w-5 ${isInteractive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
                    onClick={isInteractive ? () => setRating(i) : undefined}
                />
            )
        }
        return stars
    }

    return (
        <div className='flex flex-col gap-6'>
            {/* Add Review Form */}
            {token && (
                <form onSubmit={handleSubmitReview} className='bg-gray-50 p-6 rounded-lg'>
                    <h3 className='text-lg font-semibold mb-4'>Viết đánh giá của bạn</h3>

                    <div className='mb-4'>
                        <label className='block text-sm font-medium mb-2'>Đánh giá của bạn:</label>
                        <div className='flex gap-1'>
                            {renderStars(rating, true)}
                        </div>
                    </div>

                    <div className='mb-4'>
                        <label className='block text-sm font-medium mb-2'>Nhận xét:</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500'
                            rows="4"
                            placeholder='Chia sẻ trải nghiệm của bạn về sản phẩm...'
                            required
                        />
                    </div>

                    <button
                        type='submit'
                        disabled={loading}
                        className='bg-black text-white px-6 py-2 rounded hover:bg-gray-800 disabled:bg-gray-400'
                    >
                        {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                </form>
            )}

            {/* Reviews List */}
            <div className='flex flex-col gap-4'>
                <h3 className='text-lg font-semibold'>
                    Tất cả đánh giá ({reviews.length})
                </h3>

                {reviews.length === 0 ? (
                    <p className='text-gray-500 text-center py-8'>
                        Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!
                    </p>
                ) : (
                    reviews.map((review) => (
                        <div key={review._id} className='border-b pb-4 last:border-b-0'>
                            <div className='flex items-center gap-3 mb-2'>
                                <div className='w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold'>
                                    {review.userName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className='font-semibold'>{review.userName}</p>
                                    <div className='flex items-center gap-2'>
                                        <div className='flex gap-0.5'>
                                            {renderStars(review.rating)}
                                        </div>
                                        <span className='text-xs text-gray-500'>
                                            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className='text-gray-700 ml-13'>{review.comment}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default ReviewSection
