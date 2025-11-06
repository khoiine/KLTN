import { useContext, useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import { formatVND } from '../App'

const Orders = () => {
  const { backendUrl, token } = useContext(ShopContext)

  const [orderData, setorderData] = useState([])
  const [cancellingOrderId, setCancellingOrderId] = useState(null)

  const loadOrderData = useCallback(async () => {
    try {
      if (!token) {
        return null
      }

      const response = await axios.post(
        backendUrl + '/api/order/userorders',
        {},
        { headers: { token } }
      )
      if (response.data.success) {
        let allOrdersItem = []
        response.data.orders.map((order) => {
          // Backend đã lọc đơn hàng phù hợp, hiển thị tất cả đơn hàng được trả về
          order.items.map((item) => {
            item['status'] = order.status
            item['payment'] = order.payment
            item['paymentMethod'] = order.paymentMethod
            item['date'] = order.date
            item['orderId'] = order._id
            allOrdersItem.push(item)
          })
        })
        setorderData(allOrdersItem.reverse())
      }
    } catch (error) {
      console.log(error)
    }
  }, [token, backendUrl])

  useEffect(() => {
    loadOrderData()
  }, [loadOrderData])

  //Chuyển ngày sang dạng dd/mm/yyyy
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const handleCancelClick = async (orderId) => {
    if (!orderId) return
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return

    try {
      setCancellingOrderId(orderId)
      const payload = { orderId, orderid: orderId } // send both names for safety

      const res = await axios.post(
        `${backendUrl}/api/order/cancel`,
        payload,
        {
          headers: { token } // same as your other requests (auth middleware expects this)
        }
      )

      if (res?.data?.success) {
        if (typeof loadOrderData === 'function') await loadOrderData()
        else alert('Hủy đơn thành công')
      } else {
        alert(res?.data?.message || 'Hủy đơn thất bại')
      }
    } catch (err) {
      console.error('cancel error', err?.response?.data || err.message)
      alert(err?.response?.data?.message || err.message || 'Network error')
    } finally {
      setCancellingOrderId(null)
    }
  }

  return (
    <div className='border-t pt-16'>
      <div className='text-2xl'>
        <Title text1={'Đơn hàng'} text2={'của tôi'} />
      </div>

      <div>
        {orderData.map((item, index) => {
          const isCancellable = item.status === 'Đang chờ xác nhận'
          return (
            <div
              key={index}
              className='py-4 border-t text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4'
            >
              <div className='flex items-start gap-6 text-sm'>
                <img className='w-16 sm:w-20' src={item.image[0]} alt='' />
                <div>
                  <p className='sm:text-base font-medium'>{item.name}</p>
                  <div className=' flex items-center gap-3 mt-2 text-base text-gray-700'>
                    <p className='text-lg'>{formatVND(item.price)}</p>
                    <p>Số lượng: {item.quantity}</p>
                    <p>Size: {item.size}</p>
                  </div>
                  <p className='mt-2'>
                    Ngày:{' '}
                    <span className='text-gray-400'>
                      {formatDate(item.date)}
                    </span>
                  </p>
                  <p className='mt-2'>
                    Thanh toán:{' '}
                    <span className='text-gray-400'>{item.paymentMethod}</span>
                  </p>
                </div>
              </div>
              <div className='md:w-1/2 flex justify-between'>
                <div className='flex items-center gap-2'>
                  <p className='min-w-2 h-2 rounded-full bg-green-500'></p>
                  <p className='text-sm md:text-base'>
                    {item.status === 'Order Placed'
                      ? 'Đã đặt hàng'
                      : item.status}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={loadOrderData}
                    className='border px-4 py-2 text-sm font-medium rounded-sm'
                  >
                    Theo dõi đơn hàng
                  </button>

                  {item.status === 'Đang chờ xác nhận' && (
                    <button
                      onClick={() => handleCancelClick(item.orderId)}
                      disabled={cancellingOrderId === item.orderId}
                      className='border px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-sm'
                    >
                      {cancellingOrderId === item.orderId ? 'Đang hủy...' : 'Hủy đơn'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Orders
