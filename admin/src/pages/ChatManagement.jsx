import React, { useEffect, useState, useRef } from 'react'
import { backendUrl } from '../App'
import axios from 'axios'
import { toast } from 'react-toastify'
import { io as ClientIO } from 'socket.io-client'
import { AdminContext } from '../context/AdminContext'
import { useContext } from 'react'

const ChatManagement = ({ token }) => { // ✅ Must be a component function
    const [chats, setChats] = useState([])
    const [selectedChat, setSelectedChat] = useState(null)
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef(null)
    const socketRef = useRef(null)
    const messageContainerRef = useRef(null)

    const { fetchUnreadCount, setUnreadCount } = useContext(AdminContext)

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
                setSelectedChat(prev => {
                    if (prev && prev._id === chatId) {
                        return { ...prev, messages: [...prev.messages, newMsg] }
                    }
                    return prev
                })
                fetchChats()

                // Update unread count in sidebar
                fetchUnreadCount()

                // If viewing this chat and message is from user, mark as read
                if (selectedChat?._id === chatId && newMsg.senderRole === 'user') {
                    setTimeout(() => {
                        axios.post(
                            `${backendUrl}/api/chat/admin-mark-read`,
                            { chatId },
                            { headers: { token } }
                        ).then(() => {
                            fetchUnreadCount() // Update sidebar
                            fetchChats() // Remove bold from chat list
                        })
                    }, 1000)
                }
            })

            socketRef.current.on('disconnect', () => {
                console.log('Socket disconnected')
            })
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect()
                socketRef.current = null
            }
        }
    }, [token, selectedChat?._id])

    // Join chat room when selected
    useEffect(() => {
        if (socketRef.current && selectedChat?._id) {
            socketRef.current.emit('chat:join', selectedChat._id)
            console.log('Joined chat room:', selectedChat._id)
        }
    }, [selectedChat?._id])

    useEffect(() => {
        fetchChats()
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [selectedChat?.messages])

    // Scroll when chat is first selected
    useEffect(() => {
        if (selectedChat) {
            setTimeout(scrollToBottom, 100)
        }
    }, [selectedChat?._id])

    const fetchChats = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/chat/all`, {
                headers: { token }
            })

            if (response.data.success) {
                setChats(response.data.chats)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const fetchChatById = async (chatId) => {
        try {
            const response = await axios.post(
                `${backendUrl}/api/chat/get-by-id`,
                { chatId },
                { headers: { token } }
            )

            if (response.data.success) {
                setSelectedChat(response.data.chat)

                // Mark user messages as read for this chat
                await axios.post(
                    `${backendUrl}/api/chat/admin-mark-read`,
                    { chatId },
                    { headers: { token } }
                )

                // Update both sidebar count and chat list bold state
                fetchUnreadCount()
                fetchChats()
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()

        if (!message.trim() || !selectedChat) {
            toast.error('Vui lòng nhập tin nhắn')
            return
        }

        const tempMessage = message
        setMessage('') // Clear input immediately

        try {
            setLoading(true)
            const response = await axios.post(
                `${backendUrl}/api/chat/admin-send`,
                {
                    chatId: selectedChat._id,
                    message: tempMessage
                },
                { headers: { token } }
            )

            if (!response.data.success) {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit'
        })
    }

    return (
        <div className='flex gap-4 h-[calc(100vh-120px)]'>
            {/* Chat List */}
            <div className='w-1/3 bg-white rounded-lg shadow overflow-hidden'>
                <div className='bg-gray-800 text-white p-4'>
                    <h2 className='text-lg font-semibold'>Danh sách trò chuyện</h2>
                    <p className='text-sm text-gray-300'>Tổng: {chats.length} cuộc hội thoại</p>
                </div>
                <div className='overflow-y-auto h-[calc(100%-80px)]'>
                    {chats.map((chat) => {
                        const hasUnread = chat.messages?.some(m => m.senderRole === 'user' && !m.read)

                        return (
                            <div
                                key={chat._id}
                                onClick={() => fetchChatById(chat._id)}
                                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedChat?._id === chat._id ? 'bg-blue-50' : ''
                                    }`}
                            >
                                <div className='flex justify-between items-start gap-3'>
                                    <div className='min-w-0'>
                                        <p className={`${hasUnread ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                            {chat.userName}
                                        </p>
                                        <p className='text-sm text-gray-500'>{chat.userEmail}</p>

                                        {chat.messages.length > 0 && (
                                            <p className={`text-sm mt-1 truncate ${hasUnread ? 'font-medium text-gray-900' : 'text-gray-600'
                                                }`}>
                                                {chat.messages[chat.messages.length - 1].message}
                                            </p>
                                        )}
                                    </div>

                                    <div className='flex items-start gap-2 shrink-0'>
                                        {hasUnread && (
                                            <span className='mt-1 inline-block w-2.5 h-2.5 bg-red-500 rounded-full' title='Tin nhắn mới' />
                                        )}
                                        <span className='text-xs text-gray-400'>{formatTime(chat.lastMessage)}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Chat Window */}
            <div className='flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col'>
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div className='bg-gray-800 text-white p-4 flex justify-between items-center'>
                            <div>
                                <h2 className='text-lg font-semibold'>{selectedChat.userName}</h2>
                                <p className='text-sm text-gray-300'>{selectedChat.userEmail}</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div
                            ref={messageContainerRef}
                            className='flex-1 overflow-y-auto p-4 bg-gray-50'
                        >
                            {selectedChat.messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`mb-4 flex ${msg.senderRole === 'admin' ? 'justify-end' : 'justify-start'
                                        }`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-lg p-3 ${msg.senderRole === 'admin'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white border border-gray-300'
                                            }`}
                                    >
                                        <p className='text-sm font-semibold mb-1'>
                                            {msg.senderRole === 'admin' ? 'Admin' : msg.senderName}
                                        </p>
                                        <p className='break-words'>{msg.message}</p>
                                        <p className='text-xs mt-2 opacity-70'>
                                            {formatTime(msg.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <form onSubmit={handleSendMessage} className='p-4 bg-white border-t'>
                            <div className='flex gap-2'>
                                <input
                                    type='text'
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    placeholder='Nhập tin nhắn...'
                                    disabled={loading || selectedChat.status === 'closed'}
                                />
                                <button
                                    type='submit'
                                    disabled={loading || selectedChat.status === 'closed'}
                                    className='bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400'
                                >
                                    {loading ? 'Đang gửi...' : 'Gửi'}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className='flex-1 flex items-center justify-center text-gray-500'>
                        <p>Chọn một cuộc trò chuyện để bắt đầu</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ChatManagement