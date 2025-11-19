import { useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { formatCurrency } from "../../../admin/src/App";

const Orders = () => {
  const { backendUrl, token } = useContext(ShopContext);

  const [orders, setOrders] = useState([]);
  const [cancelling, setCancelling] = useState(null);

  // Load tất cả đơn hàng
  const loadOrders = useCallback(async () => {
    if (!token) return;

    try {
      const res = await axios.post(
        backendUrl + "/api/order/userorders",
        {},
        { headers: { token } }
      );

      if (res.data.success) {
        setOrders(res.data.orders.reverse());
      }
    } catch (err) {
      console.error(err);
    }
  }, [backendUrl, token]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // format dd/mm/yyyy
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return (
      String(d.getDate()).padStart(2, "0") +
      "/" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "/" +
      d.getFullYear()
    );
  };

  // Cancel
  const cancelOrder = async (orderId) => {
    if (!window.confirm("Bạn chắc muốn hủy đơn này?")) return;

    try {
      setCancelling(orderId);

      const res = await axios.post(
        backendUrl + "/api/order/cancel",
        { orderId },
        { headers: { token } }
      );

      if (res.data.success) loadOrders();
      else alert(res.data.message);
    } catch (err) {
      alert(err.message);
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1="Đơn hàng" text2="của tôi" />
      </div>

      <div>
        {orders.map((order) => (
          <div
            key={order._id}
            className="py-4 border-t text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div className="flex items-start gap-6 text-sm">
              {/* Ảnh sản phẩm đầu tiên */}
              <img
                className="w-16 sm:w-20"
                src={order.items[0].image[0]}
                alt=""
              />

              <div>
                {/* Tên sản phẩm */}
                <p className="sm:text-base font-medium">
                  {order.items[0].name}
                </p>

                {/* Giá sản phẩm */}
                <div className="flex items-center gap-3 mt-2 text-base text-gray-700">
                  <p className="text-lg">
                    {formatCurrency(order.amount)}
                  </p>

                  <p>Số lượng: {order.items[0].quantity}</p>

                  <p>Size: {order.items[0].size}</p>
                </div>

                {/* Ngày đặt */}
                <p className="mt-2">
                  Ngày:{" "}
                  <span className="text-gray-400">{formatDate(order.date)}</span>
                </p>

                {/* Thanh toán */}
                <p className="mt-2">
                  Thanh toán:{" "}
                  <span className="text-gray-400">
                    {order.paymentMethod}
                  </span>
                </p>
              </div>
            </div>

            {/* Nút */}
            <div className="md:w-1/2 flex justify-between">
              <div className="flex items-center gap-2">
                <p className="min-w-2 h-2 rounded-full bg-green-500"></p>
                <p className="text-sm md:text-base">{order.status}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadOrders}
                  className="border px-4 py-2 text-sm font-medium rounded-sm"
                >
                  Theo dõi đơn hàng
                </button>

                {order.status === "Đang chờ xác nhận" && (
                  <button
                    disabled={cancelling === order._id}
                    onClick={() => cancelOrder(order._id)}
                    className="border px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-sm"
                  >
                    {cancelling === order._id ? "Đang hủy..." : "Hủy đơn"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
