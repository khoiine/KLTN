import express from "express";
import {
  addProduct,
  listProduct,
  removeProduct,
  singleProduct,
  editProduct,
  updateProductStock,
  checkStock,
  reduceStock,
  getLowStockProducts
} from "../controllers/productController.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const productRouter = express.Router();

productRouter.post(
  "/add",
  adminAuth,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  addProduct
);
productRouter.post("/remove", adminAuth, removeProduct);
productRouter.post('/edit', adminAuth, upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 }
]), editProduct)
productRouter.post("/single", singleProduct);
productRouter.get("/list", listProduct);
productRouter.post('/update-stock', adminAuth, updateProductStock);
productRouter.post('/check-stock', checkStock);
productRouter.post('/reduce-stock', adminAuth, reduceStock);
productRouter.get('/low-stock', adminAuth, getLowStockProducts);

export default productRouter;
