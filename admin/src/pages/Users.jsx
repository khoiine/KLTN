import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Users = ({ token }) => {
    const apiBase = backendUrl || import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

    const [users, setUsers] = useState([])
    const [filteredUsers, setFilteredUsers] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(false)

    // modal/form state
    const [showModal, setShowModal] = useState(false)
    const [isCreating, setIsCreating] = useState(true)
    const [selectedUser, setSelectedUser] = useState(null)
    const [showUserInfo, setShowUserInfo] = useState(false)
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        address: '',
        city: '',
        district: '',
        ward: ''
    })
    const [showPasswords, setShowPasswords] = useState({})

    const fetchAllUsers = useCallback(async () => {
        if (!token) return
        try {
            setLoading(true)
            const res = await axios.get(`${apiBase}/api/user/list`, { headers: { token } })
            if (res.data?.success) {
                setUsers(res.data.users || [])
                setFilteredUsers(res.data.users || [])
            } else {
                toast.error(res.data?.message || 'Failed to load users')
            }
        } catch (err) {
            console.error('fetchAllUsers error', err)
            toast.error(err?.response?.data?.message || err.message || 'Lỗi kết nối')
        } finally {
            setLoading(false)
        }
    }, [token, apiBase])

    useEffect(() => {
        fetchAllUsers()
    }, [fetchAllUsers])

    const handleSearch = (term) => {
        setSearchTerm(term)
        if (!term.trim()) {
            setFilteredUsers(users)
            return
        }
        const filtered = users.filter(u =>
            (u.name || '').toLowerCase().includes(term.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(term.toLowerCase()) ||
            (u.phone || '').toLowerCase().includes(term.toLowerCase())
        )
        setFilteredUsers(filtered)
    }

    const openCreate = () => {
        setIsCreating(true)
        setSelectedUser(null)
        setForm({
            name: '',
            email: '',
            phone: '',
            password: '',
            address: '',
            city: '',
            district: '',
            ward: ''
        })
        setShowModal(true)
    }

    const openEdit = (user) => {
        setIsCreating(false)
        setSelectedUser(user)
        setForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            password: '',
            address: user.address || '',
            city: user.city || '',
            district: user.district || '',
            ward: user.ward || ''
        })
        setShowModal(true)
    }

    const showUserDetails = (user) => {
        setSelectedUser(user)
        setShowUserInfo(true)
    }

    const togglePassword = (userId) => {
        setShowPasswords(prev => ({ ...prev, [userId]: !prev[userId] }))
    }

    const handleCreateUser = async () => {
        try {
            const payload = { ...form }
            if (!payload.email || !payload.password) {
                toast.error('Email và mật khẩu là bắt buộc')
                return
            }
            const res = await axios.post(`${apiBase}/api/user/register`, payload, { headers: { token } })
            if (res.data?.success) {
                toast.success('Tạo người dùng thành công')
                setShowModal(false)
                fetchAllUsers()
            } else {
                toast.error(res.data?.message || 'Tạo người dùng thất bại')
            }
        } catch (err) {
            console.error('create user error', err)
            toast.error(err?.response?.data?.message || err.message || 'Lỗi kết nối')
        }
    }

    const handleUpdateUser = async () => {
        if (!selectedUser) return
        try {
            const payload = { userId: selectedUser._id, ...form }
            const res = await axios.post(`${apiBase}/api/user/update`, payload, { headers: { token } })
            if (res.data?.success) {
                toast.success('Cập nhật người dùng thành công')
                setShowModal(false)
                fetchAllUsers()
            } else {
                toast.error(res.data?.message || 'Cập nhật thất bại')
            }
        } catch (err) {
            console.error('update user error', err)
            toast.error(err?.response?.data?.message || err.message || 'Lỗi kết nối')
        }
    }

    const handleDeleteUser = async (userId) => {
        if (!userId) return
        if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return
        try {
            const res = await axios.post(`${apiBase}/api/user/delete`, { userId }, { headers: { token } })
            if (res.data?.success) {
                toast.success('Đã xóa người dùng')
                setUsers(prev => prev.filter(u => u._id !== userId))
                setFilteredUsers(prev => prev.filter(u => u._id !== userId))
            } else {
                toast.error(res.data?.message || 'Xóa thất bại')
            }
        } catch (err) {
            console.error('delete user error', err)
            toast.error(err?.response?.data?.message || err.message || 'Lỗi kết nối')
        }
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '—'
        const date = new Date(dateStr)
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Quản lý người dùng</h3>
            </div>

            <div className="mb-4">
                <div className="flex gap-2 mb-6">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="flex-1 w-[100%] border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={openCreate} className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Tạo người dùng</button>
                </div>
                <p className="text-sm text-gray-500 mt-2">Hiển thị {filteredUsers.length} / {users.length} người dùng</p>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">STT</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SĐT</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mật khẩu</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="6" className="px-6 py-4 text-center">Đang tải...</td></tr>
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map((user, idx) => (
                                <tr key={user._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">{idx + 1}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name || '—'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{user.phone || '—'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                                                {showPasswords[user._id] ? (user.password || '—') : '••••••••'}
                                            </span>
                                            <button onClick={() => togglePassword(user._id)} className="text-blue-600 text-xs">
                                                {showPasswords[user._id] ? 'Ẩn' : 'Hiện'}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium flex gap-2">
                                        <button onClick={() => showUserDetails(user)} className="text-indigo-600 bg-indigo-50 px-4 py-2 rounded">Xem</button>
                                        <button onClick={() => openEdit(user)} className="px-4 py-2 bg-blue-600 text-white rounded">Sửa</button>
                                        <button onClick={() => handleDeleteUser(user._id)} className="px-4 py-2 bg-red-600 text-white rounded">Xóa</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                    {searchTerm ? 'Không tìm thấy người dùng nào phù hợp' : 'Chưa có người dùng nào'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal tạo/sửa người dùng */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-start justify-center pt-20">
                    <div className="bg-white w-96 rounded shadow-lg p-6">
                        <h3 className="text-lg font-medium mb-4">{isCreating ? 'Tạo người dùng' : 'Cập nhật người dùng'}</h3>
                        <div className="space-y-2">
                            <input className="w-full p-2 border rounded" placeholder="Tên" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            <input className="w-full p-2 border rounded" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                            <input className="w-full p-2 border rounded" placeholder="Số điện thoại" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                            <input className="w-full p-2 border rounded" placeholder="Mật khẩu" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                            <input className="w-full p-2 border rounded" placeholder="Địa chỉ" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                            <div className="flex gap-2">
                                <input className="flex-1 p-2 border w-[100%] rounded" placeholder="Thành phố" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                                <input className="flex-1 p-2 border w-[100%] rounded" placeholder="Quận" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} />
                                <input className="flex-1 p-2 border w-[100%] rounded" placeholder="Phường" value={form.ward} onChange={e => setForm({ ...form, ward: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded">Hủy</button>
                            {isCreating ? (
                                <button onClick={handleCreateUser} className="px-4 py-2 bg-blue-600 text-white rounded">Tạo</button>
                            ) : (
                                <button onClick={handleUpdateUser} className="px-4 py-2 bg-blue-600 text-white rounded">Lưu</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal hiển thị chi tiết người dùng */}
            {showUserInfo && selectedUser && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin chi tiết người dùng</h3>
                            <div className="space-y-3">
                                <div><label className="block text-sm font-medium text-gray-700">Tên:</label><p className="mt-1 text-sm text-gray-900">{selectedUser.name || 'Chưa cập nhật'}</p></div>
                                <div><label className="block text-sm font-medium text-gray-700">Email:</label><p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p></div>
                                <div><label className="block text-sm font-medium text-gray-700">Số điện thoại:</label><p className="mt-1 text-sm text-gray-900">{selectedUser.phone || 'Chưa cập nhật'}</p></div>
                                <div><label className="block text-sm font-medium text-gray-700">Địa chỉ:</label><p className="mt-1 text-sm text-gray-900">{selectedUser.address || 'Chưa cập nhật'}</p></div>
                                <div><label className="block text-sm font-medium text-gray-700">Thành phố:</label><p className="mt-1 text-sm text-gray-900">{selectedUser.city || 'Chưa cập nhật'}</p></div>
                                <div><label className="block text-sm font-medium text-gray-700">Quận/Huyện:</label><p className="mt-1 text-sm text-gray-900">{selectedUser.district || 'Chưa cập nhật'}</p></div>
                                <div><label className="block text-sm font-medium text-gray-700">Phường/Xã:</label><p className="mt-1 text-sm text-gray-900">{selectedUser.ward || 'Chưa cập nhật'}</p></div>
                                <div><label className="block text-sm font-medium text-gray-700">Ngày đăng ký:</label><p className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.createdAt)}</p></div>
                            </div>
                            <div className="flex justify-end mt-6">
                                <button onClick={() => setShowUserInfo(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">Đóng</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Users
