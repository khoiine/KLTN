import express from "express";
import {
  placeOrder,
  placeOrderZaloPay,
  allOrders,
  userOrders,
  updateStatus,
  zaloPayCallback,
  checkZaloPayStatus,
  cancelOrder,
  cleanupOldUnpaidOrders,
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";
import logZaloPayCallback from "../middleware/logZaloPayCallback.js";

const orderRouter = express.Router();

//Tính năng admin
orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, updateStatus);
orderRouter.post("/cleanup", adminAuth, cleanupOldUnpaidOrders); // API để xóa đơn hàng cũ

//Tính năng thanh toán
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/zalopay", authUser, placeOrderZaloPay);

//ZaloPay callback và kiểm tra trạng thái
orderRouter.post("/zalopay-callback", logZaloPayCallback, zaloPayCallback);
orderRouter.get("/zalopay-callback", logZaloPayCallback, zaloPayCallback); // Thêm GET method để test
orderRouter.post("/zalopay-status", authUser, checkZaloPayStatus);
orderRouter.post("/cancel", authUser, cancelOrder);

//Tính năng người dùng
orderRouter.post("/userorders", authUser, userOrders);

export default orderRouter;
