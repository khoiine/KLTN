import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {

  const [currentState, setCurrenState] = useState('Đăng nhập');
  const { token, setToken, navigate, backendUrl, setIsAdmin } = useContext(ShopContext)

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (currentState === 'Đăng ký') {

        const response = await axios.post(backendUrl + '/api/user/register', { name, email, password })
        if (response.data.success) {
          setToken(response.data.token)
          localStorage.setItem('token', response.data.token)
          toast.success('Đăng ký thành công!')
        } else {
          toast.error(response.data.message)
        }


      } else {

        const response = await axios.post(backendUrl + '/api/user/login', { email, password })
        if (response.data.success) {
          setToken(response.data.token)
          localStorage.setItem('token', response.data.token)

          // Kiểm tra nếu là admin
          if (response.data.isAdmin) {
            setIsAdmin(true)
            toast.success('Đăng nhập admin thành công!')
          } else {
            setIsAdmin(false)
            toast.success('Đăng nhập thành công!')
          }
        } else {
          toast.error(response.data.message)
        }

      }


    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const response = await axios.post(backendUrl + '/api/user/google-login', {
        credential: credentialResponse.credential
      })

      if (response.data.success) {
        setToken(response.data.token)
        localStorage.setItem('token', response.data.token)

        if (response.data.isAdmin) {
          setIsAdmin(true)
          toast.success('Đăng nhập admin thành công!')
        } else {
          setIsAdmin(false)
          toast.success('Đăng nhập Google thành công!')
        }

        navigate('/')
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error('Đăng nhập Google thất bại')
    }
  }

  useEffect(() => {
    if (token) {
      navigate('/')
    }
  }, [token])


  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
      <div className='inline-flex items-center  gap-2 mb-2 mt-10'>
        <p className='prata-regular text-3xl'>{currentState}</p>
        <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
      </div>
      {currentState === 'Đăng nhập' ? '' : <input onChange={(e) => setName(e.target.value)} value={name} type="text" className='w-full px-3 py-2 border border-gray-800' placeholder='Tên người dùng' required />}
      <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" className='w-full px-3 py-2 border border-gray-800' placeholder='Email' required />
      <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" className='w-full px-3 py-2 border border-gray-800' placeholder='Mật khẩu' required />
      <div className='w-full flex justify-between text-sm mt-[-8px]'>
        <Link to='/forgot-password' className='cursor-pointer hover:underline'>Quên mật khẩu?</Link>
        {
          currentState === 'Đăng nhập'
            ? <p onClick={() => setCurrenState('Đăng ký')} className='cursor-pointer'>Tạo tài khoản</p>
            : <p onClick={() => setCurrenState('Đăng nhập')} className='cursor-pointer'>Đăng nhập</p>
        }
      </div>
      <button className='bg-black text-white font-light px-8 py-2 mt-4 rounded-full'>{currentState === 'Đăng nhập' ? 'Đăng nhập' : 'Đăng ký'}</button>

      {/* Đăng nhập Google */}
      <div className='w-full flex flex-col items-center gap-2'>
        <div className='flex items-center w-full gap-2'>
          <hr className='flex-1 border-gray-300' />
          <span className='text-sm text-gray-500'>hoặc</span>
          <hr className='flex-1 border-gray-300' />
        </div>
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => {
            console.log("Đăng nhập thất bại")
            toast.error('Đăng nhập Google thất bại')
          }}
          useOneTap
          theme="outline"
          size="large"
          text="continue_with"
          shape="rectangular"
        />
      </div>
    </form>
  )
}

export default Login