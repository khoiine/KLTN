import React, { useEffect, useState, useContext } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'

const BlogDetail = () => {
    const { slug } = useParams()
    const { backendUrl } = useContext(ShopContext)
    const [blog, setBlog] = useState(null)
    const [relatedBlogs, setRelatedBlogs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchBlog()
        fetchRelatedBlogs()
    }, [slug])

    const fetchBlog = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/blog/${slug}`)
            if (response.data.success) {
                setBlog(response.data.blog)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const fetchRelatedBlogs = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/blog/list`)
            if (response.data.success) {
                setRelatedBlogs(response.data.blogs.slice(0, 3))
            }
        } catch (error) {
            console.log(error)
        }
    }

    if (loading) {
        return <div className='text-center py-20'>Đang tải...</div>
    }

    if (!blog) {
        return <div className='text-center py-20'>Không tìm thấy bài viết</div>
    }

    return (
        <div className='border-t pt-8'>
            {/* Breadcrumb */}
            <div className='text-sm mb-6 text-gray-500'>
                <Link to='/' className='hover:text-black'>Trang chủ</Link>
                {' > '}
                <Link to='/blog' className='hover:text-black'>Blog</Link>
                {' > '}
                <span className='text-black'>{blog.title}</span>
            </div>

            <div className='max-w-4xl mx-auto'>
                {/* Header */}
                <div className='mb-8'>
                    <span className='bg-black text-white px-4 py-1 rounded-full text-sm'>
                        {blog.category}
                    </span>
                    <h1 className='text-4xl font-bold mt-4 mb-4'>{blog.title}</h1>
                    <div className='flex items-center gap-4 text-gray-600 text-sm'>
                        <span>Bởi {blog.authorName}</span>
                        <span>•</span>
                        <span>{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</span>
                        <span>•</span>
                        <span>{blog.views} lượt xem</span>
                    </div>
                </div>

                {/* Featured Image */}
                <img 
                    src={blog.image} 
                    alt={blog.title}
                    className='w-full h-[400px] object-cover rounded-lg mb-8'
                />

                {/* Content */}
                <div 
                    className='prose prose-lg max-w-none mb-12'
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                />

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                    <div className='mb-12'>
                        <h3 className='text-lg font-semibold mb-3'>Tags:</h3>
                        <div className='flex flex-wrap gap-2'>
                            {blog.tags.map((tag, index) => (
                                <span key={index} className='bg-gray-100 px-4 py-2 rounded-full text-sm'>
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Related Blogs */}
                {relatedBlogs.length > 0 && (
                    <div>
                        <h3 className='text-2xl font-bold mb-6'>Bài viết liên quan</h3>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                            {relatedBlogs.filter(b => b._id !== blog._id).map((relatedBlog) => (
                                <Link 
                                    key={relatedBlog._id}
                                    to={`/blog/${relatedBlog.slug}`}
                                    className='bg-white rounded-lg shadow hover:shadow-lg transition-shadow'
                                >
                                    <img 
                                        src={relatedBlog.image} 
                                        alt={relatedBlog.title}
                                        className='w-full h-40 object-cover rounded-t-lg'
                                    />
                                    <div className='p-4'>
                                        <h4 className='font-semibold mb-2 line-clamp-2'>{relatedBlog.title}</h4>
                                        <p className='text-sm text-gray-600 line-clamp-2'>{relatedBlog.excerpt}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default BlogDetail