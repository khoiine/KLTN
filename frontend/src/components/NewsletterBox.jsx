import React, { useState } from 'react'

const NewsletterBox = () => {
    const [showAlert, setShowAlert] = useState(false);

    const onSubmitHandler = (e) => {
        e.preventDefault();
        setShowAlert(true);
        setTimeout(() => {
            setShowAlert(false);
        }, 3000); // Alert biến mất sau 3 giây
    }

  return (
    <div className='text-center relative'>
      {showAlert && (
        <div className='fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-8 py-4 rounded-lg shadow-lg z-50 animate-fade-in'>
          <div className='flex items-center gap-3'>
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7'></path>
            </svg>
            <p className='font-medium'>Cảm ơn bạn đã đăng ký! Chúng tôi sẽ thông báo sớm nhất có thể.</p>
          </div>
        </div>
      )}
      
      <p className='text-2xl font-medium text-gray-800'>Đăng ký ngay và nhận khuyến mãi 20%</p>
      <p className='text-gray-400 mt-3'>
      Khi bạn đăng ký, bạn sẽ được cập nhật thông tin về các chương trình giảm giá, bộ sưu tập mới nhất và các sự kiện độc quyền chỉ dành cho thành viên. Đây là cách tuyệt vời để bạn trở thành người đầu tiên biết đến những món đồ hot và không bỏ lỡ cơ hội sở hữu sản phẩm yêu thích với giá ưu đãi.      </p>
      <form onSubmit={onSubmitHandler} className='w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3'>
        <input className='w-full sm:flex-1 outline-none' type="email" placeholder='Nhập email để đăng ký nhận voucher' required/>
        <button type='submit' className='bg-black text-white text-xs px-10 py-4'>Đăng ký</button>
      </form>
    </div>
  )
}

export default NewsletterBox