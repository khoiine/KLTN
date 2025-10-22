import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Users = ({token}) => {
    const [users, setUsers] = useState([])
    const [filteredUsers, setFilteredUsers] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedUser, setSelectedUser] = useState(null)
    const [showUserInfo, setShowUserInfo] = useState(false)
    const [showPasswords, setShowPasswords] = useState({}) // State để track password visibility cho từng user

    const fetchAllUsers = useCallback(async () => {
        if(!token){
            return null;
        }

        try {
            const response = await axios.get(backendUrl + '/api/user/list', {headers:{token}})
            if(response.data.success){
                setUsers(response.data.users)
                setFilteredUsers(response.data.users) // Khởi tạo filteredUsers
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }, [token])

    // Hàm xử lý tìm kiếm
    const handleSearch = (term) => {
        setSearchTerm(term)
        if (!term.trim()) {
            setFilteredUsers(users)
        } else {
            const filtered = users.filter(user => 
                user.name?.toLowerCase().includes(term.toLowerCase()) ||
                user.email?.toLowerCase().includes(term.toLowerCase()) ||
                user.phone?.toLowerCase().includes(term.toLowerCase())
            )
            setFilteredUsers(filtered)
        }
    }

    const showUserDetails = (user) => {
        setSelectedUser(user)
        setShowUserInfo(true)
    }

    const togglePassword = (userId) => {
        setShowPasswords(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }))
    }

    useEffect(()=>{
        fetchAllUsers();
    },[token, fetchAllUsers])

    //Chuyển ngày sang dạng dd/mm/yyyy
    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa cập nhật'
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); 
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    return(
        <div>
            <h3 className='mb-4 text-xl font-semibold'>Quản lý người dùng</h3>
            
            {/* Khung tìm kiếm */}
            <div className='mb-4'>
                <div className='max-w-md'>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                </div>
                <p className='text-sm text-gray-500 mt-2'>
                    Hiển thị {filteredUsers.length} / {users.length} người dùng
                </p>
            </div>

            <div className='overflow-x-auto'>
                <table className='min-w-full bg-white border border-gray-200'>
                    <thead className='bg-gray-50'>
                        <tr>
                            <th className='px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                STT
                            </th>
                            <th className='px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                Tên
                            </th>
                            <th className='px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                Email
                            </th>
                            <th className='px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                Số điện thoại
                            </th>
                            <th className='px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                Mật khẩu
                            </th>
                            <th className='px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user, index) => (
                                <tr key={user._id} className='hover:bg-gray-50'>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                                        {index + 1}
                                    </td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                                        {user.name || 'Chưa cập nhật'}
                                    </td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                                        {user.email}
                                    </td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                                        {user.phone || 'Chưa cập nhật'}
                                    </td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                                        <div className='flex items-center gap-2'>
                                            <span className='font-mono bg-gray-100 px-2 py-1 rounded text-xs'>
                                                {showPasswords[user._id] 
                                                    ? (user.password || 'Chưa cập nhật')
                                                    : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'
                                                }
                                            </span>
                                            <button
                                                onClick={() => togglePassword(user._id)}
                                                className='text-blue-600 hover:text-blue-800 text-xs'
                                            >
                                                {showPasswords[user._id] ? 'Ẩn' : 'Hiện'}
                                            </button>
                                        </div>
                                    </td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                                        <button
                                            onClick={() => showUserDetails(user)}
                                            className='text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded'
                                        >
                                            Xem thông tin
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className='px-6 py-4 text-center text-gray-500'>
                                    {searchTerm ? 'Không tìm thấy người dùng nào phù hợp' : 'Chưa có người dùng nào'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal hiển thị thông tin chi tiết user */}
            {showUserInfo && selectedUser && (
                <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
                    <div className='relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white'>
                        <div className='mt-3'>
                            <h3 className='text-lg font-medium text-gray-900 mb-4'>
                                Thông tin chi tiết người dùng
                            </h3>
                            <div className='space-y-3'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700'>Tên:</label>
                                    <p className='mt-1 text-sm text-gray-900'>{selectedUser.name || 'Chưa cập nhật'}</p>
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700'>Email:</label>
                                    <p className='mt-1 text-sm text-gray-900'>{selectedUser.email}</p>
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700'>Số điện thoại:</label>
                                    <p className='mt-1 text-sm text-gray-900'>{selectedUser.phone || 'Chưa cập nhật'}</p>
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700'>Địa chỉ:</label>
                                    <p className='mt-1 text-sm text-gray-900'>{selectedUser.address || 'Chưa cập nhật'}</p>
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700'>Thành phố:</label>
                                    <p className='mt-1 text-sm text-gray-900'>{selectedUser.city || 'Chưa cập nhật'}</p>
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700'>Quận/Huyện:</label>
                                    <p className='mt-1 text-sm text-gray-900'>{selectedUser.district || 'Chưa cập nhật'}</p>
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700'>Phường/Xã:</label>
                                    <p className='mt-1 text-sm text-gray-900'>{selectedUser.ward || 'Chưa cập nhật'}</p>
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700'>Ngày đăng ký:</label>
                                    <p className='mt-1 text-sm text-gray-900'>{formatDate(selectedUser.createdAt)}</p>
                                </div>
                            </div>
                            <div className='flex justify-end mt-6'>
                                <button
                                    onClick={() => setShowUserInfo(false)}
                                    className='px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400'
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Users
