import React, { useState , useContext } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ShopContext } from '../context/ShopContext'

const ForgotPassword = () => {
    const { backendUrl } = useContext(ShopContext)
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await axios.post(backendUrl + '/api/user/forgot-password', { email })

            if (response.data.success) {
                toast.success(response.data.message)
                setEmail('')
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
                <p className='prata-regular text-3xl'>Quên mật khẩu</p>
                <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
            </div>
            <p className='text-sm text-gray-600 text-center'>
                Nhập email của bạn để nhận link đặt lại mật khẩu
            </p>
            <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type='email'
                className='w-full px-3 py-2 border border-gray-800'
                placeholder='Email'
                required
            />
            <button
                type='submit'
                disabled={loading}
                className='bg-black text-white font-light px-8 py-2 mt-4 disabled:bg-gray-400'
            >
                {loading ? 'Đang gửi...' : 'Gửi email'}
            </button>
        </form>
    )
}

export default ForgotPassword