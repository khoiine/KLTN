import { useState, useEffect, useRef } from 'react'

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Xin chào! 👋\n\nTôi là trợ lý ảo của cửa hàng thời trang E-Commerce. Tôi có thể giúp bạn:\n\n• Tư vấn sản phẩm\n• Hướng dẫn đặt hàng\n• Thông tin giao hàng\n• Chính sách đổi trả\n• Khuyến mãi hiện tại\n\nBạn cần hỗ trợ gì hôm nay?",
      isBot: true,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  // Tự động cuộn xuống khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Các câu trả lời tự động đơn giản
  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase()
    
    if (message.includes('chào') || message.includes('hello') || message.includes('hi') || message.includes('xin chào')) {
      return "Xin chào! Tôi là trợ lý ảo của cửa hàng E-Commerce. Bạn cần hỗ trợ gì không ạ?"
    }
    
    if (message.includes('sản phẩm') || message.includes('hàng hóa') || message.includes('shop')) {
      return "Chúng tôi có nhiều sản phẩm thời trang chất lượng cao. Bạn có thể xem tại trang Bộ sưu tập hoặc tìm kiếm sản phẩm cụ thể bằng thanh tìm kiếm."
    }
    
    if (message.includes('giao hàng') || message.includes('vận chuyển') || message.includes('ship')) {
      return "🚚 Chúng tôi có hỗ trợ giao hàng toàn quốc:\n• Giao hàng nhanh từ: 2-3 ngày\n• Miễn phí ship cho đơn hàng trên 500.000đ"
    }
    
    if (message.includes('thanh toán') || message.includes('payment') || message.includes('trả tiền')) {
      return "💳 Chúng tôi hỗ trợ các hình thức thanh toán như:\n• ZaloPay\n• COD (Thanh toán khi nhận hàng)"
    }
    
    if (message.includes('liên hệ') || message.includes('contact') || message.includes('hotline')) {
      return "📞 Liên hệ với chúng tôi:\n• Hotline: 0904.512.575\n• Email: contact@gmail.com.com\n• Hoặc qua trang Liên hệ của website"
    }
    
    if (message.includes('size') || message.includes('kích thước') || message.includes('số đo') || message.includes('kích cỡ')) {
      return "📏 Về size sản phẩm:\n• Xem bảng size chi tiết tại mỗi sản phẩm\n• Tư vấn size miễn phí\n• Hỗ trợ đổi size trong 7 ngày"
    }
    
    if (message.includes('đổi trả') || message.includes('return') || message.includes('hoàn trả')) {
      return "🔄 Chính sách đổi trả:\n• Thời gian: 7 ngày kể từ khi nhận hàng\n• Điều kiện: Còn nguyên tem mác, chưa sử dụng\n• Miễn phí đổi trả lần đầu"
    }
    
    if (message.includes('giảm giá') || message.includes('khuyến mãi') || message.includes('sale') || message.includes('voucher')) {
      return "🎉 Khuyến mãi hiện tại:\n• Giảm 20% cho khách hàng mới\n• Mua 2 tặng 1 cho một số sản phẩm\n• Flash sale cuối tuần\n• Đăng ký nhận tin để cập nhật ưu đãi!"
    }
    
    if (message.includes('đơn hàng') || message.includes('order') || message.includes('mua hàng')) {
      return "📦 Về đơn hàng:\n• Theo dõi đơn hàng tại trang Đơn hàng\n• Xác nhận đơn hàng qua email/SMS\n• Hỗ trợ hủy/sửa đơn trước khi giao"
    }
    
    if (message.includes('tài khoản') || message.includes('đăng ký') || message.includes('login') || message.includes('account') || message.includes('acc')) {
      return "👤 Tài khoản của bạn:\n• Đăng ký miễn phí để mua hàng\n• Theo dõi đơn hàng dễ dàng\n• Nhận thông báo ưu đãi đặc biệt"
    }
    
    // Phản hồi mặc định với gợi ý
    return "Cảm ơn bạn đã liên hệ! 😊\n\nTôi có thể hỗ trợ bạn về:\n• Sản phẩm và mua hàng\n• Giao hàng và thanh toán\n• Đổi trả và bảo hành\n• Khuyến mãi hiện tại\n\nHoặc liên hệ trực tiếp qua trang Liên hệ nhé!"
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    // Thêm tin nhắn của user
    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')

    // Hiển thị typing indicator
    setIsTyping(true)

    // Sau 1-2 giây thêm phản hồi của bot
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        text: getBotResponse(inputMessage),
        isBot: true,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000) // Random từ 1-2 giây để tự nhiên hơn
  }

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <>
      {/* Nút chat nổi */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 transform hover:scale-110"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )}
        </button>
        
        {/* Thông báo có tin nhắn mới */}
        {!isOpen && (
          <div className="absolute -top-2 -left-2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            •
          </div>
        )}
      </div>

      {/* Cửa sổ chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-lg shadow-2xl border z-50 flex flex-col">
          {/* Header */}
          <div className="bg-red-500 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-400 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H11V21H5V3H13V9H21Z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Chat tư vấn</h3>
                <p className="text-xs opacity-80">Hỗ trợ 24/7</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isBot
                      ? 'bg-white text-gray-800 shadow-sm border'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.isBot ? 'text-gray-500' : 'text-red-100'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Typing indicator khi bot đang trả lời */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 shadow-sm border p-3 rounded-lg">
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">Đang trả lời...</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Phần tử để cuộn xuống */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Nhập nội dung..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <button
                type="submit"
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                disabled={!inputMessage.trim()}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

export default Chatbot
