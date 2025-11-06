import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import ReviewSection from '../components/ReviewSection';
import { toast } from 'react-toastify'
import { formatVND } from '../App'
import axios from 'axios'
import { backendUrl } from '../App';

const Product = () => {

  const { productId } = useParams();
  const { products, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('')
  const [stockInfo, setStockInfo] = useState({})
  const [reviews, setReviews] = useState([])
  const [averageRating, setAverageRating] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)

  const fetchProductData = async () => {

    const foundProduct = products.find(item => item._id === productId)

    if (foundProduct) {
      setProductData(foundProduct)
      setImage(foundProduct.image[0])

      // Get stock info - handle both Map and plain object
      const stock = {}
      foundProduct.sizes.forEach(s => {
        const stockValue = foundProduct.stock?.[s]
        stock[s] = Number(stockValue) || 0
      })
      console.log('Stock info:', stock) // Debug log
      setStockInfo(stock)
    }

  }

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/review/product/${productId}`)
      if (response.data.success) {
        setReviews(response.data.reviews)
        setReviewCount(response.data.reviews.length)

        // Calculate average rating
        if (response.data.reviews.length > 0) {
          const totalRating = response.data.reviews.reduce((sum, review) => sum + review.rating, 0)
          const avgRating = totalRating / response.data.reviews.length
          setAverageRating(avgRating)
        } else {
          setAverageRating(0)
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchProductData();
    fetchReviews();
  }, [productId, products])

  const handleAddToCart = async () => {
    if (!size) {
      toast.error('Vui lòng chọn size')
      return
    }

    const availableStock = stockInfo[size] || 0
    if (availableStock === 0) {
      toast.error(`Size ${size} đã hết hàng`)
      return
    }

    // Kiểm tra hàng còn
    try {
      const response = await axios.post(`${backendUrl}/api/product/check-stock`, {
        productId: productData._id,
        size,
        quantity: 1
      })

      if (response.data.success) {
        addToCart(productData._id, size)
        toast.success('Đã thêm vào giỏ hàng')
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error('Không thể kiểm tra tồn kho')
    }
  }

  // Render star rating
  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <img key={`full-${i}`} src={assets.star_icon} alt="star" className="w-3.5" />
      )
    }

    // Half star (you can add a half star icon if you have one)
    if (hasHalfStar) {
      stars.push(
        <img key="half" src={assets.star_icon} alt="star" className="w-3.5 opacity-50" />
      )
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <img key={`empty-${i}`} src={assets.star_dull_icon} alt="empty star" className="w-3.5" />
      )
    }

    return stars
  }

  return productData ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      {/*--- Product Data ----*/}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
        {/*----- Product Images -----*/}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
            {
              productData.image.map((item, index) => (
                <img onClick={() => setImage(item)} src={item} key={index} className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer' alt="" />
              ))
            }
          </div>
          <div className='w-full sm:w-[80%]'>
            <img className='w-full h-auto' src={image} alt="" />
          </div>
        </div>

        {/* ---------- Product inFo ---------- */}
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
          {/* Dynamic Star Rating */}
          <div className='flex items-center gap-1 mt-2'>
            {renderStars(averageRating)}
            <p className='pl-2 text-sm text-gray-600'>
              ({averageRating.toFixed(1)} / 5.0)
            </p>
          </div>
          <p className='mt-5 text-3xl font-medium'>{formatVND(productData.price)}</p>
          <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>
          <div className='flex flex-col gap-4 my-8'>
            <p>Chọn Size</p>
            <div className='flex gap-2'>
              {productData.sizes.map((item, index) => {
                const stock = stockInfo[item] || 0
                const isOutOfStock = stock === 0
                const isLowStock = stock > 0 && stock <= 5

                return (
                  <button
                    key={index}
                    onClick={() => !isOutOfStock && setSize(item)}
                    className={`border py-2 px-4 bg-gray-100 relative ${item === size ? 'border-orange-500' : ''
                      } ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isOutOfStock}
                  >
                    {item}
                    {isOutOfStock && (
                      <span className='absolute inset-0 flex items-center justify-center text-red-500 text-xs font-bold'>
                        Hết
                      </span>
                    )}
                    {isLowStock && !isOutOfStock && (
                      <span className='absolute -top-1 -right-1 bg-yellow-400 text-white text-[8px] px-1 rounded'>
                        {stock}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            {size && stockInfo[size] > 0 && stockInfo[size] <= 10 && (
              <p className='text-yellow-600 text-sm'>
                Chỉ còn {stockInfo[size]} sản phẩm size {size}
              </p>
            )}
          </div>
          <button onClick={handleAddToCart} className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'>
            THÊM VÀO GIỎ HÀNG
          </button>
          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
            <p>100% Hàng Chính Hãng</p>
            <p>Có thể thanh toán tiền mặt</p>
            <p>Chính sách đổi trả trong vòng 7 ngày</p>
          </div>
        </div>
      </div>
      {/* ------ Đánh giá ------- */}
      <div className='mt-20'>
        <div className='flex items-center gap-4'>
          <b className='border px-5 py-3 text-sm bg-gray-100'>
            Đánh giá ({reviewCount})
          </b>
          {reviewCount > 0 && (
            <div className='flex items-center gap-2'>
              <div className='flex items-center gap-1'>
                {renderStars(averageRating)}
              </div>
              <span className='text-lg font-semibold'>{averageRating.toFixed(1)}</span>
              <span className='text-sm text-gray-500'>trên 5</span>
            </div>
          )}
        </div>

        <div className='border px-6 py-6'>
          <ReviewSection
            productId={productId}
            onReviewAdded={fetchReviews}
          />
        </div>
      </div>
      {/* -----display--------- */}
      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
    </div>
  ) : <div className=' opacity-0'></div>
}

export default Product
