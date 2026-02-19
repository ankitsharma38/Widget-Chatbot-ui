import React, { useEffect, useRef } from 'react'
import MessageItem from './MessageItem'

const MessageList = ({ messages, isLoading }) => {
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col">
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2 px-2">
            <h2 className="text-base font-semibold text-gray-800">How can I help you today?</h2>
            <p className="text-xs text-gray-500 max-w-[240px] leading-relaxed">
              Ask me anything about pest control, animal removal, or our services.
            </p>
          </div>
        ) : (
          <>
            {messages
              .filter((msg) => msg.content)
              .map((msg, idx) => (
                <MessageItem key={idx} message={msg} />
              ))}

            {isLoading && (
              <div className="flex justify-start mb-8">
                <div className="max-w-[85%]">
                  <div className="bg-white border border-gray-300 rounded-2xl rounded-tl-none px-4 py-3">
                    <div className="flex gap-1.5 items-center">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse delay-75"></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

export default MessageList
