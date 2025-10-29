import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';
import { ShopContext } from '../context/ShopContext';
import ReactPaginate from 'react-paginate';
import axios from 'axios';

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relavent');
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/category/list`);
        if (response.data.success) {
          setCategories(response.data.categories);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch subcategories from backend
  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/subcategory/list`);
        if (response.data.success) {
          setSubCategories(response.data.subCategories);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchSubCategories();
  }, []);

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setCategory((prev) => [...prev, e.target.value]);
    }
  };

  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setSubCategory((prev) => [...prev, e.target.value]);
    }
  };

  const applyFilter = () => {
    let productsCopy = products.slice();

    if (showSearch && search) {
      productsCopy = productsCopy.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        category.includes(item.category)
      );
    }

    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        subCategory.includes(item.subCategory)
      );
    }

    setFilterProducts(productsCopy);
  };

  const sortProduct = () => {
    let fpCopy = filterProducts.slice();

    switch (sortType) {
      case 'low-high':
        setFilterProducts(fpCopy.sort((a, b) => a.price - b.price));
        break;

      case 'high-low':
        setFilterProducts(fpCopy.sort((a, b) => b.price - a.price));
        break;

      default:
        applyFilter();
        break;
    }
  };

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, search, showSearch, products]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const offset = currentPage * itemsPerPage;
  const currentItems = filterProducts.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filterProducts.length / itemsPerPage);

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      {/* Filter Options */}
      <div className='min-w-60'>
        <p
          onClick={() => setShowFilter(!showFilter)}
          className='my-2 text-xl flex items-center cursor-pointer gap-2'
        >
          LỌC
          <img
            className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`}
            src={assets.dropdown_icon}
            alt=''
          />
        </p>

        {/* Category Filter - Dynamic */}
        <div
          className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'
            } sm:block`}
        >
          <p className='mb-3 text-sm font-medium'>Danh mục</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            {categories.length > 0 ? (
              categories.map((cat) => (
                <p className='flex gap-2' key={cat._id}>
                  <input
                    className='w-3'
                    type='checkbox'
                    value={cat.name}
                    onChange={toggleCategory}
                  />
                  {cat.name === 'Men'
                    ? 'Nam'
                    : cat.name === 'Women'
                      ? 'Nữ'
                      : cat.name === 'Kids'
                        ? 'Trẻ em'
                        : cat.name}
                </p>
              ))
            ) : (
              <p className='text-gray-500'>Đang tải...</p>
            )}
          </div>
        </div>

        {/* SubCategory Filter - FIXED TO BE DYNAMIC */}
        <div
          className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'
            } sm:block`}
        >
          <p className='mb-3 text-sm font-medium'>Loại</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            {subCategories.length > 0 ? (
              subCategories.map((subCat) => (
                <p className='flex gap-2' key={subCat._id}>
                  <input
                    className='w-3'
                    type='checkbox'
                    value={subCat.name}
                    onChange={toggleSubCategory}
                  />
                  {subCat.name === 'Topwear'
                    ? 'Áo'
                    : subCat.name === 'Bottomwear'
                      ? 'Quần'
                      : subCat.name === 'Winterwear'
                        ? 'Trang phục mùa đông'
                        : subCat.name}
                </p>
              ))
            ) : (
              <p className='text-gray-500'>Đang tải...</p>
            )}
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className='flex-1'>
        <div className='flex justify-between text-base sm:text-2xl mb-4'>
          <Title text1={'TẤT CẢ'} text2={'BỘ SƯU TẬP'} />
          <select
            onChange={(e) => setSortType(e.target.value)}
            className='border-2 border-gray-300 text-sm px-2'
          >
            <option value='relavent'>Sản phẩm</option>
            <option value='low-high'>Giá: từ thấp tới cao</option>
            <option value='high-low'>Giá: từ cao tới thấp</option>
          </select>
        </div>

        {/* Map Products */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {currentItems.map((item, index) => (
            <ProductItem
              key={index}
              name={item.name}
              id={item._id}
              price={item.price}
              image={item.image}
            />
          ))}
        </div>
        <ReactPaginate
          previousLabel={'←'}
          nextLabel={'→'}
          breakLabel={'...'}
          breakClassName={'break-me'}
          pageCount={pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={2}
          onPageChange={handlePageClick}    
          containerClassName={'flex justify-center mt-8'}
          pageClassName={'mx-1'}
          pageLinkClassName={'px-3 py-1 border border-gray-300 rounded-full '}
          previousLinkClassName={'px-3 py-1 border border-gray-300 rounded-full '}
          nextLinkClassName={'px-3 py-1 border border-gray-300 rounded-full'}
          activeLinkClassName={'bg-black text-white'}
        />
      </div>
    </div>
  );
};

export default Collection;