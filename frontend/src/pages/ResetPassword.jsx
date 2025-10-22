import React, { useState , useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ShopContext } from '../context/ShopContext'


const ResetPassword = () => {
    const { backendUrl } = useContext(ShopContext)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const { token } = useParams()
    const navigate = useNavigate()

    const onSubmitHandler = async (e) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            return toast.error('Mật khẩu không khớp')
        }

        if (password.length < 8) {
            return toast.error('Mật khẩu phải có ít nhất 8 ký tự')
        }

        setLoading(true)

        try {
            const response = await axios.post(backendUrl + `/api/user/reset-password/${token}`, { password })
            
            if (response.data.success) {
                toast.success(response.data.message)
                setTimeout(() => navigate('/login'), 2000)
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error('Có lỗi xảy ra')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
            <div className='inline-flex items-center gap-2 mb-2 mt-10'>
                <p className='prata-regular text-3xl'>Đặt lại mật khẩu</p>
                <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
            </div>
            <input 
                onChange={(e) => setPassword(e.target.value)} 
                value={password} 
                type='password' 
                className='w-full px-3 py-2 border border-gray-800' 
                placeholder='Mật khẩu mới' 
                required 
            />
            <input 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                value={confirmPassword} 
                type='password' 
                className='w-full px-3 py-2 border border-gray-800' 
                placeholder='Xác nhận mật khẩu' 
                required 
            />
            <button 
                type='submit' 
                disabled={loading}
                className='bg-black text-white font-light px-8 py-2 mt-4 disabled:bg-gray-400'
            >
                {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>
        </form>
    )
}

export default ResetPassword