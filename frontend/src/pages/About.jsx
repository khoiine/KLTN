import React from 'react'
import Title from './../components/Title';
import { assets } from '../assets/assets';
import NewsletterBox from './../components/NewsletterBox';

const About = () => {
  return (
    <div>  

      <div className='text-2xl text-center pt-8 border-t'>
        <Title text2={'Về bản thân'}/>
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img className='w-full md:max-w-[450px]' src={assets.about_img} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
          <p>Chào mừng bạn đến với cửa hàng thời trang của chúng tôi! Chúng tôi được thành lập với sứ mệnh mang đến cho bạn những sản phẩm thời trang chất lượng, phong cách và phù hợp với nhu cầu đa dạng của từng khách hàng.</p>
          <b className='text-gray-800'>Sứ mệnh của chúng tôi</b>
          <p>Sứ mệnh của chúng tôi là giúp bạn thể hiện bản thân qua những bộ trang phục tinh tế và ấn tượng. Chúng tôi tin rằng thời trang không chỉ là về vẻ bề ngoài, mà còn là một phần quan trọng trong việc thể hiện cá tính và phong cách sống.</p>
        </div>
      </div>
      <div className='text-4xl py-4'>
        <Title text1={'Lý do'} text2={'Chọn chúng tôi'}/>
      </div>

      <div className='flex flex-col md:flex-row text-sm mb-20'>
        <div className='border px-10 md:px16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Đảm bảo chất lượng:</b>
          <p className='text-gray-600'>Tất cả sản phẩm của chúng tôi được lựa chọn kỹ lưỡng từ nguyên liệu cao cấp, đảm bảo sự thoải mái và bền bỉ trong mỗi lần sử dụng.</p>
        </div>
        <div className='border px-10 md:px16 py-8 sm:py-20 flex flex-col gap-5'>
          <b className='text-gray-600'>Sự tiện lợi:</b>
          <p>Với trang web thân thiện, bạn có thể dễ dàng duyệt và đặt hàng chỉ trong vài cú nhấp chuột, tiết kiệm thời gian và công sức.</p>
        </div>
        <div className='border px-10 md:px16 py-8 sm:py-20 flex flex-col gap-5'>
          <b className='text-gray-600'>Dịch vụ khách hàng:</b>
          <p>Đội ngũ nhân viên của chúng tôi luôn sẵn sàng hỗ trợ và tư vấn tận tình, đảm bảo bạn có trải nghiệm mua sắm thoải mái và hài lòng nhất.</p>
        </div>
      </div>
      <NewsletterBox/>
    </div>
  )
}

export default About
