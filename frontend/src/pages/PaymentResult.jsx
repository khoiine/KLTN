import { useContext, useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const PaymentResult = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { backendUrl, token, refreshCart } = useContext(ShopContext)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const handlePaymentResult = async () => {
      try {
        const orderId = searchParams.get('orderid')
        const status = searchParams.get('status') // ZaloPay trả về status trong URL
        const appTransId = searchParams.get('apptransid')
        
        console.log('Payment result params:', { orderId, status, appTransId })
        
        if (!orderId) {
          toast.error('Không tìm thấy thông tin đơn hàng')
          navigate('/cart')
          return
        }

        // Kiểm tra trạng thái từ URL parameters trước
        if (status) {
          if (status === '1') {
            // Thanh toán thành công - backend đã xóa giỏ hàng, chỉ cần refresh
            await refreshCart()
            toast.success('Thanh toán thành công!')
            navigate('/orders')
            return
          } else {
            // Thanh toán thất bại hoặc hủy
            toast.error('Thanh toán thất bại hoặc đã bị hủy!')
            navigate('/cart')
            return
          }
        }

        // Nếu không có status trong URL, kiểm tra với ZaloPay API
        if (appTransId) {
          // Đợi một chút để callback có thể xử lý trước
          setTimeout(async () => {
            try {
              const response = await axios.post(
                backendUrl + '/api/order/zalopay-status',
                { app_trans_id: appTransId },
                { headers: { token } }
              )

              console.log('Payment status check:', response.data)

              if (response.data.return_code === 1) {
                // Thanh toán thành công - backend đã xóa giỏ hàng, chỉ cần refresh
                await refreshCart()
                toast.success('Thanh toán thành công!')
                navigate('/orders')
              } else if (response.data.return_code === 2) {
                // Đang xử lý - kiểm tra lại sau 3 giây
                toast.info('Đang xử lý thanh toán...')
                setTimeout(handlePaymentResult, 3000)
                return
              } else {
                // Thanh toán thất bại - hủy đơn hàng nếu cần
                try {
                  await axios.post(
                    backendUrl + '/api/order/cancel',
                    { orderId: orderId },
                    { headers: { token } }
                  )
                } catch (cancelError) {
                  console.log('Error cancelling order:', cancelError)
                }
                
                toast.error('Thanh toán thất bại!')
                navigate('/cart')
              }
            } catch (error) {
              console.log('Error checking payment status:', error)
              toast.error('Không thể kiểm tra trạng thái thanh toán')
              navigate('/cart')
            } finally {
              setIsChecking(false)
            }
          }, 2000) // Đợi 2 giây để callback xử lý
        } else {
          // Không có thông tin gì - có thể người dùng hủy
          toast.error('Không có thông tin thanh toán')
          navigate('/cart')
          setIsChecking(false)
        }
        
      } catch (error) {
        console.log('Payment result error:', error)
        toast.error('Có lỗi xảy ra khi xử lý kết quả thanh toán')
        navigate('/cart')
        setIsChecking(false)
      }
    }

    handlePaymentResult()
  }, [searchParams, backendUrl, token, navigate, refreshCart])

  if (isChecking) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg">Đang kiểm tra trạng thái thanh toán...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="text-center">
        <p className="text-lg">Đang xử lý kết quả thanh toán...</p>
      </div>
    </div>
  )
}

export default PaymentResult
