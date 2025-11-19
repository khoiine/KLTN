import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

const BlogManagement = ({ token }) => {
    const [blogs, setBlogs] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [currentBlog, setCurrentBlog] = useState(null)

    const [title, setTitle] = useState('')
    const [excerpt, setExcerpt] = useState('')
    const [content, setContent] = useState('')
    const [category, setCategory] = useState('')
    const [tags, setTags] = useState('')
    const [status, setStatus] = useState('draft')
    const [featured, setFeatured] = useState(false)
    const [image, setImage] = useState(null)
    const [previewImage, setPreviewImage] = useState('')

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            ['link', 'image'],
            ['clean']
        ]
    }

    useEffect(() => {
        fetchBlogs()
    }, [])

    const fetchBlogs = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/blog/admin/list`, {
                headers: { token }
            })
            if (response.data.success) {
                setBlogs(response.data.blogs)
            }
        } catch (error) {
            console.log(error)
            toast.error('Không thể tải danh sách blog')
        }
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        setImage(file)
        if (file) {
            setPreviewImage(URL.createObjectURL(file))
        }
    }

    const resetForm = () => {
        setTitle('')
        setExcerpt('')
        setContent('')
        setCategory('')
        setTags('')
        setStatus('draft')
        setFeatured(false)
        setImage(null)
        setPreviewImage('')
        setCurrentBlog(null)
        setEditMode(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const formData = new FormData()
            formData.append('title', title)
            formData.append('excerpt', excerpt)
            formData.append('content', content)
            formData.append('category', category)
            formData.append('tags', tags)
            formData.append('status', status)
            formData.append('featured', featured)
            
            if (image) {
                formData.append('image', image)
            }

            if (editMode && currentBlog) {
                formData.append('id', currentBlog._id)
                const response = await axios.post(`${backendUrl}/api/blog/update`, formData, {
                    headers: { token }
                })

                if (response.data.success) {
                    toast.success('Cập nhật blog thành công')
                    fetchBlogs()
                    setShowModal(false)
                    resetForm()
                } else {
                    toast.error(response.data.message)
                }
            } else {
                const response = await axios.post(`${backendUrl}/api/blog/add`, formData, {
                    headers: { token }
                })

                if (response.data.success) {
                    toast.success('Tạo blog thành công')
                    fetchBlogs()
                    setShowModal(false)
                    resetForm()
                } else {
                    toast.error(response.data.message)
                }
            }
        } catch (error) {
            console.log(error)
            toast.error('Đã xảy ra lỗi')
        }
    }

    const handleEdit = (blog) => {
        setCurrentBlog(blog)
        setTitle(blog.title)
        setExcerpt(blog.excerpt)
        setContent(blog.content)
        setCategory(blog.category)
        setTags(blog.tags.join(', '))
        setStatus(blog.status)
        setFeatured(blog.featured)
        setPreviewImage(blog.image)
        setEditMode(true)
        setShowModal(true)
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa blog này?')) return

        try {
            const response = await axios.post(`${backendUrl}/api/blog/remove`, 
                { id },
                { headers: { token } }
            )

            if (response.data.success) {
                toast.success('Xóa blog thành công')
                fetchBlogs()
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error('Không thể xóa blog')
        }
    }

    return (
        <div className='p-4'>
            <div className='flex justify-between items-center mb-6'>
                <h1 className='text-2xl font-bold'>Quản lý Tin tức</h1>
                <button
                    onClick={() => {
                        resetForm()
                        setShowModal(true)
                    }}
                    className='bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600'
                >
                    Tạo Blog Mới
                </button>
            </div>

            {/* Blog List */}
            <div className='bg-white rounded-lg shadow overflow-hidden'>
                <table className='w-full'>
                    <thead className='bg-gray-100'>
                        <tr>
                            <th className='text-left p-4'>Hình ảnh</th>
                            <th className='text-left p-4'>Tiêu đề</th>
                            <th className='text-left p-4'>Danh mục</th>
                            <th className='text-left p-4'>Trạng thái</th>
                            <th className='text-left p-4'>Lượt xem</th>
                            <th className='text-left p-4'>Ngày tạo</th>
                            <th className='text-left p-4'>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {blogs.map((blog) => (
                            <tr key={blog._id} className='border-b hover:bg-gray-50'>
                                <td className='p-4'>
                                    <img src={blog.image} alt={blog.title} className='w-20 h-20 object-cover rounded' />
                                </td>
                                <td className='p-4'>
                                    <div>
                                        <p className='font-semibold'>{blog.title}</p>
                                        {blog.featured && (
                                            <span className='text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded'>Nổi bật</span>
                                        )}
                                    </div>
                                </td>
                                <td className='p-4'>{blog.category}</td>
                                <td className='p-4'>
                                    <span className={`p-1 rounded text-sm ${
                                        blog.status === 'published' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {blog.status === 'published' ? 'Xuất bản' : 'Ẩn bài'}
                                    </span>
                                </td>
                                <td className='p-4'>{blog.views}</td>
                                <td className='p-4'>{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</td>
                                <td className='p-4 flex gap-1 mt-5'>
                                    <button
                                        onClick={() => handleEdit(blog)}
                                        className='px-4 py-2 bg-blue-600 text-white rounded'
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDelete(blog._id)}
                                        className='px-4 py-2 bg-red-600 text-white rounded'
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
                        <div className='p-6'>
                            <h2 className='text-2xl font-bold mb-4'>
                                {editMode ? 'Chỉnh sửa Blog' : 'Tạo Blog Mới'}
                            </h2>

                            <form onSubmit={handleSubmit}>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                                    <div>
                                        <label className='block text-sm font-medium mb-2'>Tiêu đề</label>
                                        <input
                                            type='text'
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className='w-full p-2 border rounded'
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className='block text-sm font-medium mb-2'>Danh mục</label>
                                        <input
                                            type='text'
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className='w-full p-2 border rounded'
                                            required
                                        />
                                    </div>
                                </div>

                                <div className='mb-4'>
                                    <label className='block text-sm font-medium mb-2'>Mô tả ngắn</label>
                                    <textarea
                                        value={excerpt}
                                        onChange={(e) => setExcerpt(e.target.value)}
                                        className='w-full p-2 border rounded'
                                        rows='3'
                                        required
                                    />
                                </div>

                                <div className='mb-4'>
                                    <label className='block text-sm font-medium mb-2'>Nội dung</label>
                                    <ReactQuill
                                        theme="snow"
                                        value={content}
                                        onChange={setContent}
                                        modules={modules}
                                        className='bg-white'
                                    />
                                </div>

                                <div className='mb-4'>
                                    <label className='block text-sm font-medium mb-2'>Tags (phân cách bằng dấu phẩy)</label>
                                    <input
                                        type='text'
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        className='w-full p-2 border rounded'
                                        placeholder='thời trang, xu hướng, mùa hè'
                                    />
                                </div>

                                <div className='mb-4'>
                                    <label className='block text-sm font-medium mb-2'>Hình ảnh</label>
                                    <input
                                        type='file'
                                        onChange={handleImageChange}
                                        className='w-full p-2 border rounded'
                                        accept='image/*'
                                        required={!editMode}
                                    />
                                    {previewImage && (
                                        <img src={previewImage} alt='Preview' className='mt-2 w-40 h-40 object-cover rounded' />
                                    )}
                                </div>

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                                    <div>
                                        <label className='block text-sm font-medium mb-2'>Trạng thái</label>
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className='w-full p-2 border rounded'
                                        >
                                            <option value='draft'>Ẩn bài</option>
                                            <option value='published'>Xuất bản</option>
                                        </select>
                                    </div>

                                    <div className='flex items-center'>
                                        <input
                                            type='checkbox'
                                            checked={featured}
                                            onChange={(e) => setFeatured(e.target.checked)}
                                            className='mr-2'
                                        />
                                        <label className='text-sm font-medium'>Blog nổi bật</label>
                                    </div>
                                </div>

                                <div className='flex justify-end gap-4'>
                                    <button
                                        type='button'
                                        onClick={() => {
                                            setShowModal(false)
                                            resetForm()
                                        }}
                                        className='px-6 py-2 border rounded-lg hover:bg-gray-50'
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type='submit'
                                        className='px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600'
                                    >
                                        {editMode ? 'Cập nhật' : 'Tạo mới'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BlogManagement