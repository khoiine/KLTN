import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import Navbar from '../components/Navbar';
import { formatVND } from '../App';

const CartTotal = () => {

    const { delivery_fee, getCartAmount} = useContext(ShopContext);

  return (
    <div className='w-full'>
    <div className='text-2xl'>
        <Title text2={'Tổng đơn hàng'}/>
    </div>
      
      <div className=' flex flex-col gap-2 mt-2 text-sm'>
        <div className='flex justify-between'>
            <p>Tổng</p>
            <p>{formatVND(getCartAmount())}</p>
        </div>
        <hr />
        <div className='flex justify-between'>
            <p>Phí vận chuyển</p>
            <p>{formatVND(delivery_fee)}</p>
        </div>
        <hr />
        <div className='flex justify-between'>
            <b>Tổng hoá đơn</b>
            <b>{formatVND(getCartAmount() === 0 ? 0 : getCartAmount() + delivery_fee)}</b>
        </div>
      </div>
    </div>
  )
}

export default CartTotal
