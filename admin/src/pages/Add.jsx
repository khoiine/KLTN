import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const Add = ({ token }) => {
    const [image1, setImage1] = useState(false)
    const [image2, setImage2] = useState(false)
    const [image3, setImage3] = useState(false)
    const [image4, setImage4] = useState(false)

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [price, setPrice] = useState("")
    const [category, setCategory] = useState("")
    const [subCategory, setSubCategory] = useState("")
    const [bestseller, setBestseller] = useState(false)
    const [sizes, setSizes] = useState([])
    const [stock, setStock] = useState({})

    const [categories, setCategories] = useState([])
    const [subCategories, setSubCategories] = useState([]);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/category/list`)
                if (response.data.success) {
                    setCategories(response.data.categories)
                    if (response.data.categories.length > 0) {
                        setCategory(response.data.categories[0].name)
                    }
                }
            } catch (error) {
                console.log(error)
                toast.error('Không thể tải danh mục')
            }
        }
        fetchCategories()
    }, [])

    // Fetch subcategories
    useEffect(() => {
        const fetchSubCategories = async () => {
            try {
                const res = await axios.get(`${backendUrl}/api/subcategory/list`);
                if (res.data.success) {
                    setSubCategories(res.data.subCategories);
                    if (res.data.subCategories.length && !subCategory) {
                        setSubCategory(res.data.subCategories[0].name);
                    }
                }
            } catch (e) {
                console.log(e);
                toast.error('Không thể tải loại sản phẩm');
            }
        };
        fetchSubCategories();
    }, []);

    const onSubmitHandler = async (e) => {
        e.preventDefault()

        // Validate that sizes are selected
        if (sizes.length === 0) {
            toast.error('Vui lòng chọn ít nhất một size')
            return
        }

        // Validate that all selected sizes have stock
        const hasInvalidStock = sizes.some(size => !stock[size] || stock[size] <= 0)
        if (hasInvalidStock) {
            toast.error('Vui lòng nhập số lượng cho tất cả các size đã chọn')
            return
        }

        try {
            const formData = new FormData()

            formData.append("name", name)
            formData.append("description", description)
            formData.append("price", price)
            formData.append("category", category)
            formData.append("subCategory", subCategory)
            formData.append("bestseller", bestseller)
            formData.append("sizes", JSON.stringify(sizes))
            formData.append("stock", JSON.stringify(stock))

            image1 && formData.append("image1", image1)
            image2 && formData.append("image2", image2)
            image3 && formData.append("image3", image3)
            image4 && formData.append("image4", image4)

            const response = await axios.post(backendUrl + "/api/product/add", formData, { headers: { token } })

            if (response.data.success) {
                toast.success(response.data.message)
                setName('')
                setDescription('')
                setImage1(false)
                setImage2(false)
                setImage3(false)
                setImage4(false)
                setPrice('')
                setSizes([])
                setStock({})
                setBestseller(false)
            } else {
                toast.error(response.data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const handleSizeChange = (size) => {
        setSizes(prev => {
            if (prev.includes(size)) {
                // Remove size
                const newSizes = prev.filter(s => s !== size)
                const newStock = { ...stock }
                delete newStock[size]
                setStock(newStock)
                return newSizes
            } else {
                // Add size with default stock of 0
                setStock(prev => ({ ...prev, [size]: 0 }))
                return [...prev, size]
            }
        })
    }

    const handleStockChange = (size, value) => {
        const numValue = parseInt(value) || 0
        setStock(prev => ({
            ...prev,
            [size]: numValue
        }))
    }

    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
            <div>
                <p className='mb-2'>Tải ảnh lên</p>
                <div className='flex gap-2'>
                    <label htmlFor="image1">
                        <img className='w-20 cursor-pointer' src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} alt="" />
                        <input onChange={(e) => setImage1(e.target.files[0])} type="file" id="image1" hidden accept="image/*" />
                    </label>
                    <label htmlFor="image2">
                        <img className='w-20 cursor-pointer' src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} alt="" />
                        <input onChange={(e) => setImage2(e.target.files[0])} type="file" id="image2" hidden accept="image/*" />
                    </label>
                    <label htmlFor="image3">
                        <img className='w-20 cursor-pointer' src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} alt="" />
                        <input onChange={(e) => setImage3(e.target.files[0])} type="file" id="image3" hidden accept="image/*" />
                    </label>
                    <label htmlFor="image4">
                        <img className='w-20 cursor-pointer' src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} alt="" />
                        <input onChange={(e) => setImage4(e.target.files[0])} type="file" id="image4" hidden accept="image/*" />
                    </label>
                </div>
            </div>

            <div className='w-full'>
                <p className='mb-2'>Tên sản phẩm</p>
                <input
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    className='w-full max-w-[500px] px-3 py-2 border rounded'
                    type="text"
                    placeholder='Nhập tên sản phẩm'
                    required
                />
            </div>

            <div className='w-full'>
                <p className='mb-2'>Mô tả sản phẩm</p>
                <textarea
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                    className='w-full max-w-[500px] px-3 py-2 border rounded'
                    rows="4"
                    placeholder='Nhập mô tả sản phẩm'
                    required
                />
            </div>

            <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
                <div>
                    <p className='mb-2'>Danh mục sản phẩm</p>
                    <select
                        onChange={(e) => setCategory(e.target.value)}
                        value={category}
                        className='w-full px-3 py-2 border rounded'
                    >
                        {categories.length > 0 ? (
                            categories.map((cat) => (
                                <option key={cat._id} value={cat.name}>
                                    {cat.name === 'Men' ? 'Nam' : cat.name === 'Women' ? 'Nữ' : cat.name === 'Kids' ? 'Trẻ em' : cat.name}
                                </option>
                            ))
                        ) : (
                            <option value="">Đang tải...</option>
                        )}
                    </select>
                </div>

                <div>
                    <p className='mb-2'>Loại sản phẩm</p>
                    <select
                        value={subCategory}
                        onChange={(e) => setSubCategory(e.target.value)}
                        className='w-full px-3 py-2 border rounded'
                    >
                        {subCategories.map(s => (
                            <option key={s._id} value={s.name}>
                                {s.name === 'Topwear' ? 'Áo' : s.name === 'Bottomwear' ? 'Quần' : s.name === 'Winterwear' ? 'Trang phục mùa đông' : s.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <p className='mb-2'>Giá sản phẩm (VNĐ)</p>
                    <input
                        onChange={(e) => setPrice(e.target.value)}
                        value={price}
                        className='w-full px-3 py-2 border rounded sm:w-[120px]'
                        type="number"
                        placeholder='100000'
                        min="0"
                        required
                    />
                </div>
            </div>

            <div className='w-full'>
                <p className='mb-2 font-semibold'>Size và số lượng sản phẩm</p>
                <p className='mb-3 text-sm text-gray-600'>Nhấn vào size để chọn, sau đó nhập số lượng</p>
                <div className='flex flex-col gap-3 bg-gray-50 p-4 rounded border'>
                    {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                        <div key={size} className='flex items-center gap-4 border-b pb-3 last:border-b-0'>
                            <button
                                type="button"
                                onClick={() => handleSizeChange(size)}
                                className={`${sizes.includes(size)
                                        ? "bg-blue-500 text-white border-blue-500"
                                        : "bg-white text-gray-700 border-gray-300"
                                    } px-4 py-2 border-2 rounded cursor-pointer font-semibold transition-all hover:shadow-md min-w-[60px]`}
                            >
                                {size}
                            </button>
                            {sizes.includes(size) ? (
                                <div className='flex items-center gap-2 flex-1'>
                                    <label className='text-sm font-medium'>Số lượng:</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={stock[size] || 0}
                                        onChange={(e) => handleStockChange(size, e.target.value)}
                                        className='w-32 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none'
                                        placeholder='0'
                                    />
                                    <span className='text-sm text-gray-500'>sản phẩm</span>
                                </div>
                            ) : (
                                <span className='text-sm text-gray-400 italic'>Chưa chọn</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Show total stock */}
                {sizes.length > 0 && (
                    <div className='mt-3 p-3 bg-blue-50 rounded border border-blue-200'>
                        <p className='text-sm font-semibold text-blue-800'>
                            Tổng số lượng: {Object.values(stock).reduce((sum, qty) => sum + (Number(qty) || 0), 0)} sản phẩm
                        </p>
                        <p className='text-xs text-blue-600 mt-1'>
                            Sizes đã chọn: {sizes.join(', ')}
                        </p>
                    </div>
                )}
            </div>

            <div className='flex gap-2 mt-2'>
                <input
                    onChange={() => setBestseller(prev => !prev)}
                    checked={bestseller}
                    type="checkbox"
                    id='bestseller'
                    className='cursor-pointer'
                />
                <label className='cursor-pointer' htmlFor="bestseller">Thêm vào bán chạy</label>
            </div>

            <button
                type="submit"
                className='w-auto px-8 py-3 mt-4 bg-black text-white rounded hover:bg-gray-800 transition-colors'
            >
                THÊM SẢN PHẨM
            </button>
        </form>
    )
}

export default Add