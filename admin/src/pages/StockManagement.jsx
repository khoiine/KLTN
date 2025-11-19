import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { formatCurrency } from '../App'

const StockManagement = ({ token }) => {
    const [products, setProducts] = useState([])
    const [editingProduct, setEditingProduct] = useState(null)
    const [stockData, setStockData] = useState({})

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/product/list')
            if (response.data.success) {
                setProducts(response.data.products)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const handleEditStock = (product) => {
        setEditingProduct(product)
        const initialStock = {}
        product.sizes.forEach(size => {
            initialStock[size] = product.stock?.[size] ?? 0
        })
        setStockData(initialStock)
    }

    const handleStockChange = (size, value) => {
        setStockData(prev => ({
            ...prev,
            [size]: parseInt(value) || 0
        }))
    }

    const handleSaveStock = async () => {
        try {
            const response = await axios.post(
                backendUrl + '/api/product/update-stock',
                {
                    id: editingProduct._id,
                    stock: stockData
                },
                { headers: { token } }
            )

            if (response.data.success) {
                toast.success('Cập nhật tồn kho thành công')
                fetchProducts()
                setEditingProduct(null)
                setStockData({})
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const getStockLevel = (product) => {
        if (!product.stock) return 'no-stock'

        const stockValues = Object.values(product.stock)
        const totalStock = stockValues.reduce((sum, qty) => sum + (Number(qty) || 0), 0)

        if (totalStock === 0) return 'out-of-stock'
        if (totalStock <= 10) return 'low-stock'
        return 'in-stock'
    }

    const getStockColor = (level) => {
        switch (level) {
            case 'out-of-stock': return 'bg-red-100 text-red-800'
            case 'low-stock': return 'bg-yellow-100 text-yellow-800'
            case 'in-stock': return 'bg-green-100 text-green-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className='p-4'>
            <h1 className='text-2xl font-bold mb-6'>Quản lý kho</h1>

            <div className='bg-white rounded-lg shadow overflow-hidden'>
                <table className='w-full'>
                    <thead className='bg-gray-100'>
                        <tr>
                            <th className='text-left p-4'>Sản phẩm</th>
                            <th className='text-left p-4'>Giá</th>
                            <th className='text-left p-4'>Sizes & Tồn kho</th>
                            <th className='text-left p-4'>Tổng</th>
                            <th className='text-left p-4'>Trạng thái</th>
                            <th className='text-left p-4'>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => {
                            const stockLevel = getStockLevel(product)
                            const totalStock = product.stock 
                                ? Object.values(product.stock).reduce((sum, qty) => sum + (Number(qty) || 0), 0)
                                : 0

                            return (
                                <tr key={product._id} className='border-b hover:bg-gray-50'>
                                    <td className='p-4'>
                                        <div className='flex items-center gap-3'>
                                            <img src={product.image[0]} alt={product.name} className='w-16 h-16 object-cover rounded' />
                                            <div>
                                                <p className='font-semibold'>{product.name}</p>
                                                <p className='text-sm text-gray-500'>{product.category}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className='p-4'>{formatCurrency(product.price)}</td>
                                    <td className='p-4'>
                                        <div className='flex flex-wrap gap-2'>
                                            {product.sizes.map(size => {
                                                const qty = product.stock?.[size] ?? 0
                                                return (
                                                    <div key={size} className='flex items-center gap-1 bg-gray-100 px-2 py-1 rounded'>
                                                        <span className='font-semibold'>{size}:</span>
                                                        <span className={qty === 0 ? 'text-red-500' : qty <= 5 ? 'text-yellow-600' : ''}>{qty}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </td>
                                    <td className='p-4'>
                                        <span className='font-bold'>{totalStock}</span>
                                    </td>
                                    <td className='p-4'>
                                        <span className={`p-[8%] rounded text-sm ${getStockColor(stockLevel)}`}>
                                            {stockLevel === 'out-of-stock' && 'Hết hàng'}
                                            {stockLevel === 'low-stock' && 'Sắp hết'}
                                            {stockLevel === 'in-stock' && 'Còn hàng'}
                                        </span>
                                    </td>
                                    <td className='p-4'>
                                        <button
                                            onClick={() => handleEditStock(product)}
                                            className='p-[9%] bg-blue-600 text-white rounded'
                                        >
                                            Cập nhật
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Edit Stock Modal */}
            {editingProduct && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
                    <div className='bg-white rounded-lg p-6 w-full max-w-md'>
                        <h2 className='text-xl font-bold mb-4'>Cập nhật tồn kho</h2>
                        <p className='text-gray-600 mb-4'>{editingProduct.name}</p>

                        <div className='space-y-3 mb-6'>
                            {editingProduct.sizes.map(size => (
                                <div key={size} className='flex items-center justify-between'>
                                    <label className='font-semibold'>Size {size}:</label>
                                    <input
                                        type='number'
                                        min='0'
                                        value={stockData[size] || 0}
                                        onChange={(e) => handleStockChange(size, e.target.value)}
                                        className='w-24 px-3 py-2 border rounded'
                                    />
                                </div>
                            ))}
                        </div>

                        <div className='flex justify-end gap-3'>
                            <button
                                onClick={() => {
                                    setEditingProduct(null)
                                    setStockData({})
                                }}
                                className='px-4 py-2 border rounded hover:bg-gray-50'
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSaveStock}
                                className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default StockManagement