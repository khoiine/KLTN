import { v2 as cloudinary } from 'cloudinary';
import productModel from '../models/productModel.js';

//function for add product
const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, sizes, bestseller, stock } = req.body;

        const image1 = req.files.image1 && req.files.image1[0];
        const image2 = req.files.image2 && req.files.image2[0];
        const image3 = req.files.image3 && req.files.image3[0];
        const image4 = req.files.image4 && req.files.image4[0];

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

        let imagesUrl = await Promise.all(
            images.map(async (image) => {
                let result = await cloudinary.uploader.upload(image.path, { resource_type: 'image' });
                return result.secure_url;
            })
        )

        const stockData = stock ? JSON.parse(stock) : {}
        console.log('Received stock data:', stockData)

        //Dữ liệu tồn kho
        const stockMap = new Map()
        Object.entries(stockData).forEach(([size, quantity]) => {
            stockMap.set(size, Number(quantity))
        })

        console.log('Stock Map:', Array.from(stockMap.entries()))

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === 'true' ? true : false,
            sizes: JSON.parse(sizes),
            image: imagesUrl,
            date: Date.now(),
            stock: stockMap,
            isAvailable: true
        }
        console.log('Product data before save:', productData)

        const product = new productModel(productData);
        await product.save();


        res.json({ success: true, message: "Thêm sản phẩm thành công" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Update product stock
const updateProductStock = async (req, res) => {
    try {
        const { id, stock } = req.body

        console.log('Updating stock for product:', id)
        console.log('New stock data:', stock)

        const product = await productModel.findById(id)
        if (!product) {
            return res.json({ success: false, message: "Product not found" })
        }

        // Create new Map from stock object
        const stockMap = new Map()
        Object.entries(stock).forEach(([size, quantity]) => {
            stockMap.set(size, Number(quantity))
        })

        // Clear existing stock and set new values
        product.stock = new Map(Object.entries(stock))

        // Check if any size is available
        const hasStock = Object.values(stock).some(qty => Number(qty) > 0)
        product.isAvailable = hasStock

        await product.save()

        console.log('Stock updated successfully')

        // Return formatted product
        const productObj = product.toObject();
        const stockObj = {};

        if (productObj.stock instanceof Map) {
            productObj.stock.forEach((value, key) => {
                stockObj[key] = Number(value);
            });
        } else {
            Object.entries(productObj.stock).forEach(([key, value]) => {
                stockObj[key] = Number(value);
            });
        }

        productObj.stock = stockObj;

        res.json({ success: true, message: "Stock updated successfully", product: productObj })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Kiểm tra tồn kho
const checkStock = async (req, res) => {
    try {
        const { productId, size, quantity } = req.body

        const product = await productModel.findById(productId)
        if (!product) {
            return res.json({ success: false, message: "Product not found" })
        }

        const availableStock = product.stock.get(size) || 0

        if (availableStock < quantity) {
            return res.json({
                success: false,
                message: `Chỉ còn ${availableStock} sản phẩm size ${size}`,
                availableStock
            })
        }

        res.json({ success: true, availableStock })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Giảm lượng hàng sau khi đặt hàng
const reduceStock = async (req, res) => {
    try {
        for (const item of items) {
            const product = await productModel.findById(item.productId)
            if (!product) continue

            const currentStock = product.stock.get(item.size) || 0
            const newStock = Math.max(0, currentStock - item.quantity)
            product.stock.set(item.size, newStock)
                ``
            // Check if any size still has stock
            const stockValues = Array.from(product.stock.values())
            const hasStock = stockValues.some(qty => qty > 0)
            product.isAvailable = hasStock

            await product.save()
        }
    } catch (error) {
        console.log('Error reducing stock:', error)
    }
}

// Lấy danh sách sản phẩm sắp hết hàng
const getLowStockProducts = async (req, res) => {
    try {
        const products = await productModel.find()

        const lowStockProducts = products.filter(product => {
            if (!product.stock) return false
            const stockValues = Array.from(product.stock.values())
            return stockValues.some(qty => qty > 0 && qty <= 10)
        })

        // Format products
        const formattedProducts = lowStockProducts.map(product => {
            const productObj = product.toObject();

            if (productObj.stock) {
                const stockObj = {};

                if (productObj.stock instanceof Map) {
                    productObj.stock.forEach((value, key) => {
                        stockObj[key] = Number(value);
                    });
                } else {
                    Object.entries(productObj.stock).forEach(([key, value]) => {
                        stockObj[key] = Number(value);
                    });
                }

                productObj.stock = stockObj;
            }

            return productObj;
        })

        res.json({ success: true, products: formattedProducts })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//List sản phẩm
const listProduct = async (req, res) => {
    try {
        const products = await productModel.find({});

        // Convert stock Map to plain object for each product
        const formattedProducts = products.map(product => {
            const productObj = product.toObject();

            console.log('Raw product stock:', productObj.stock)

            // Convert Map to plain object
            if (productObj.stock && typeof productObj.stock === 'object') {
                const stockObj = {};
                if (productObj.stock instanceof Map) {
                    productObj.stock.forEach((value, key) => {
                        stockObj[key] = value;
                    });
                } else if (typeof productObj.stock === 'object') {
                    // Already an object (from MongoDB)
                    Object.entries(productObj.stock).forEach(([key, value]) => {
                        stockObj[key] = Number(value)
                    });
                }
                productObj.stock = stockObj;
                console.log('Formatted stock:', stockObj)
            }

            return productObj;
        });

        res.json({ success: true, products: formattedProducts })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//Xóa sản phẩm
const removeProduct = async (req, res) => {
    try {

        await productModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Xóa sản phẩm thành công" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

//Sửa sản phẩm
const editProduct = async (req, res) => {
    try {
        const { productId, name, description, price, category, subCategory, sizes, bestseller } = req.body;

        // Find existing product
        const product = await productModel.findById(productId);
        if (!product) {
            return res.json({ success: false, message: "Sản phẩm không tồn tại" });
        }

        // Handle image uploads
        const image1 = req.files.image1 && req.files.image1[0];
        const image2 = req.files.image2 && req.files.image2[0];
        const image3 = req.files.image3 && req.files.image3[0];
        const image4 = req.files.image4 && req.files.image4[0];

        const newImages = [image1, image2, image3, image4].filter((item) => item !== undefined);

        let imagesUrl = product.image; // Keep existing images

        // If new images are uploaded, replace old ones
        if (newImages.length > 0) {
            imagesUrl = await Promise.all(
                newImages.map(async (image) => {
                    let result = await cloudinary.uploader.upload(image.path, { resource_type: 'image' });
                    return result.secure_url;
                })
            );
        }

        // Update product data
        const updateData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === 'true' ? true : false,
            sizes: JSON.parse(sizes),
            image: imagesUrl,
        };

        await productModel.findByIdAndUpdate(productId, updateData);

        res.json({ success: true, message: "Cập nhật sản phẩm thành công" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

//function for single product details
const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body
        const product = await productModel.findById(productId)

        if (!product) {
            return res.json({ success: false, message: "Product not found" })
        }

        const productObj = product.toObject();

        // Convert Map to plain object
        if (productObj.stock) {
            const stockObj = {};

            if (productObj.stock instanceof Map) {
                productObj.stock.forEach((value, key) => {
                    stockObj[key] = Number(value);
                });
            } else if (typeof productObj.stock === 'object') {
                Object.entries(productObj.stock).forEach(([key, value]) => {
                    stockObj[key] = Number(value);
                });
            }

            productObj.stock = stockObj;
        }

        res.json({ success: true, product: productObj })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { addProduct, listProduct, removeProduct, editProduct, singleProduct, updateProductStock, checkStock, reduceStock, getLowStockProducts };