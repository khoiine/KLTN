import React, { useContext, useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import Title from '../components/Title'
import { io as ClientIO } from 'socket.io-client'
import { ShopContext } from '../context/ShopContext'

const Chat = () => {
    const { backendUrl, token, navigate, fetchUnreadCount, setUnreadCount } = useContext(ShopContext)
    const [chat, setChat] = useState(null)
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef(null)
    const socketRef = useRef(null)
    const messageContainerRef = useRef(null)

    const scrollToBottom = () => {
        // Multiple methods to ensure scroll works
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
        }

        // Fallback: scroll container directly
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight
        }
    }

    useEffect(() => {
        if (!token) {
            navigate('/login')
            return
        }
        fetchChat()
        markMessagesAsRead()
    }, [token])

    // Mark messages as read when user opens chat
    const markMessagesAsRead = async () => {
        try {
            await axios.post(
                `${backendUrl}/api/chat/mark-read`,
                {},
                { headers: { token } }
            )
            setUnreadCount(0)
            fetchUnreadCount()
        } catch (error) {
            console.log(error)
        }
    }

    // Socket connection
    useEffect(() => {
        if (!token) return

        if (!socketRef.current) {
            socketRef.current = ClientIO(backendUrl, {
                auth: { token },
                transports: ['websocket', 'polling']
            })

            socketRef.current.on('connect', () => {
                console.log('Socket connected')
            })

            socketRef.current.on('message:new', ({ chatId, message: newMsg }) => {
                console.log('New message received:', newMsg)
                setChat(prev => {
                    if (prev && prev._id === chatId) {
                        return { ...prev, messages: [...prev.messages, newMsg] }
                    }
                    return prev
                })
                // If message is from admin, mark as read immediately since user is viewing
                if (newMsg.senderRole === 'admin') {
                    markMessagesAsRead()
                }
            })
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect()
                socketRef.current = null
            }
        }
    }, [token])

    // Join chat room
    useEffect(() => {
        if (socketRef.current && chat?._id) {
            socketRef.current.emit('chat:join', chat._id)
            console.log('Joined chat room:', chat._id)
        }
    }, [chat?._id])

    // Scroll when messages change
    useEffect(() => {
        scrollToBottom()
    }, [chat?.messages])

    // Scroll when chat first loads
    useEffect(() => {
        if (chat) {
            setTimeout(scrollToBottom, 100)
        }
    }, [chat])

    const fetchChat = async () => {
        try {
            const response = await axios.post(
                `${backendUrl}/api/chat/get-user-chat`,
                {},
                { headers: { token } }
            )

            if (response.data.success) {
                setChat(response.data.chat)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()

        if (!message.trim()) {
            toast.error('Vui lòng nhập tin nhắn')
            return
        }

        const tempMessage = message
        setMessage('') // Clear input immediately

        try {
            setLoading(true)
            await axios.post(
                `${backendUrl}/api/chat/send-message`,
                { message: tempMessage, chatId: chat._id },
                { headers: { token } }
            )
            setLoading(false)
        } catch (error) {
            setLoading(false)
            console.log(error)
        }
    }

    const formatTime = (timestamp) => {
        const date = new Date(timestamp)
        return date.toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    return (

            <div className='max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden'>
                {/* Chat Header */}
                <div className='bg-black text-white p-4'>
                    <h2 className='text-lg font-semibold'>Hỗ trợ khách hàng</h2>
                    <p className='text-sm text-gray-300'>Chúng tôi sẽ phản hồi sớm nhất có thể</p>
                </div>

                {/* Messages Area */}
                <div
                    ref={messageContainerRef}
                    className='h-[500px] overflow-y-auto p-4 bg-gray-50'
                >
                    {chat?.messages && chat.messages.length > 0 ? (
                        chat.messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`mb-4 flex ${msg.senderRole === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-lg p-3 ${msg.senderRole === 'user'
                                            ? 'bg-black text-white'
                                            : 'bg-white border border-gray-300'
                                        }`}
                                >
                                    <p className='text-sm font-semibold mb-1'>
                                        {msg.senderRole === 'admin' ? 'Admin' : 'Bạn'}
                                    </p>
                                    <p className='break-words'>{msg.message}</p>
                                    <p className='text-xs mt-2 opacity-70'>
                                        {formatTime(msg.timestamp)}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className='text-center text-gray-500 mt-8'>
                            <p>Chưa có tin nhắn nào</p>
                            <p className='text-sm mt-2'>Gửi tin nhắn đầu tiên để bắt đầu trò chuyện</p>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Nhâp tin nhắn*/}
                <form onSubmit={handleSendMessage} className='p-4 bg-white border-t'>
                    <div className='flex gap-2'>
                        <input
                            type='text'
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black'
                            placeholder='Nhập tin nhắn...'
                            disabled={loading}
                        />
                        <button
                            type='submit'
                            disabled={loading}
                            className='bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400'
                        >
                            {loading ? 'Đang gửi...' : 'Gửi'}
                        </button>
                    </div>
                </form>
            </div>
    )
}

export default Chat