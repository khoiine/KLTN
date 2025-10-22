import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const Orders = ({token}) => {

    const [orders, setOrders] = useState([])
    
    const fetchAllOrders = useCallback(async () => {

        if(!token){
            return null;
        }

        try {

            const response = await axios.post(backendUrl + '/api/order/list',{},{headers:{token}})
            if(response.data.success){
                // Backend đã lọc đơn hàng phù hợp, hiển thị tất cả đơn hàng được trả về
                setOrders(response.data.orders)
            } else {
                toast.error(response.data.message)
            }
            
        } catch (error) {
            toast.error(error.message)
        }

    }, [token])

    //Cập nhật trạng thái đơn hàng
    const statusHandler = async (event, orderId) => {
        try {

            const response = await axios.post(backendUrl + '/api/order/status',{orderId,status:event.target.value},{headers:{token}})
            if(response.data.success){
                await fetchAllOrders();
            }
            
        } catch (error) {
            
            console.log(error)
            toast.error(error.message)

        }
    }

    useEffect(()=>{
        fetchAllOrders();
    },[fetchAllOrders])

    return(
        <div>
            <h3>Đơn hàng</h3>
            <div>
                {
                    orders.map((order,index) => (
                        <div className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700' key={index}>
                            <img className='w-12' src={assets.parcel_icon} alt="" />
                        <div>
                        <div>
                            {order.items.map((item,index)=>{
                                if(index === order.items.length - 1){
                                    return <p className='py-0.5' key={index}> {item.name} x {item.quantity} <span>{item.size}</span></p>
                                }
                                else{
                                    return <p className='py-0.5' key={index}> {item.name} x {item.quantity} <span>{item.size}</span>,</p>
                                }
                            })}
                        </div>
                        <p className='mt-3 mb-2 font-medium'>{order.address.firstName + " " + order.address.lastName}</p>
                        <div>
                            <p>{order.address.street}</p>
                            <p>{order.address.state + ", " + order.address.district + ", " + order.address.city}</p>
                        </div>
                        <p>{order.address.phone}</p>
            </div>
                <div>
                    <p className='text-sm sm:text-[-15px]'>Số lượng : {order.items.length}</p>
                    <p className='mt-3'>Phương thức thanh toán : {order.paymentMethod}</p>
                    <p>Thanh toán : {order.payment ? 'Hoàn tất' : 'Chờ xử lý'}</p>
                    <p>Ngày : {new Date(order.date).toLocaleDateString()}</p>
                </div>
                <p className='text-sm sm:text-[-15px]'>Giá: {order.amount}{currency}</p>
                <select onChange={(event)=>statusHandler(event,order._id)} value={order.status} className='p-2 font-semibold'>
                    <option value="Đã đặt hàng">Đã đặt hàng</option>
                    <option value="Đóng gói">Đóng gói</option>
                    <option value="Vận chuyển">Vận chuyển</option>
                    <option value="Đang giao hàng">Đang giao hàng</option>
                    <option value="Hoàn tất">Hoàn tất</option>
                </select>
            </div>
        ))
    }
    </div>
    </div>
    )
}

export default Orders