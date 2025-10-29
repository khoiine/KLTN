import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";
import axios from 'axios'
import { toast } from 'react-toastify'
import { formatVND } from "../App";

const Cart = () => {
  const { products, cartItems, updateQuantity, navigate, token, setCartItems, getCartCount, backendUrl } = useContext(ShopContext);

  const [cartData, setCartData] = useState([]);

  const clearCart = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) return;

    try {
      // Xóa ở frontend
      setCartItems({})

      // Xóa ở backend nếu user đăng nhập
      if (token) {
        const response = await axios.post(backendUrl + '/api/cart/clear', {}, {
          headers: { token }
        })

        if (response.data.success) {
          toast.success('Đã xóa toàn bộ giỏ hàng')
        } else {
          toast.error(response.data.message)
        }
      } else {
        toast.success('Đã xóa toàn bộ giỏ hàng')
      }
    } catch (error) {
      console.error('clearCart error:', error)
      toast.error('Xóa giỏ hàng thất bại')
    }
  }

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({
              _id: items,
              size: item,
              quantity: cartItems[items][item],
            });
          }
        }
      }
      setCartData(tempData);
    }
  }, [cartItems, products]);

  return (
    <div className="border-t pt-14">
      <div className=" text-2xl mb-3">
        <Title text1={"Giỏ hàng"} text2={"của bạn"} />
      </div>



      <div>
        {cartData.map((item, index) => {
          const productData = products.find(
            (product) => product._id === item._id
          );

          return (
            <div
              key={index}
              className="py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
            >
              <div className="flex items-start gap-6">
                <img
                  className="w-16 sm:w-20"
                  src={productData.image[0]}
                  alt=""
                />
                <div>
                  <p className="text-sm sm:text-lg font-medium">
                    {productData.name}
                  </p>
                  <div className="flex items-center gap-5 mt-2">
                    <p>
                      {formatVND(productData.price)}
                    </p>
                    <p className="px-2 sm:px-3 sm:py-1 border bg-slate-50 rounded-2xl">
                      {item.size}
                    </p>
                  </div>
                </div>
              </div>

              {/* Nút tăng giảm số lượng sản phẩm */}
              <div className='flex items-center border border-gray-300 w-max'>
                <button
                  onClick={() => updateQuantity(item._id, item.size, item.quantity - 1)}
                  className='border-none text-xl font-bold px-3 py-1 bg-white-100 hover:bg-white-200 rounded'
                >
                  -
                </button>
                <input
                  onChange={(e) => e.target.value === '' || e.target.value === '0' ? null : updateQuantity(item._id, item.size, Number(e.target.value))}
                  className='border-none text-l max-w-16 text-center px-2 py-1 rounded'
                  type="numeric"
                  readOnly
                  min={1}
                  value={item.quantity} />
                <button
                  onClick={() => updateQuantity(item._id, item.size, item.quantity + 1)}
                  className='border-none text-xl font-bold px-3 py-1 bg-white-100 hover:bg-white-200 rounded'
                >
                  +
                </button>
              </div>

              <img
                onClick={() => updateQuantity(item._id, item.size, 0)}
                className="w-4 mr-4 sm:w-5 cursor-pointer"
                src={assets.bin_icon}
                alt=""
              />
            </div>
          );
        })}
      </div>
      {getCartCount() > 0 && (
        <div className="flex justify-end my-20">
          <div className="w-full sm:w-[450px]">
            <CartTotal />
            <div className="w-full text-end">
              <button
                onClick={clearCart}
                className="bg-black mr-5 text-white text-base my-8 px-8 py-3 rounded-3xl"
              >
                Xóa giỏ hàng
              </button>
              <button
                onClick={() => navigate("/place-order")}
                className="bg-black text-white text-base my-8 px-8 py-3 rounded-3xl"
              >
                Thanh toán
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
