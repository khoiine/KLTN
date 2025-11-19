import axios from 'axios';
import { useEffect, useState } from 'react';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const SubCategoryManagement = ({ token }) => {
    const [subCategories, setSubCategories] = useState([]);
    const [name, setName] = useState('');
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchSubCategories = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/subcategory/list`);
            if (response.data.success) {
                setSubCategories(response.data.subCategories);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Tên loại sản phẩm không được để trống');
            return;
        }

        try {
            setLoading(true);
            if (editId) {
                const response = await axios.post(
                    `${backendUrl}/api/subcategory/update`,
                    { id: editId, name },
                    { headers: { token } }
                );
                if (response.data.success) {
                    // Use returned list from backend
                    setSubCategories(response.data.subCategories);
                    setEditId(null);
                    setName('');
                    toast.success(response.data.message);
                } else {
                    toast.error(response.data.message);
                }
            } else {
                const response = await axios.post(
                    `${backendUrl}/api/subcategory/create`,
                    { name },
                    { headers: { token } }
                );
                if (response.data.success) {
                    // Use returned list from backend
                    setSubCategories(response.data.subCategories);
                    setName('');
                    toast.success(response.data.message);
                } else {
                    toast.error(response.data.message);
                }
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (subCategory) => {
        setName(subCategory.name);
        setEditId(subCategory._id);
    };

    const handleCancelEdit = () => {
        setName('');
        setEditId(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa loại sản phẩm này?')) {
            try {
                setLoading(true);
                const response = await axios.post(
                    `${backendUrl}/api/subcategory/delete`,
                    { id },
                    { headers: { token } }
                );
                if (response.data.success) {
                    // Use returned list from backend
                    setSubCategories(response.data.subCategories);
                    toast.success(response.data.message);
                } else {
                    toast.error(response.data.message);
                }
            } catch (error) {
                console.log(error);
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchSubCategories();
    }, []);

    return (
        <div className='p-4'>
            <div className='flex justify-between items-center mb-6'>
                <h1 className='text-2xl font-bold'>Quản lý loại sản phẩm</h1>
            </div>

            <form onSubmit={handleSubmit} className='flex gap-2 mb-6'>
                <input
                    type='text'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='Nhập tên loại sản phẩm'
                    className='flex-1 border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                    disabled={loading}
                />
                <button
                    type='submit'
                    disabled={loading}
                    className='bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded disabled:bg-gray-400'
                >
                    {loading ? 'Đang xử lý...' : (editId ? 'Cập nhật' : 'Thêm')}
                </button>
                {editId && (
                    <button
                        type='button'
                        onClick={handleCancelEdit}
                        disabled={loading}
                        className='bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded'
                    >
                        Hủy
                    </button>
                )}
            </form>

            <div className='bg-white border rounded'>
                <div className='grid grid-cols-2 gap-4 p-3 bg-gray-100 font-semibold border-b'>
                    <div>Tên loại sản phẩm</div>
                    <div className='text-right'>Hành động</div>
                </div>
                {subCategories.length === 0 ? (
                    <div className='p-4 text-center text-gray-500'>
                        Chưa có loại sản phẩm nào. Vui lòng thêm mới.
                    </div>
                ) : (
                    subCategories.map((subCategory) => (
                        <div
                            key={subCategory._id}
                            className='grid grid-cols-2 gap-4 p-3 border-b items-center hover:bg-gray-50'
                        >
                            <div className='font-medium'>
                                {subCategory.name === 'Topwear' ? 'Áo' :
                                    subCategory.name === 'Bottomwear' ? 'Quần' :
                                        subCategory.name === 'Winterwear' ? 'Trang phục mùa đông' :
                                            subCategory.name}
                            </div>
                            <div className='text-right space-x-2'>
                                <button
                                    onClick={() => handleEdit(subCategory)}
                                    disabled={loading}
                                    className='px-4 py-2 bg-blue-600 text-white rounded'
                                >
                                    Sửa
                                </button>
                                <button
                                    onClick={() => handleDelete(subCategory._id)}
                                    disabled={loading}
                                    className='px-4 py-2 bg-red-600 text-white rounded'
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <p className='mt-4 text-sm text-gray-600'>
                Tổng số loại sản phẩm: {subCategories.length}
            </p>
        </div>
    );
};

export default SubCategoryManagement;