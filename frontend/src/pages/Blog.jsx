import React, { useEffect, useState, useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import axios from 'axios'
import { Link } from 'react-router-dom'

const Blog = () => {
    const { backendUrl } = useContext(ShopContext)
    const [blogs, setBlogs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchBlogs()
    }, [])

    const fetchBlogs = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/blog/list`)
            if (response.data.success) {
                setBlogs(response.data.blogs)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className='text-center py-20'>Đang tải...</div>
    }

    return (
        <div className='border-t pt-8'>
            <div className='text-center text-3xl mb-10'>
                <Title text1={'TIN TỨC &'} text2={'BÀI VIẾT'} />
            </div>

            {blogs.length === 0 ? (
                <div className='text-center text-gray-500 py-10'>
                    Chưa có bài viết nào
                </div>
            ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
                    {blogs.map((blog) => (
                        <Link 
                            key={blog._id} 
                            to={`/blog/${blog.slug}`}
                            className='bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow'
                        >
                            <div className='relative pb-[100%] overflow-hidden'>
                                <img 
                                    src={blog.image} 
                                    alt={blog.title}
                                    className='absolute inset-0 w-full h-full bg-cover bg-center hover:scale-110 transition-transform duration-300'
                                />
                            </div>
                            <div className='p-5'>
                                <div className='flex items-center gap-3 mb-3'>
                                    <span className='text-xs bg-black text-white px-3 py-1 rounded-full'>
                                        {blog.category}
                                    </span>
                                    <span className='text-xs text-gray-500'>
                                        {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                                <h3 className='text-xl font-bold mb-2 line-clamp-2 hover:text-gray-600'>
                                    {blog.title}
                                </h3>
                                <p className='text-gray-600 text-sm line-clamp-3 mb-3'>
                                    {blog.excerpt}
                                </p>
                                <div className='flex items-center justify-between text-sm'>
                                    <span className='text-gray-500'>Bởi {blog.authorName}</span>
                                    <span className='text-gray-400'>{blog.views} lượt xem</span>
                                </div>
                                <div className='mt-4'>
                                    <span className='text-black font-medium hover:underline'>
                                        Đọc thêm →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Blog