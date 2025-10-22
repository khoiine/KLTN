import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';
import { ShopContext } from '../context/ShopContext';
import ReactPaginate from 'react-paginate';

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProduct, setFilterProduct] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relavent');
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 12;

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

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

    setFilterProduct(productsCopy);
  };

  const sortProduct = () => {
    let fpCopy = filterProduct.slice();

    switch (sortType) {
      case 'low-high':
        setFilterProduct(fpCopy.sort((a, b) => a.price - b.price));
        break;
      case 'high-low':
        setFilterProduct(fpCopy.sort((a, b) => b.price - a.price));
        break;
      default:
        applyFilter();
        break;
    }
  };

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, search, showSearch,products]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  // định nghĩa HandlePageClick
  const offset = currentPage * itemsPerPage;
  const currentItems = filterProduct.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filterProduct.length / itemsPerPage);

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      <div className='min-w-60'>
        <p
          onClick={() => setShowFilter(!showFilter)}
          className='my-2 text-xl flex items-center cursor-pointer gap-2'
        >
          LỌC
          <img
            className={`h-3 sm:hidden ${showFilter ? ' rotate-90' : ''}`}
            src={assets.dropdown_icon}
            alt=''
          />
        </p>
        {/* lọc Category */}
        <div
          className={`border border-gray-300 pl-5 py-3 mt-6 ${
            showFilter ? '' : 'hidden'
          } sm:block`}
        >
          <p className='mb-3 text-sm font-medium'>Danh mục</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input
                className='w-3'
                type='checkbox'
                value={'Men'}
                onChange={toggleCategory}
              />{' '}
              Nam
            </p>
            <p className='flex gap-2'>
              <input
                className='w-3'
                type='checkbox'
                value={'Women'}
                onChange={toggleCategory}
              />{' '}
              Nữ
            </p>
            <p className='flex gap-2'>
              <input
                className='w-3'
                type='checkbox'
                value={'Kids'}
                onChange={toggleCategory}
              />{' '}
              Trẻ em
            </p>
          </div>
        </div>
        {/* lọc SubCategory */}
        <div
          className={`border border-gray-300 pl-5 py-3 my-5 ${
            showFilter ? '' : 'hidden'
          } sm:block`}
        >
          <p className='mb-3 text-sm font-medium'>Loại</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input
                className='w-3'
                type='checkbox'
                value={'Topwear'}
                onChange={toggleSubCategory}
              />{' '}
              Áo
            </p>
            <p className='flex gap-2'>
              <input
                className='w-3'
                type='checkbox'
                value={'Bottomwear'}
                onChange={toggleSubCategory}
              />{' '}
              Quần
            </p>
            <p className='flex gap-2'>
              <input
                className='w-3'
                type='checkbox'
                value={'Winterwear'}
                onChange={toggleSubCategory}
              />{' '}
              Trang phục mùa đông
            </p>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className='flex-1'>
        <div className='flex justify-between text-base sm:text-2xl mb-4'>
          <Title text1={'TẤT CẢ'} text2={'BỘ SƯU TẬP'} />
          {/* Product Sort */}
          <select
            onChange={(e) => setSortType(e.target.value)}
            className='border-2 border-gray-300 text-sm px-2'
          >
            <option value='relavent'>Sắp xếp: Có liên quan</option>
            <option value='low-high'>Sắp xếp: Từ thấp tới cao</option>
            <option value='high-low'>Sắp xếp: Từ cao tới thấp</option>
          </select>
        </div>

        {/* map sản phẩm */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {currentItems.map((item, index) => (
            <ProductItem
              key={index}
              id={item._id}
              image={item.image}
              name={item.name}
              price={item.price}
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