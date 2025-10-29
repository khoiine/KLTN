import React, { useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Title from '../components/Title'

const ChangePassword = () => {
    const { backendUrl, token, navigate } = useContext(ShopContext)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('Vui lòng nhập đầy đủ thông tin')
            return
        }

        if (newPassword.length < 8) {
            toast.error('Mật khẩu mới phải có ít nhất 8 ký tự')
            return
        }

        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp')
            return
        }

        try {
            setLoading(true)
            const response = await axios.post(
                `${backendUrl}/api/user/change-password`,
                { currentPassword, newPassword },
                { headers: { token } }
            )

            if (response.data.success) {
                toast.success(response.data.message)
                setCurrentPassword('')
                setNewPassword('')
                setConfirmPassword('')
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='border-t pt-8'>
            <div className='text-2xl mb-8'>
                <Title text1={'ĐỔI'} text2={'MẬT KHẨU'} />
            </div>

            <form onSubmit={handleSubmit} className='max-w-md mx-auto'>
                <div className='mb-4'>
                    <label className='block text-gray-700 text-sm font-bold mb-2'>
                        Mật khẩu hiện tại
                    </label>
                    <input
                        type='password'
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black'
                        placeholder='Nhập mật khẩu hiện tại'
                        disabled={loading}
                    />
                </div>

                <div className='mb-4'>
                    <label className='block text-gray-700 text-sm font-bold mb-2'>
                        Mật khẩu mới
                    </label>
                    <input
                        type='password'
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black'
                        placeholder='Nhập mật khẩu mới (tối thiểu 8 ký tự)'
                        disabled={loading}
                    />
                </div>

                <div className='mb-6'>
                    <label className='block text-gray-700 text-sm font-bold mb-2'>
                        Xác nhận mật khẩu mới
                    </label>
                    <input
                        type='password'
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black'
                        placeholder='Nhập lại mật khẩu mới'
                        disabled={loading}
                    />
                </div>

                <button
                    type='submit'
                    disabled={loading}
                    className='w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
                >
                    {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                </button>
            </form>
        </div>
    )
}

export default ChangePassword