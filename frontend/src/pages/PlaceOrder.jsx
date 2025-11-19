import { useContext, useState, useEffect } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { formatCurrency } from '../../../admin/src/App'

const PlaceOrder = () => {

  const [method, setMethod] = useState('cod');
  const { navigate, backendUrl, token, cartItems, getCartAmount, delivery_fee, products, userInfo, refreshCart } = useContext(ShopContext);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    district: '',
    phone: '',
  })

  // voucher states
  const [voucherCode, setVoucherCode] = useState('')
  const [applying, setApplying] = useState(false)
  const [appliedVoucher, setAppliedVoucher] = useState(null)
  const [discountAmount, setDiscountAmount] = useState(0)

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

  const calculateDiscount = (voucher, subtotal) => {
    if (!voucher) return 0
    if (!voucher.active) return 0
    if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) return 0
    if (subtotal < (voucher.minOrder || 0)) return 0
    if (voucher.maxUses && voucher.maxUses > 0 && voucher.usedCount >= voucher.maxUses) return 0
    if (voucher.type === 'fixed') return Math.min(voucher.amount, subtotal)
    // percent
    return Math.floor((subtotal * (voucher.amount || 0)) / 100)
  }

  const applyVoucher = async () => {
    const code = (voucherCode || '').trim().toUpperCase()
    if (!code) { toast.error('Vui lòng nhập voucher'); return }
    try {
      setApplying(true)
      const res = await axios.get(`${backendUrl}/api/voucher/list`, { headers: { token } })
      if (!res.data?.success) throw new Error(res.data?.message || 'Không lấy được voucher')
      const list = res.data.vouchers || []
      const v = list.find(x => x.code === code)
      if (!v) { toast.error('Voucher không hợp lệ'); setApplying(false); return }
      const subtotal = getCartAmount()
      const discount = calculateDiscount(v, subtotal)
      if (discount <= 0) { toast.error('Voucher không hợp lệ hoặc không đủ điều kiện'); setApplying(false); return }
      setAppliedVoucher(v)
      setDiscountAmount(discount)
      toast.success(`Áp dụng voucher ${v.code} - giảm ${discount.toLocaleString()}₫`)
    } catch (err) {
      console.error('applyVoucher', err)
      toast.error(err?.response?.data?.message || err?.message || 'Lỗi khi áp dụng voucher')
    } finally {
      setApplying(false)
    }
  }

  const removeVoucher = () => {
    setAppliedVoucher(null)
    setDiscountAmount(0)
    setVoucherCode('')
  }

  const onChangeHandler = (event) => {
    const name = event.target.name
    const value = event.target.value

    setFormData(data => ({ ...data, [name]: value }))
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    try {

      let orderItems = []

      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(products.find(product => product._id === items))
            if (itemInfo) {
              itemInfo.size = item;
              itemInfo.quantity = cartItems[items][item];
              orderItems.push(itemInfo);
            }
          }
        }
      }

      // calculate totals including voucher discount
      const subtotal = getCartAmount()
      const totalBeforeDelivery = Math.max(0, subtotal - (discountAmount || 0))
      const totalAmount = totalBeforeDelivery + delivery_fee

      let orderData = {
        address: formData,
        items: orderItems,
        subtotal,
        discount: discountAmount || 0,
        voucherCode: appliedVoucher ? appliedVoucher.code : null,
        amount: totalAmount
      };

      switch (method) {
        //Call API cho ship COD
        case 'cod':
          {
            const response = await axios.post(backendUrl + '/api/order/place', orderData, { headers: { token } })
            console.log(response.data.success)
            if (response.data.success) {
              await refreshCart(); // Backend đã xóa giỏ hàng, chỉ cần refresh
              navigate('/orders');
            } else {
              toast.error(response.data.message)
            }
            break;
          }

        //Call API cho thanh toán ZaloPay
        case 'zalo':
          {
            const response = await axios.post(backendUrl + '/api/order/zalopay', orderData, { headers: { token } })
            console.log(response.data)
            if (response.data.success) {
              // Redirect đến trang thanh toán ZaloPay
              window.location.href = response.data.order_url;
              await refreshCart();
            } else {
              toast.error(response.data.message)
            }
            break;
          }

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
          <Title text1={'Thông tin'} text2={'vận chuyển'} />
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
        {/* Voucher UI */}
        <div className="w-full max-w-[360px] mt-4 p-4 border rounded bg-white">
          <div className="text-2xl mb-2">
            <Title text2={"Mã voucher"} />
          </div>
          {/* --- PHẦN NHẬP / HIỂN THỊ VOUCHER --- */}
          {!appliedVoucher ? (
            <div className="flex gap-2">
              <input
                value={voucherCode}
                onChange={e => setVoucherCode(e.target.value)}
                placeholder="Mã voucher"
                className="flex-1 p-2 border rounded"
              />
              <button
                type="button"
                onClick={applyVoucher}
                disabled={applying}
                className="bg-black text-white px-3 py-2 text-sm rounded"
              >
                {applying ? "Đang..." : "Áp dụng"}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-medium">{appliedVoucher.code}</div>
                <div className="text-sm text-gray-500">
                  Giảm{" "}
                  {appliedVoucher.type === "percent"
                    ? `${appliedVoucher.amount}%`
                    : `${appliedVoucher.amount.toLocaleString()}₫`}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-sm text-red-600">
                  -{discountAmount.toLocaleString()}₫
                </div>
                <button
                  type="button"
                  onClick={removeVoucher}
                  className="text-xs text-gray-600 mt-1"
                >
                  Nhập mã khác
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-full max-w-[360px] mt-4 p-4 border rounded bg-white">
          <Title text1={'Phương thức thanh toán'} />
          {/* Payment Selection */}
          <div className='flex gap-3 flex-col lg:flex-row'>
            {/* Tiền mặt */}
            <div onClick={() => setMethod('cod')} className='flex w-[300px] items-center gap-3 border p-2 px-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
              <p className='flex text-gray-500 text-sm font-medium mx-4'>
                <img src={assets.cash_logo} className='w-5 min-w-5 mr-2' alt="" />
                Thanh toán bằng tiền mặt
              </p>
            </div>
          </div>
          <div className='flex gap-3 flex-col lg:flex-row'>
            {/* Zalopay */}
            <div onClick={() => setMethod('zalo')} className='flex w-[300px] items-center gap-3 border p-2 px-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'zalo' ? 'bg-green-400' : ''}`}></p>
              <p className='flex text-gray-500 text-sm font-medium mx-4'>
                <img src={assets.zalopay_logo} className='w-5 min-w-5 mr-2' alt="" />
                Thanh toán bằng ZaloPay
              </p>
            </div>
          </div>
        </div>



        {/* --- PHẦN TỔNG TIỀN --- */}
        <div className="w-full max-w-[360px] mt-4 p-4 border rounded bg-white">
          <div className="text-2xl mb-2">
            <Title text2={"Tổng đơn hàng"} />
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <p>Tạm tính</p>
              <p>{formatCurrency(getCartAmount())}</p>
            </div>

            {discountAmount > 0 && (
              <>
                <div className="flex justify-between text-red-600">
                  <p>Giảm giá</p>
                  <p>-{formatCurrency(discountAmount)}</p>
                </div>
              </>
            )}

            <hr />

            <div className="flex justify-between">
              <p>Phí vận chuyển</p>
              <p>{formatCurrency(delivery_fee)}</p>
            </div>

            <hr />

            <div className="flex justify-between font-bold">
              <p>Tổng hóa đơn</p>
              <p>
                {formatCurrency(
                  Math.max(0, getCartAmount() - discountAmount) + delivery_fee
                )}
              </p>
            </div>
          </div>
        </div>


        <div className='w-full text-end mt-8'>
          <button onClick={() => window.reload} type='submit' className='bg-black text-white px-16 py-3 text-sm rounded-full'>Thanh toán</button>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder
