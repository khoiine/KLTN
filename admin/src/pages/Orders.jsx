import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { backendUrl, formatCurrency } from '../App'

const Orders = ({ token, backendUrl }) => {
    const apiBase = backendUrl || import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

    const [orders, setOrders] = useState([])
    const [confirmingOrderId, setConfirmingOrderId] = useState(null)
    const [deletingOrderId, setDeletingOrderId] = useState(null)

    // 🧭 Fetch tất cả đơn hàng
    const fetchAllOrders = useCallback(async () => {
        try {
            const res = await axios.post(`${apiBase}/api/order/list`, {}, { headers: { token } })
            if (res.data?.success) setOrders(res.data.orders || [])
        } catch (err) {
            console.error('fetchAllOrders error', err)
        }
    }, [token, apiBase])

    useEffect(() => { fetchAllOrders() }, [fetchAllOrders])

    // ✅ Xác nhận đơn hàng (chuyển trạng thái sang "Đã đặt hàng")
    const handleConfirm = async (orderId) => {
        if (!orderId) return
        if (!window.confirm('Xác nhận đơn này thành "Đã đặt hàng"?')) return

        try {
            setConfirmingOrderId(orderId)
            const res = await axios.post(`${apiBase}/api/order/status`, { orderId, status: 'Đã đặt hàng' }, { headers: { token } })
            if (res.data?.success) {
                await fetchAllOrders()
                toast.success('Đã xác nhận đơn hàng!')
            } else {
                toast.error(res.data?.message || 'Xác nhận thất bại')
            }
        } catch (err) {
            console.error('confirm error', err)
            toast.error(err?.response?.data?.message || err.message || 'Network error')
        } finally {
            setConfirmingOrderId(null)
        }
    }

    // 🔁 Cập nhật trạng thái đơn hàng (từ dropdown)
    const statusHandler = async (event, orderId) => {
        const newStatus = event.target.value
        if (!orderId) return
        try {
            setOrders(orders.map(order => order._id === orderId ? { ...order, status: newStatus } : order))
            const res = await axios.post(`${apiBase}/api/order/status`, { orderId, status: newStatus }, { headers: { token } })
            if (!res.data?.success) throw new Error(res.data?.message || 'Cập nhật trạng thái thất bại')
            toast.success('Đã cập nhật trạng thái đơn hàng')
        } catch (err) {
            console.error('statusHandler error', err)
            toast.error(err?.response?.data?.message || err.message || 'Network error')
            setOrders(orders.map(order => order._id === orderId ? { ...order, status: order.status } : order))
        }
    }

    // ❌ Xóa đơn hàng
    const handleDelete = async (orderId) => {
        if (!orderId) return
        if (!window.confirm('Bạn có chắc muốn xóa đơn hàng này?')) return

        try {
            setDeletingOrderId(orderId)
            const res = await axios.post(`${apiBase}/api/order/delete`, { orderId }, { headers: { token } })
            if (res.data?.success) {
                setOrders(prev => prev.filter(o => o._id !== orderId))
                toast.success('Đã xóa đơn hàng')
            } else {
                toast.error(res.data?.message || 'Xóa đơn hàng thất bại')
            }
        } catch (err) {
            console.error('delete order error', err)
            toast.error(err?.response?.data?.message || err.message || 'Network error')
        } finally {
            setDeletingOrderId(null)
        }
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Quản lý đơn hàng</h1>

            {orders.length === 0 ? (
                <p className="text-center text-gray-500">Không có đơn hàng nào.</p>
            ) : (
                orders.map((order, index) => (
                    <div
                        key={index}
                        className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] 
                       gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700 rounded-lg"
                    >
                        {/* Icon */}
                        <img className="w-12" src={assets.parcel_icon} alt="" />

                        {/* Thông tin sản phẩm & khách hàng */}
                        <div>
                            <div>
                                {order.items.map((item, i) => (
                                    <p className="py-0.5" key={i}>
                                        {item.name} x {item.quantity} <span>{item.size}</span>
                                        {i < order.items.length - 1 && ','}
                                    </p>
                                ))}
                            </div>

                            <div className="mt-3 mb-2">
                                <p className="font-medium">
                                    {order.user?.name || (order.address?.firstName + ' ' + order.address?.lastName)}
                                </p>
                                <p className="text-sm text-gray-600">{order.user?.email || order.email || '-'}</p>
                                <p className="text-xs text-gray-400">
                                    User ID: {order.user?._id || order.userId || '-'}
                                </p>
                            </div>

                            <div>
                                <p>{order.address?.street}</p>
                                <p>{order.address?.state + ', ' + order.address?.district + ', ' + order.address?.city}</p>
                            </div>
                            <p>{order.address?.phone}</p>
                        </div>

                        {/* Cột thanh toán / giá / ngày đặt */}
                        <div>
                            <p className="font-semibold">Tổng tiền:</p>
                            <p>{formatCurrency(order.amount)}</p>
                            <p className="mt-2 text-gray-500">{new Date(order.date).toLocaleDateString('vi-VN')}</p>
                            <p className='mt-3'>Phương thức thanh toán : {order.paymentMethod}</p>
                        </div>

                        {/* Cột trạng thái */}
                        <div className="flex flex-col gap-2">
                            <p className="font-semibold text-gray-700">Trạng thái</p>

                            {order.status === 'Đang chờ xác nhận' ? (
                                <button
                                    onClick={() => handleConfirm(order._id)}
                                    disabled={confirmingOrderId === order._id}
                                    className="px-4 py-2 bg-blue-600 text-white rounded"
                                >
                                    {confirmingOrderId === order._id ? 'Đang xác nhận...' : 'Xác nhận (Đặt hàng)'}
                                </button>
                            ) : (
                                <select
                                    onChange={(event) => statusHandler(event, order._id)}
                                    value={order.status}
                                    className="p-2 font-semibold border rounded-md"
                                >
                                    <option value="Đã đặt hàng">Đã đặt hàng</option>
                                    <option value="Đóng gói">Đóng gói</option>
                                    <option value="Vận chuyển">Vận chuyển</option>
                                    <option value="Đang giao hàng">Đang giao hàng</option>
                                    <option value="Hoàn tất">Hoàn tất</option>
                                </select>
                            )}
                            <button
                                onClick={() => handleDelete(order._id)}
                                disabled={deletingOrderId === order._id}
                                className="px-4 py-2 bg-red-600 text-white rounded"
                            >
                                {deletingOrderId === order._id ? 'Đang xóa...' : 'Xóa'}
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}

export default Orders
