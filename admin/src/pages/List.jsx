import axios from 'axios'
import { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

const List = ({token}) => {

    const categoriesInVietnamese = {
        "Men": "Nam",
        "Women": "Nữ",
        "Kids": "Trẻ em",
    };

    const[list,setList] = useState([])
    const[filteredList, setFilteredList] = useState([])
    const[searchTerm, setSearchTerm] = useState("")

    const fetchList = async () => {
        try {

            const response = await axios.get(backendUrl + '/api/product/list')
            if(response.data.success){
                setList(response.data.products);
                setFilteredList(response.data.products);
            }
            else{
                toast.error(response.data.message)
            }
        
            
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const removeProduct = async (id) => {
        try {

            const response = await axios.post(backendUrl + '/api/product/remove', {id}, {headers:{token}})
            
            if(response.data.success){
                toast.success(response.data.message)
                await fetchList();
            }  else {
                toast.error(response.data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Tìm kiếm sản phẩm theo tên
    const handleSearch = (term) => {
        setSearchTerm(term);
        if (term.trim() === "") {
            setFilteredList(list);
        } else {
            const filtered = list.filter(product =>
                product.name.toLowerCase().includes(term.toLowerCase())
            );
            setFilteredList(filtered);
        }
    };

    useEffect(()=>{
        fetchList()
    },[])

    // Đồng bộ filteredList khi list thay đổi
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredList(list);
        } else {
            const filtered = list.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredList(filtered);
        }
    }, [list, searchTerm]);

    return(
        <>
            <p className='mb-2 font-semibold'>Toàn bộ sản phẩm</p>
            
            {/* Thanh tìm kiếm */}
            <div className='mb-4'>
                <input
                    type='text'
                    placeholder='Tìm kiếm sản phẩm theo tên...'
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className='w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
            </div>

            <div className='flex flex-col gap-2'>
                <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
                    <b>Ảnh</b>
                    <b>Tên sản phẩm</b>
                    <b>Danh mục</b>
                    <b>Giá tiền</b>
                    <b className='text-center'>Xóa sản phẩm</b>
                </div>

                {
                    filteredList.map((item,index) => (
                        <div className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm' key={index}>
                            <img className='w-12' src={item.image[0]} alt="" />
                            <p>{item.name}</p>
                            <p>{categoriesInVietnamese[item.category] || item.category}</p>
                            <p>{item.price}{currency}</p>
                            <p onClick={()=>removeProduct(item._id)} className='text-right md:text-center cursor-pointer text-lg'>X</p>
                        </div>
                    ))
                }
            </div>
        </>
    )
}

export default List