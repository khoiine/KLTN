import { assets } from '../assets/assets'
import { Link, NavLink } from 'react-router-dom'

const Footer = () => {
  return (
    <div>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

        <div>
          <img src={assets.logo} className='mb-5 w-36' alt="" />
          <p className=' w-full md:w-2/3 text-gray-600'>
            Cảm ơn bạn đã ghé thăm cửa hàng thời trang của chúng tôi! Chúng tôi luôn sẵn sàng hỗ trợ bạn trong hành trình khám phá phong cách. Nếu bạn có bất kỳ câu hỏi nào về sản phẩm, đơn hàng hoặc dịch vụ, đừng ngần ngại liên hệ với chúng tôi.            </p>
        </div>

        <div>
          <p className='text-xl font-medium mb-5'>CHÍNH SÁCH</p>
          <ul className='flex flex-col gap-1 text-gray-600'>
            <NavLink to='/'>
              <li>Trang chủ</li>
            </NavLink>
            <NavLink to='/about'>
              <li>Về bản thân</li>
            </NavLink>
            <NavLink to='/contact'>
              <li>Liên hệ</li>
            </NavLink>
          </ul>
        </div>

        <div>
          <p className='text-xl font-medium mb-5'>LIÊN HỆ</p>
          <ul className='flex flex-col gap-1 text-gray-600'>
            <li>0904.512.575</li>
            <li>hualekhoi11212@gmail.com</li>
          </ul>
        </div>

      </div>
      <div>
        <hr />
        <p className='py-5 text-sm text-center'>Copyright 2025@ LKFashionStore.com</p>
      </div>
    </div>
  )
}

export default Footer
