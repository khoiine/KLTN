import { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import { toast } from 'react-toastify'

const Profile = () => {
    const { token, backendUrl, navigate, userInfo, fetchUserInfo } = useContext(ShopContext)
    
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        district: '',
        phone: ''
    })

    useEffect(() => {
        if (!token) {
            navigate('/login')
            return
        }
        
        if (userInfo) {
            const nameParts = userInfo.name ? userInfo.name.split(' ') : ['', ''];
            setProfileData({
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
                email: userInfo.email || '',
                street: userInfo.address || '',
                city: userInfo.city || '',
                state: userInfo.ward || '',
                district: userInfo.district || '',
                phone: userInfo.phone || ''
            })
        }
    }, [token, navigate, userInfo])

    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        setProfileData(prev => ({ ...prev, [name]: value }))
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault()
        
        try {
            // Convert back to database format
            const updateData = {
                name: `${profileData.firstName} ${profileData.lastName}`.trim(),
                phone: profileData.phone,
                address: profileData.street,
                city: profileData.city,
                district: profileData.district,
                ward: profileData.state
            }

            const response = await fetch(backendUrl + '/api/user/update-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    token
                },
                body: JSON.stringify(updateData)
            })

            const result = await response.json()

            if (result.success) {
                toast.success('Cập nhật thông tin thành công!')
                fetchUserInfo() // Refresh user info
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            console.log(error)
            toast.error('Có lỗi xảy ra')
        }
    }

    if (!token) {
        return null
    }

    return (
        <div className='border-t pt-16'>
            <div className='text-2xl'>
                <Title text1={'THÔNG TIN'} text2={'CÁ NHÂN'} />
            </div>

            <div className='flex gap-10 flex-col sm:flex-row mt-8'>
                {/* Delivery Information Form */}
                <div className='flex-1'>
                    <form onSubmit={onSubmitHandler} className='flex flex-col gap-4'>
                        <div className='flex gap-3'>
                            <input
                                required
                                className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                                type="text"
                                placeholder='Họ'
                                name='firstName'
                                onChange={onChangeHandler}
                                value={profileData.firstName}
                            />
                            <input
                                required
                                className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                                type="text"
                                placeholder='Tên đệm và Tên'
                                name='lastName'
                                onChange={onChangeHandler}
                                value={profileData.lastName}
                            />
                        </div>
                        
                        <input
                            required
                            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                            type="email"
                            placeholder='Nhập địa chỉ Email'
                            name='email'
                            onChange={onChangeHandler}
                            value={profileData.email}
                            disabled
                        />
                        
                        <input
                            required
                            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                            type="text"
                            placeholder='Địa chỉ'
                            name='street'
                            onChange={onChangeHandler}
                            value={profileData.street}
                        />

                        <input
                            required
                            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                            type="text"
                            placeholder='Tỉnh/Thành phố'
                            name='city'
                            onChange={onChangeHandler}
                            value={profileData.city}
                        />
                        
                        <div className='flex gap-3'>
                            <input
                                required
                                className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                                type="text"
                                placeholder='Phường'
                                name='state'
                                onChange={onChangeHandler}
                                value={profileData.state}
                            />
                            <input
                                required
                                className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                                type="text"
                                placeholder='Quận/Huyện'
                                name='district'
                                onChange={onChangeHandler}
                                value={profileData.district}
                            />
                        </div>

                        <input
                            required
                            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                            type="number"
                            placeholder='Số điện thoại'
                            name='phone'
                            onChange={onChangeHandler}
                            value={profileData.phone}
                        />

                        <div className='w-full text-end'>
                            <button className='bg-black text-white py-2 px-8 text-sm' type='submit'>
                                CẬP NHẬT THÔNG TIN
                            </button>
                        </div>
                    </form>
                </div>

                {/* Profile Info Display */}
                <div className='flex-1'>
                    <div className='bg-gray-50 p-6 rounded-lg'>
                        <h3 className='text-lg font-medium mb-4'>Thông tin hiện tại</h3>
                        <div className='space-y-2 text-sm'>
                            <p><span className='font-medium'>Họ:</span> {userInfo?.name?.split(' ')[0] || 'Chưa cập nhật'}</p>
                            <p><span className='font-medium'>Tên đệm và Tên:</span> {userInfo?.name?.split(' ').slice(1).join(' ') || 'Chưa cập nhật'}</p>
                            <p><span className='font-medium'>Email:</span> {userInfo?.email || 'Chưa cập nhật'}</p>
                            <p><span className='font-medium'>Địa chỉ:</span> {userInfo?.address || 'Chưa cập nhật'}</p>
                            <p><span className='font-medium'>Tỉnh/Thành phố:</span> {userInfo?.city || 'Chưa cập nhật'}</p>
                            <p><span className='font-medium'>Phường:</span> {userInfo?.ward || 'Chưa cập nhật'}</p>
                            <p><span className='font-medium'>Quận/Huyện:</span> {userInfo?.district || 'Chưa cập nhật'}</p>
                            <p><span className='font-medium'>Số điện thoại:</span> {userInfo?.phone || 'Chưa cập nhật'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile
