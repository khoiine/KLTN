import React, { useContext } from 'react'
import {assets} from '../assets/assets'
import { Link, NavLink } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';

const Navbar = () => {
    
    const[visible, setVisible] = React.useState(false);
    const {setShowSearch, getCartCount, navigate, token, setToken, setCartItems, isAdmin, setIsAdmin} = useContext(ShopContext);
    
    const logout = () => {
        navigate('/login')
        localStorage.removeItem('token')
        setToken('')
        setCartItems({})
        setIsAdmin(false)
    }

    const goToAdmin = () => {
        // Chuyển hướng đến trang admin với token
        const adminUrl = `http://localhost:5174?token=${token}`;
        window.open(adminUrl, '_blank');
    }

  return (
    <div className='flex items-center justify-between py-5 font-medium'>
      
        <Link to='/'><img src={assets.logo} className='w-36' alt="" /></Link>

        <ul className='hidden sm:flex gap-5 text-sm text-gray-700'>
            <NavLink to='/' className='flex flex-col items-center gap-1'>
                <p>Trang Chủ</p>
                <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
            </NavLink>
            <NavLink to='/collection' className='flex flex-col items-center gap-1'>
                <p>Bộ Sưu Tập</p>
                <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
            </NavLink>
            <NavLink to='/about' className='flex flex-col items-center gap-1'>
                <p>Về Bản Thân</p>
                <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
            </NavLink>
            <NavLink to='/contact' className='flex flex-col items-center gap-1'>
                <p>Liên Hệ</p>
                <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
            </NavLink>
            
        </ul>
        <div className='flex item-center gap-6'>
            <img onClick={()=>setShowSearch(true)} src={assets.search_icon} className='w-5 cursor-pointer' alt="" />

            <div className='group relative'>
                <img onClick={()=> token ? null : navigate('/login')} src={assets.profile_icon} className='w-5 cursor-pointer' alt="" />
                {/* Dropdown Menu */}
                {token &&
                <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-4'>
                    <div className='flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded'>
                        <p onClick={()=>navigate('/profile')} className='cursor-pointer hover:text-black'>Thông tin cá nhân</p>
                        <p onClick={()=>navigate('/orders')} className='cursor-pointer hover:text-black'>Đơn hàng</p>
                        {isAdmin && 
                            <p onClick={goToAdmin} className='cursor-pointer hover:text-black font-bold text-blue-600'>Quản lý</p>
                        }
                        <p onClick={logout} className='cursor-pointer hover:text-black'>Đăng xuất</p>
                    </div>
                </div>}
            </div>
            <Link to='/cart' className='relative'>
                <img src={assets.cart_icon} className='w-5 min-w-5' alt="" />
                <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]'>{getCartCount()}</p>
            </Link>
            <img onClick={()=>setVisible(true) } src={assets.menu_icon} className='w-5 cursor-pointer sm:hidden' alt="" />
        </div>

        {/* Sidebar Menu  */}
        <div className={` absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${visible ? 'w-full' :'w-0'}`}>
            <div className='flex flex-col text-gray-600'>
                <div onClick={()=>setVisible(false)} className='flex items-center gap-4 p-3 cursor-pointer'>
                    <img src={assets.dropdown_icon} className='h-4 rotate-180' alt="" />
                    <p>Quay Về</p>
                </div>
                <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/' >Trang Chủ</NavLink>
                <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/collection' >Bộ Sưu Tập</NavLink>
                <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/about' >Về Bản Thân</NavLink>
                <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/contact' >Liên Hệ</NavLink>

            </div>
        </div>

    </div>
  )
}

export default Navbar
