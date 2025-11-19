import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import axios from 'axios'
import crypto from 'crypto'
import moment from "moment";
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import CryptoJS from 'crypto-js';

//Đặt hàng ship COD
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    // Kiểm tra còn hàng
    for (const item of items) {
      const product = await Product.findById(item._id)
      if (!product) {
        return res.json({ success: false, message: `Sản phẩm ${item.name} không tồn tại` })
      }

      const availableStock = product.stock.get(item.size) || 0
      if (availableStock < item.quantity) {
        return res.json({
          success: false,
          message: `Sản phẩm ${item.name} size ${item.size} chỉ còn ${availableStock} sản phẩm`
        })
      }
    }

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
      status: 'Đang chờ xác nhận', // Trạng thái đơn hàng mới
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    await userModel.findByIdAndUpdate(
      userId,
      { cartData: {} }
    );

    // Giảm tồn kho
    for (const item of items) {
      const product = await Product.findById(item._id)
      const currentStock = product.stock.get(item.size) || 0
      product.stock.set(item.size, Math.max(0, currentStock - item.quantity))

      // Kiểm tra size còn hàng
      const hasStock = Array.from(product.stock.values()).some(qty => qty > 0)
      product.isAvailable = hasStock

      await product.save()
    }

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
      status: 'Đang chờ xác nhận', // Trạng thái đơn hàng mới
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

    const dataStr = result.data;
    const reqMac = result.mac;
    const mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();

    if (reqMac !== mac) {
      return res.status(400).json({ return_code: -1, return_message: "mac not equal" });
    }

    const dataJson = JSON.parse(dataStr);
    const embed_data = JSON.parse(dataJson.embed_data);

    const statusNum = Number(dataJson.status);

    if (statusNum === 1) {
      const updatedOrder = await orderModel.findByIdAndUpdate(
        embed_data.orderId,
        { payment: true, status: "Đã đặt hàng" },
        { new: true }
      );

      if (updatedOrder) {
        // 🔥 XÓA GIỎ HÀNG NGAY TẠI BACKEND
        await userModel.findByIdAndUpdate(updatedOrder.userId, { cartData: {} });

        return res.json({ return_code: 1, return_message: "success" });
      }
    } else {
      // Thanh toán thất bại hoặc hủy
      await orderModel.findByIdAndDelete(embed_data.orderId);
      console.log(`[ZaloPay] payment failed/cancelled — order deleted: ${embed_data.orderId}`);
      return res.json({ return_code: 1, return_message: "Order cancelled due to payment failure" });
    }

  } catch (error) {
    console.log("ZaloPay callback error:", error);
    return res.json({ return_code: 0, return_message: error.message });
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

    res.json({ success: true, orders })

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
    res.json({ success: true, message: 'Cập nhật trạng thái' })

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message })
  }
};

//Hủy đơn hàng khi thanh toán ZaloPay thất bại
export const cancelOrder = async (req, res) => {
  try {
    const { orderId, orderid } = req.body;
    const id = orderId || orderid;
    if (!id) return res.status(400).json({ success: false, message: 'orderId required' });

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // ownership check if you want to keep it — otherwise skip if project allows it
    const userIdFromToken = req.user?.id || req.user?._id || null;
    if (userIdFromToken && order.user && order.user.toString() !== userIdFromToken.toString()) {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }

    // only cancellable while waiting for admin confirmation
    if (order.status !== 'Đang chờ xác nhận') {
      return res.status(400).json({ success: false, message: 'Cannot cancel — already confirmed or processed' });
    }

    // restock items (best-effort)
    try {
      for (const it of order.items || []) {
        const pid = it.productId || it.product;
        const qty = Number(it.quantity || it.qty || 1);
        if (!pid || !qty) continue;

        const prod = await Product.findById(pid);
        if (!prod) continue;

        if (typeof prod.countInStock === 'number') prod.countInStock += qty;
        else if (typeof prod.stock === 'number') prod.stock += qty;
        else if (typeof prod.quantity === 'number') prod.quantity += qty;
        else prod.available = (prod.available || 0) + qty;

        // adapt size-specific logic here if needed
        await prod.save();
      }
    } catch (restockErr) {
      console.error('Restock error during cancel:', restockErr);
      // continue to deletion even if restock partial failure
    }

    // delete order document so admin list no longer shows it
    await Order.findByIdAndDelete(id);

    return res.json({ success: true, orderId: id, message: 'Order cancelled and removed' });
  } catch (err) {
    console.error('cancelOrder error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// helper: query ZaloPay v2/query
const queryZaloPay = async (app_trans_id) => {
  try {
    const postData = {
      app_id: config.app_id,
      app_trans_id
    }
    const data = `${postData.app_id}|${postData.app_trans_id}|${config.key1}`
    const mac = crypto.createHmac('sha256', config.key1).update(data).digest('hex')

    const resp = await axios.post('https://sb-openapi.zalopay.vn/v2/query', null, {
      params: { app_id: postData.app_id, app_trans_id: postData.app_trans_id, mac }
    })

    return resp.data
  } catch (err) {
    console.error('[ZaloPay] query error', err?.response?.data || err.message)
    return null
  }
}

// safer cleanup: re-check and confirm with ZaloPay; do NOT delete if ZaloPay query fails
const cleanupUnpaidOrders = async () => {
  try {
    const cutoff = Date.now() - (1 * 60 * 1000) // testing window
    const candidates = await orderModel.find({
      paymentMethod: 'ZaloPay',
      $or: [{ payment: false }, { payment: { $exists: false } }, { payment: null }],
      date: { $lt: cutoff }
    }).lean()

    if (!candidates || candidates.length === 0) return

    for (const c of candidates) {
      const fresh = await orderModel.findById(c._id).lean()
      if (!fresh) { console.log(`[CLEANUP] already removed: ${c._id}`); continue }

      console.log(`[CLEANUP] checking ${c._id} payment=${JSON.stringify(fresh.payment)} status=${String(fresh.status)} app_trans_id=${fresh.app_trans_id}`)

      // quick local check for obvious paid markers
      const paidValues = [true, 'true', 1, '1', 'paid', 'success']
      const localPaid = paidValues.includes(fresh.payment) || paidValues.includes(String(fresh.status)) || String(fresh.payment) === '1' || String(fresh.status) === '1'
      if (localPaid) {
        console.log(`[CLEANUP] SKIP (local paid) ${c._id}`)
        continue
      }

      let shouldDelete = false

      if (fresh.app_trans_id) {
        const zp = await queryZaloPay(fresh.app_trans_id)
        if (!zp) {
          // cannot confirm with ZaloPay — skip deletion to be safe
          console.warn(`[CLEANUP] ZaloPay query returned null for ${c._id} — SKIP deletion`)
          continue
        }

        const zpStatus = (zp.data && zp.data.status) ?? zp.trans_status ?? null

        // If ZaloPay explicitly says "no transaction" (return_code === 3), treat as cancel -> delete
        if (zp.return_code === 3) {
          console.log(`[CLEANUP] ZaloPay query for ${c._id} returned no transaction (return_code=3) — will delete`)
          shouldDelete = true
        } else if (zp.return_code !== 1 || zpStatus === null) {
          // other non-success responses (transient/unexpected) -> skip to be safe
          console.warn(`[CLEANUP] ZaloPay query for ${c._id} returned no status (return_code=${zp.return_code}) — SKIP deletion`)
          continue
        }

        // explicit success -> mark paid and skip
        if (Number(zpStatus) === 1) {
          console.log(`[CLEANUP] ZaloPay reports PAID for ${c._id} (zpStatus=${zpStatus}) — updating & skipping`)
          await orderModel.findByIdAndUpdate(c._id, { payment: true, status: 'Đã đặt hàng' })
          continue
        }

        // explicit failure/cancel codes (negative values like -49) -> allow deletion
        if (Number(zpStatus) < 0) {
          console.log(`[CLEANUP] ZaloPay reports FAILED for ${c._id} (zpStatus=${zpStatus}) — will delete`)
          shouldDelete = true
        } else if (!shouldDelete) {
          console.warn(`[CLEANUP] ZaloPay returned non-success non-failure status for ${c._id} (zpStatus=${zpStatus}) — SKIP deletion`)
          continue
        }
      } else {
        // no app_trans_id: rely on DB fields only (delete only if still unpaid)
        const latest = await orderModel.findById(c._id).lean()
        if (!latest) { console.log(`[CLEANUP] already removed before final check: ${c._id}`); continue }
        const latestPaid = paidValues.includes(latest.payment) || paidValues.includes(String(latest.status)) || String(latest.payment) === '1' || String(latest.status) === '1'
        if (latestPaid) {
          console.log(`[CLEANUP] SKIP (latest paid) ${c._id}`)
          continue
        }
        // no external confirmation available — treat as cancellable (existing behavior)
        shouldDelete = true
      }

      if (shouldDelete) {
        try {
          await orderModel.findByIdAndDelete(c._id)
          console.log(`[CLEANUP] deleted unpaid/cancelled ZaloPay order ${c._id}`)
        } catch (delErr) {
          console.error(`[CLEANUP] failed to delete ${c._id}:`, delErr)
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning up unpaid orders:', error)
  }
};

// add a route-friendly wrapper so routes importing cleanupOldUnpaidOrders work
const cleanupOldUnpaidOrders = async (req, res) => {
  try {
    await cleanupUnpaidOrders(); // call internal non-route cleanup
    return res.json({ success: true, message: 'Cleanup triggered' });
  } catch (err) {
    console.error('cleanupOldUnpaidOrders handler error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// run interval
setInterval(cleanupUnpaidOrders, 1 * 60 * 1000);

// Delete order by ID
const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ success: false, message: 'orderId required' });

    const order = await orderModel.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    await orderModel.findByIdAndDelete(orderId);
    console.log(`[ORDER] deleted order ${orderId}`);
    return res.json({ success: true, message: 'Order deleted' });
  } catch (err) {
    console.error('deleteOrder error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export {
  placeOrder,
  placeOrderZaloPay,
  allOrders,
  userOrders,
  updateStatus,
  zaloPayCallback,
  checkZaloPayStatus,
  cleanupUnpaidOrders,
  cleanupOldUnpaidOrders,
  deleteOrder
};