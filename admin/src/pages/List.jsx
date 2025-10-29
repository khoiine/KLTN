import axios from 'axios'
import { useEffect, useState } from 'react'
import { backendUrl, formatCurrency } from '../App'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import ReactPaginate from 'react-paginate'

const List = ({ token }) => {
    const navigate = useNavigate()

    const categoriesInVietnamese = {
        "Men": "Nam",
        "Women": "Nữ",
        "Kids": "Trẻ em",
    };

    const subCategoriesInVietnamese = {
        "Topwear": "Áo",
        "Bottomwear": "Quần",
        "Winterwear": "Trang phục mùa đông",
    };

    const [list, setList] = useState([])
    const [filteredList, setFilteredList] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [selectedSubCategory, setSelectedSubCategory] = useState("All")
    const [categories, setCategories] = useState([])
    const [subCategories, setSubCategories] = useState([])

    const [currentPage, setCurrentPage] = useState(0)
    const PAGE_SIZE = 6 // 6 sản phẩm 1 trang

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/category/list`)
                if (response.data.success) {
                    setCategories(response.data.categories)
                }
            } catch (error) {
                console.log(error)
            }
        }
        fetchCategories()
    }, [])

    // Fetch subcategories
    useEffect(() => {
        const fetchSubCategories = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/subcategory/list`)
                if (response.data.success) {
                    setSubCategories(response.data.subCategories)
                }
            } catch (error) {
                console.log(error)
            }
        }
        fetchSubCategories()
    }, [])

    const fetchList = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/product/list')
            if (response.data.success) {
                setList(response.data.products);
                setFilteredList(response.data.products);
            }
            else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const removeProduct = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            return;
        }

        try {
            const response = await axios.post(backendUrl + '/api/product/remove', { id }, { headers: { token } })

            if (response.data.success) {
                toast.success(response.data.message)
                await fetchList();
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Apply filters
    const applyFilters = () => {
        let products = list.slice();

        // Filter by search term
        if (searchTerm.trim() !== "") {
            products = products.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by category
        if (selectedCategory !== "All") {
            products = products.filter(product => product.category === selectedCategory);
        }

        // Filter by subcategory
        if (selectedSubCategory !== "All") {
            products = products.filter(product => product.subCategory === selectedSubCategory);
        }

        setFilteredList(products);
        setCurrentPage(0);
    };

    useEffect(() => {
        fetchList()
    }, [])

    useEffect(() => {
        applyFilters();
    }, [list, searchTerm, selectedCategory, selectedSubCategory]);

    const pageCount = Math.ceil(filteredList.length / PAGE_SIZE)
    const startIndex = currentPage * PAGE_SIZE
    const endIndex = startIndex + PAGE_SIZE
    const currentProducts = filteredList.slice(startIndex, endIndex)

    const handlePageClick = (event) => {
        setCurrentPage(event.selected)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <>
            <p className='mb-2 font-semibold'>Toàn bộ sản phẩm</p>

            {/* Thanh tìm kiếm và bộ lọc */}
            <div className='mb-4 flex gap-4 flex-wrap'>
                <input
                    type='text'
                    placeholder='Tìm kiếm sản phẩm theo tên...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />

                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                    <option value="All">Tất cả danh mục</option>
                    {categories.map((cat) => (
                        <option key={cat._id} value={cat.name}>
                            {categoriesInVietnamese[cat.name] || cat.name}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedSubCategory}
                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                    className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                    <option value="All">Tất cả loại</option>
                    {subCategories.map((subCat) => (
                        <option key={subCat._id} value={subCat.name}>
                            {subCategoriesInVietnamese[subCat.name] || subCat.name}
                        </option>
                    ))}
                </select>

                <p className='text-gray-600 flex items-center px-2'>
                    Hiển thị: {currentProducts.length} / {filteredList.length} sản phẩm
                </p>
            </div>

            <div className='flex flex-col gap-2'>
                <div className='hidden md:grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
                    <b>Ảnh</b>
                    <b>Tên sản phẩm</b>
                    <b>Danh mục</b>
                    <b>Loại sản phẩm</b>
                    <b>Giá tiền</b>
                    <b className='text-center'>Xóa sản phẩm</b>
                    <b className='text-center'>Sửa sản phẩm</b>
                </div>

                {currentProducts.length > 0 ? (
                    currentProducts.map((item, index) => (
                        <div className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm' key={index}>
                            <img className='w-12' src={item.image[0]} alt="" />
                            <p>{item.name}</p>
                            <p>{categoriesInVietnamese[item.category] || item.category}</p>
                            <p>{subCategoriesInVietnamese[item.subCategory] || item.subCategory}</p>
                            <p>{formatCurrency(item.price)}</p>
                            <p onClick={() => removeProduct(item._id)} className='text-right md:text-center cursor-pointer text-lg text-red-500 hover:text-red-700'>X</p>
                            <p onClick={() => navigate(`/edit/${item._id}`)} className='text-right md:text-center cursor-pointer text-blue-500 hover:text-blue-700'>Sửa</p>
                        </div>
                    ))
                ) : (
                    <div className='text-center py-8 text-gray-500'>
                        Không tìm thấy sản phẩm nào
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pageCount > 1 && (
                <div className='flex justify-center mt-6'>
                    <ReactPaginate
                        breakLabel="..."
                        nextLabel="›"
                        onPageChange={handlePageClick}
                        pageRangeDisplayed={3}
                        pageCount={pageCount}
                        previousLabel="‹"
                        renderOnZeroPageCount={null}
                        forcePage={currentPage}
                        containerClassName="flex gap-2 items-center"
                        pageClassName="border border-gray-300 rounded"
                        pageLinkClassName="px-3 py-1 block hover:bg-gray-100"
                        previousClassName="border border-gray-300 rounded"
                        previousLinkClassName="px-3 py-1 block hover:bg-gray-100"
                        nextClassName="border border-gray-300 rounded"
                        nextLinkClassName="px-3 py-1 block hover:bg-gray-100"
                        activeClassName="bg-black text-white"
                        activeLinkClassName="text-white"
                        disabledClassName="opacity-50 cursor-not-allowed"
                    />
                </div>
            )}
        </>
    )
}

export default List