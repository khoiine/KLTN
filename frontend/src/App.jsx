import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Collection from './pages/Collection'
import About from './pages/About'
import Contact from './pages/Contact'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Login from './pages/Login'
import PlaceOrder from './pages/PlaceOrder'
import Orders from './pages/Orders'
import PaymentResult from './pages/PaymentResult'
import CancelOrder from './pages/CancelOrder'
import Profile from './pages/Profile'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
import Chatbot from './components/Chatbot'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ChangePassword from './pages/ChangePassword';
import Chat from './pages/Chat';
import Blog from './pages/Blog'
import BlogDetail from './pages/BlogDetail'

export const backendUrl = import.meta.env.VITE_BACKEND_URL

export const formatVND = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
    .format(typeof value === 'number' ? value : Number(value || 0));

const App = () => {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <ToastContainer />
      <Navbar />
      <SearchBar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/collection' element={<Collection />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/product/:productId' element={<Product />} />
        <Route path='cart' element={<Cart />} />
        <Route path='login' element={<Login />} />
        <Route path='/place-order' element={<PlaceOrder />} />
        <Route path='/orders' element={<Orders />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/payment-result' element={<PaymentResult />} />
        <Route path='/cancel-order' element={<CancelOrder />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password/:token' element={<ResetPassword />} />
        <Route path='/change-password' element={<ChangePassword />} />
        <Route path='/chat' element={<Chat />} />
        <Route path='/blog' element={<Blog />} />
        <Route path='/blog/:slug' element={<BlogDetail />} />
      </Routes>
      <Footer />

      {/* Chatbot luôn hiển thị trên tất cả các trang */}
      <Chatbot />
    </div>
  )
}

export default App
