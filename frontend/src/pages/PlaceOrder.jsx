import { useContext, useState, useEffect } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios' 
import { toast } from 'react-toastify'

const PlaceOrder = () => {

  const [method, setMethod] = useState('cod');
  const {navigate, backendUrl, token, cartItems, getCartAmount, delivery_fee, products, userInfo, refreshCart} = useContext(ShopContext);
  const[formData, setFormData] = useState({
    firstName:'',
    lastName:'',
    email:'',
    street:'',
    city:'',
    state:'',
    district:'',
    phone:'',
  })

  // Auto-fill form with user profile data
  useEffect(() => {
    if (userInfo) {
      const nameParts = userInfo.name ? userInfo.name.split(' ') : ['', ''];
      setFormData(prevData => ({
        ...prevData,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: userInfo.email || '',
        street: userInfo.address || '',
        city: userInfo.city || '',
        state: userInfo.ward || '',
        district: userInfo.district || '',
        phone: userInfo.phone || '',
      }))
    }
  }, [userInfo])

  const onChangeHandler = (event) => {
    const name = event.target.name
    const value = event.target.value

    setFormData(data => ({...data,[name]:value}))
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    try {

      let orderItems = []

      for(const items in cartItems) {
        for(const item in cartItems[items]){
          if(cartItems[items][item] > 0) {
            const itemInfo = structuredClone(products.find(product => product._id === items))
            if(itemInfo){
              itemInfo.size = item;
              itemInfo.quantity = cartItems[items][item];
              orderItems.push(itemInfo);
            }
          }
        }
      }
    
      let orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee
      };

      switch(method){
        //Call API cho ship COD
        case 'cod':
            { const response = await axios.post(backendUrl + '/api/order/place', orderData, {headers:{token}})
            console.log(response.data.success)
            if(response.data.success){
              await refreshCart(); // Backend đã xóa giỏ hàng, chỉ cần refresh
              navigate('/orders');
            } else{
              toast.error(response.data.message)
            }
            break; }

        //Call API cho thanh toán ZaloPay
        case 'zalo':
            { const response = await axios.post(backendUrl + '/api/order/zalopay', orderData, {headers:{token}})
            console.log(response.data)
            if(response.data.success){
              // Redirect đến trang thanh toán ZaloPay
              window.location.href = response.data.order_url;
            } else{
              toast.error(response.data.message)
            }
            break; }
        
      }
      
    } catch (error) {
        console.log(error)
        toast.error(error.message)
    }
  };


  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
      {/* Left Side */}
      <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
        <div className='text-xl sm:text-2xl my-3'>
          <Title text1={'Thông tin'} text2={'vận chuyển'}/>
        </div>
        <div className='flex gap-3'>
          <input onChange={onChangeHandler} name='firstName' value={formData.firstName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' required type="text" placeholder='Họ và tên đệm' />
          <input onChange={onChangeHandler} name='lastName' value={formData.lastName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' required type="text" placeholder='Tên' />
        </div>
        <input onChange={onChangeHandler} name='email' value={formData.email} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' required type="email" placeholder='Nhập địa chỉ Email' />
        <input onChange={onChangeHandler} name='street' value={formData.street} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' required type="text" placeholder='Địa chỉ' />

        <input onChange={onChangeHandler} name='city' value={formData.city} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' required type="text" placeholder='Tỉnh/Thành phố' />

        <div className='flex gap-3'>
          <input onChange={onChangeHandler} name='state' value={formData.state} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' required type="text" placeholder='Phường' />
          <input onChange={onChangeHandler} name='district' value={formData.district} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' required type="text" placeholder='Quận' />
        </div>
        <input onChange={onChangeHandler} name='phone' value={formData.phone} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="phone" required placeholder='Số điện thoại' />
      </div>

      {/* Right Side */}
      <div className='mt-8'>
        
          <div className='mt-8 min-w-8'>
            <CartTotal/>
          </div>

          <div className='mt-12'>
            <Title text1={'Phương thức thanh toán'}/>
            {/* Payment Selection */}
            <div className='flex gap-3 flex-col lg:flex-row'>
            {/* Tiền mặt */} 
              <div onClick={()=>setMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
                <p className='text-gray-500 text-sm font-medium mx-4'>Thanh toán bằng tiền mặt</p>
              </div>
            </div>
            <div className='flex gap-3 flex-col lg:flex-row'>
            {/* Zalopay */} 
              <div onClick={()=>setMethod('zalo')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'zalo' ? 'bg-green-400' : ''}`}></p>
                <p className='text-gray-500 text-sm font-medium mx-4'>ZaloPay</p>
              </div>
            </div>

            <div className='w-full text-end mt-8'>
              <button type='submit' className='bg-black text-white px-16 py-3 text-sm rounded-full'>Thanh toán</button>
            </div>
          </div>

      </div>
    </form>
  )
}

export default PlaceOrder
