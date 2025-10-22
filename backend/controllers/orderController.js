import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import axios from "axios";
import CryptoJS from "crypto-js";
import moment from "moment";


//Đặt hàng ship COD
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    await userModel.findByIdAndUpdate(
      userId,
      { cartData: {} }
    );

    res.json({ success: true, message: "Đã đặt hàng" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
//Cấu hình ZaloPay
const config = {
  app_id: "2553",
  key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
  key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create"
};

//Đặt hàng thanh toán ZaloPay
const placeOrderZaloPay = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    // Tạo order data trước
    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "ZaloPay",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const embed_data = {
      redirecturl: `http://localhost:5173/payment-result?orderid=${newOrder._id}`,
      cancelurl: `http://localhost:5173/cancel-order?orderid=${newOrder._id}`,
      orderId: newOrder._id.toString()
    };

    const transID = Math.floor(Math.random() * 1000000);
    const order = {
      app_id: config.app_id,
      app_trans_id: `${moment().format('YYMMDD')}_${transID}`,
      app_user: userId,
      app_time: Date.now(),
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: amount,
      description: `Thanh toán đơn hàng #${newOrder._id}`,
      bank_code: "",
      callback_url: "http://localhost:4000/api/order/zalopay-callback"
    };

    // Tạo MAC
    const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    // Gửi request đến ZaloPay với URLSearchParams để format đúng
    const params = new URLSearchParams();
    for (const key in order) {
      params.append(key, order[key]);
    }

    const response = await axios.post(config.endpoint, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.data.return_code === 1) {
      // Cập nhật order với app_trans_id
      await orderModel.findByIdAndUpdate(newOrder._id, { 
        app_trans_id: order.app_trans_id 
      });

      // KHÔNG xóa giỏ hàng ở đây - chỉ xóa khi thanh toán thành công
      
      res.json({ 
        success: true, 
        message: "Tạo đơn hàng thành công",
        order_url: response.data.order_url,
        app_trans_id: order.app_trans_id,
        orderId: newOrder._id.toString()
      });
    } else {
      // Xóa order nếu tạo payment thất bại
      await orderModel.findByIdAndDelete(newOrder._id);
      res.json({ 
        success: false, 
        message: "Tạo thanh toán thất bại" 
      });
    }

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//Xử lý callback từ ZaloPay
const zaloPayCallback = async (req, res) => {
  try {
    const result = req.body;
    
    // Xác thực callback
    const dataStr = result.data;
    const reqMac = result.mac;
    
    const mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
    
    if (reqMac !== mac) {
      // Callback không hợp lệ
      return res.status(400).json({
        return_code: -1,
        return_message: "mac not equal"
      });
    }
    
    // Parse dữ liệu
    const dataJson = JSON.parse(dataStr);
    const embed_data = JSON.parse(dataJson.embed_data);
    
    console.log("ZaloPay callback received:", {
      app_trans_id: dataJson.app_trans_id,
      amount: dataJson.amount,
      orderId: embed_data.orderId,
      status: dataJson.status // Kiểm tra status từ ZaloPay
    });
    
    // CHỈ cập nhật đơn hàng khi status = 1 (thanh toán thành công)
    if (dataJson.status === 1) {
      // Cập nhật trạng thái thanh toán
      const updatedOrder = await orderModel.findByIdAndUpdate(
        embed_data.orderId,
        { 
          payment: true,
          status: "Order Placed"
        },
        { new: true }
      );
      
      if (updatedOrder) {
        // Xóa giỏ hàng khi thanh toán thành công
        await userModel.findByIdAndUpdate(updatedOrder.userId, { cartData: {} });
        
        console.log("Order updated successfully:", updatedOrder._id);
        res.json({
          return_code: 1,
          return_message: "success"
        });
      } else {
        console.log("Order not found:", embed_data.orderId);
        res.json({
          return_code: 0,
          return_message: "Order not found"
        });
      }
    } else {
      // Nếu status khác 1 (thất bại hoặc hủy), xóa đơn hàng
      console.log("Payment failed or cancelled, deleting order:", embed_data.orderId);
      await orderModel.findByIdAndDelete(embed_data.orderId);
      
      res.json({
        return_code: 1, // Vẫn trả về 1 để ZaloPay biết đã xử lý
        return_message: "Order cancelled due to payment failure"
      });
    }
    
  } catch (error) {
    console.log("ZaloPay callback error:", error);
    res.json({
      return_code: 0,
      return_message: error.message
    });
  }
};

//Kiểm tra trạng thái thanh toán ZaloPay
const checkZaloPayStatus = async (req, res) => {
  try {
    const { app_trans_id } = req.body;
    
    const postData = {
      app_id: config.app_id,
      app_trans_id: app_trans_id
    };
    
    const data = postData.app_id + "|" + postData.app_trans_id + "|" + config.key1;
    postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
    
    const response = await axios.post("https://sb-openapi.zalopay.vn/v2/query", null, {
      params: postData
    });
    
    res.json(response.data);
    
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//Dữ liệu đơn hàng ở trang admin
const allOrders = async (req, res) => {
  try {
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);

    // Lọc đơn hàng tương tự như userOrders
    const orders = await orderModel.find({
      $or: [
        { paymentMethod: "COD" }, // Tất cả đơn COD
        { paymentMethod: "ZaloPay", payment: true }, // ZaloPay đã thanh toán
        { paymentMethod: "ZaloPay", payment: false, date: { $gte: tenMinutesAgo } } // ZaloPay chưa thanh toán nhưng mới tạo
      ]
    });
    
    res.json({success:true,orders})
    
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//Dữ liệu người mua của đơn hàng ở Frontend
const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);

    // Lọc đơn hàng: 
    // - COD: hiển thị tất cả
    // - ZaloPay: chỉ hiển thị đã thanh toán HOẶC chưa thanh toán nhưng trong vòng 10 phút
    const orders = await orderModel.find({ 
      userId,
      $or: [
        { paymentMethod: "COD" }, // Tất cả đơn COD
        { paymentMethod: "ZaloPay", payment: true }, // ZaloPay đã thanh toán
        { paymentMethod: "ZaloPay", payment: false, date: { $gte: tenMinutesAgo } } // ZaloPay chưa thanh toán nhưng mới tạo
      ]
    });
    
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//Cập nhật trạng thái đơn hàng từ admin
const updateStatus = async (req, res) => {
  try {

    const { orderId, status } = req.body;

    await orderModel.findByIdAndUpdate(orderId, { status })
    res.json({success:true,message:'Cập nhật trạng thái'})
    
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message })
  }
};

//Hủy đơn hàng khi thanh toán ZaloPay thất bại
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    // Xóa đơn hàng khỏi database
    const deletedOrder = await orderModel.findByIdAndDelete(orderId);
    
    if (deletedOrder) {
      res.json({ 
        success: true, 
        message: "Đơn hàng đã được hủy" 
      });
    } else {
      res.json({ 
        success: false, 
        message: "Không tìm thấy đơn hàng" 
      });
    }
    
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//Tự động xóa đơn hàng ZaloPay chưa thanh toán sau 10 phút
const cleanupUnpaidOrders = async () => {
  try {
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000); // 10 phút trước
    
    // Tìm và xóa các đơn hàng ZaloPay chưa thanh toán sau 10 phút
    const unpaidOrders = await orderModel.find({
      paymentMethod: "ZaloPay",
      payment: false,
      date: { $lt: tenMinutesAgo }
    });
    
    if (unpaidOrders.length > 0) {
      const orderIds = unpaidOrders.map(order => order._id);
      await orderModel.deleteMany({ _id: { $in: orderIds } });
      console.log(`Cleaned up ${unpaidOrders.length} unpaid ZaloPay orders`);
    }
    
  } catch (error) {
    console.log("Error cleaning up unpaid orders:", error);
  }
};

// Xóa ngay các đơn hàng ZaloPay cũ chưa thanh toán (để chạy ngay lập tức)
const cleanupOldUnpaidOrders = async (req, res) => {
  try {
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    
    const result = await orderModel.deleteMany({
      paymentMethod: "ZaloPay",
      payment: false,
      date: { $lt: tenMinutesAgo }
    });
    
    res.json({ 
      success: true, 
      message: `Đã xóa ${result.deletedCount} đơn hàng chưa thanh toán`,
      deletedCount: result.deletedCount
    });
    
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Chạy cleanup mỗi 5 phút
setInterval(cleanupUnpaidOrders, 5 * 60 * 1000);

export { placeOrder, placeOrderZaloPay, allOrders, userOrders, updateStatus, zaloPayCallback, checkZaloPayStatus, cancelOrder, cleanupOldUnpaidOrders };
