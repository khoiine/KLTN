import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Routes, Route, useSearchParams } from 'react-router-dom'
import Add from './pages/Add'
import List from './pages/List'
import Orders from './pages/Orders'
import AdminReviews from './pages/AdminReviews'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Login from './components/Login'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditProduct from './pages/EditProduct'
import CategoryManagement from './pages/CategoryManagement'
import SubCategoryManagement from './pages/SubCategoryManagement'
import ChatManagement from './pages/ChatManagement' 
import AdminContextProvider from './context/AdminContext';
import BlogManagement from './pages/BlogManagement'
import StockManagement from './pages/StockManagement'
import Vouchers from './pages/Vouchers'

export const backendUrl = import.meta.env.VITE_BACKEND_URL

export const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
    .format(typeof value === 'number' ? value : Number(value || 0));

const App = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');

  const [token, setToken] = useState(
    tokenFromUrl || localStorage.getItem('token') || ''
  );

  useEffect(() => {
    localStorage.setItem('token', token)
  }, [token])

  // Nếu có token từ URL, set nó
  useEffect(() => {
    if (tokenFromUrl && tokenFromUrl !== token) {
      setToken(tokenFromUrl);
    }
  }, [tokenFromUrl, token])

  return (
    <div className='bg-gray-50 min-h-screen'>
      <ToastContainer />
      {token === ""
        ? <Login setToken={setToken} />
        : <>
          <AdminContextProvider token={token}>
          <Navbar setToken={setToken} />
          <hr />
          <div className='flex w-full'>
            <Sidebar />
            <div className='w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base'>
              <Routes>
                <Route path='/' element={<Dashboard token={token} />} />
                <Route path='/dashboard' element={<Dashboard token={token} />} />
                <Route path='/add' element={<Add token={token} />} />
                <Route path='/list' element={<List token={token} />} />
                <Route path='/edit/:id' element={<EditProduct token={token} />} />
                <Route path='/users' element={<Users token={token} />} />
                <Route path='/orders' element={<Orders token={token} />} />
                <Route path='/reviews' element={<AdminReviews token={token} />} />
                <Route path='/categories' element={<CategoryManagement token={token} />} />
                <Route path='/subcategories' element={<SubCategoryManagement token={token} />} />
                <Route path='/chat' element={<ChatManagement token={token} />} />
                <Route path='/blogs' element={<BlogManagement token={token} />} />
                <Route path='/stock' element={<StockManagement token={token} />} />
                <Route path='/vouchers' element={<Vouchers token={token} />} />
              </Routes>
            </div>
          </div>
          </AdminContextProvider>
        </>
      }
    </div>
  )
}

export default App
