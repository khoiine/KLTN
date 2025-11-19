import { useContext, useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { backendUrl, token, refreshCart } = useContext(ShopContext);
  const [isChecking, setIsChecking] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => { isMounted.current = false; }
  }, []);

  useEffect(() => {
    const handlePaymentResult = async () => {
      try {
        const orderId = searchParams.get('orderid');
        const status = searchParams.get('status'); // ZaloPay trả về status trong URL
        const appTransId = searchParams.get('apptransid');

        if (!orderId) {
          toast.error('Không tìm thấy thông tin đơn hàng');
          navigate('/cart');
          return;
        }

        // Kiểm tra status trong URL trước
        if (status) {
          if (status === '1') {
            // Thanh toán thành công
            await refreshCart();
            if (!isMounted.current) return;
            toast.success('Thanh toán thành công!');
            navigate('/orders');
            return;
          } else {
            // Hủy hoặc thất bại
            toast.error('Thanh toán thất bại hoặc đã hủy!');
            navigate('/cart');
            return;
          }
        }

        // Nếu không có status trong URL, gọi backend kiểm tra ZaloPay
        if (appTransId) {
          const checkZaloPayStatus = async () => {
            try {
              const response = await axios.post(
                `${backendUrl}/api/order/zalopay-status`,
                { app_trans_id: appTransId },
                { headers: { token } }
              );

              console.log('ZaloPay status check:', response.data);

              if (status === '1') {
                // Thanh toán thành công -> backend đã xóa cart
                await refreshCart();
                if (!isMounted.current) return;
                toast.success('Thanh toán thành công!');
                navigate('/orders');
              } else if (response.data.return_code === 2) {
                // Đang xử lý -> poll lại sau 3s
                setTimeout(() => { if (isMounted.current) checkZaloPayStatus(); }, 3000);
              } else {
                // Thất bại hoặc hủy -> chỉ xóa order, không xóa cart
                try {
                  await axios.post(
                    `${backendUrl}/api/order/cancel`,
                    { orderId },
                    { headers: { token } }
                  );
                } catch (cancelError) {
                  console.log('Error cancelling order:', cancelError);
                }
                toast.error('Thanh toán thất bại hoặc đã hủy!');
                navigate('/cart');
              }
            } catch (error) {
              console.log('Error checking payment status:', error);
              toast.error('Không thể kiểm tra trạng thái thanh toán');
              navigate('/cart');
            } finally {
              if (isMounted.current) setIsChecking(false);
            }
          };

          checkZaloPayStatus();
        } else {
          // Không có thông tin thanh toán
          toast.error('Không có thông tin thanh toán');
          navigate('/cart');
          setIsChecking(false);
        }

      } catch (error) {
        console.log('Payment result error:', error);
        toast.error('Có lỗi xảy ra khi xử lý kết quả thanh toán');
        navigate('/cart');
        setIsChecking(false);
      }
    };

    handlePaymentResult();
  }, [searchParams, backendUrl, token, navigate, refreshCart]);

  if (isChecking) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg">Đang kiểm tra trạng thái thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="text-center">
        <p className="text-lg">Đang xử lý kết quả thanh toán...</p>
      </div>
    </div>
  );
};

export default PaymentResult;
