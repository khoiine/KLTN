import React from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'

const Sidebar = () => {
    const { unreadCount } = useContext(AdminContext)

    return (
        <div className='w-[18%] min-h-screen border-r-2'>
            <div className='flex flex-col gap-4 pt-6 pl-[20%] text-[15px]'>
                <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to="/dashboard">
                    <img className='w-5 h-5' src={assets.dashboard_icon} alt='' />
                    <p className='hidden md:block'>Dashboard</p>
                </NavLink>

                <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to="/chat">
                    <img className='w-5 h-5' src={assets.messenger_icon} alt="" />
                    <p className='hidden md:block'>Trò chuyện</p>
                    {unreadCount > 0 && (
                        <span className='bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-xl'>
                            {unreadCount}
                        </span>
                    )}
                </NavLink>


                <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to="/add">
                    <img className='w-5 h-5' src={assets.add_icon} alt='' />
                    <p className='hidden md:block'>Thêm sản phẩm</p>
                </NavLink>

                <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to="/list">
                    <img className='w-5 h-5' src={assets.order_icon} alt='' />
                    <p className='hidden md:block'>Quản lý sản phẩm</p>
                </NavLink>

                <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to="/categories">
                    <img className='w-5 h-5' src={assets.order_icon} alt='' />
                    <p className='hidden md:block'>Quản lý danh mục</p>
                </NavLink>

                <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to="/subcategories">
                    <img className='w-5 h-5' src={assets.order_icon} alt='' />
                    <p className='hidden md:block'>Quản lý loại sản phẩm</p>
                </NavLink>

                <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to="/users">
                    <img className='w-5 h-5' src={assets.order_icon} alt='' />
                    <p className='hidden md:block'>Quản lý người dùng</p>
                </NavLink>

                <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to="/orders">
                    <img className='w-5 h-5' src={assets.order_icon} alt='' />
                    <p className='hidden md:block'>Quản lý đơn hàng</p>
                </NavLink>

                <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to="/reviews">
                    <img className='w-5 h-5' src={assets.order_icon} alt='' />
                    <p className='hidden md:block'>Quản lý đánh giá</p>
                </NavLink>

                <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to="/blogs">
                    <img className='w-5 h-5' src={assets.order_icon} alt='' />
                    <p className='hidden md:block'>Quản lý Blog</p>
                </NavLink>
            </div>
        </div>
    )
}

export default Sidebar