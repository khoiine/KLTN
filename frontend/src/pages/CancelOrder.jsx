import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const CancelOrder = () => {
  const navigate = useNavigate()
  const { backendUrl, token } = useContext(ShopContext)

  useEffect(() => {
    const cancelOrder = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const orderId = urlParams.get('orderid')
        
        if (orderId) {
          const response = await axios.post(
            backendUrl + '/api/order/cancel',
            { orderId: orderId },
            { headers: { token } }
          )
          
          if (response.data.success) {
            toast.info('Đơn hàng đã được hủy')
          } else {
            toast.error('Không thể hủy đơn hàng')
          }
        }
        
        navigate('/cart')
      } catch (error) {
        console.log(error)
        toast.error('Có lỗi xảy ra')
        navigate('/cart')
      }
    }

    cancelOrder()
  }, [backendUrl, token, navigate])

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-lg">Đang hủy đơn hàng...</p>
      </div>
    </div>
  )
}

export default CancelOrder
