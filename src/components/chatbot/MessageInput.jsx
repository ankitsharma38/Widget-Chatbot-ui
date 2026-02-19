import React, { useRef, useEffect } from 'react'
import { Send, Square } from 'lucide-react'

const MessageInput = ({ input, setInput, onSendMessage, isLoading, onStopGeneration, threadId }) => {
  const textareaRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isLoading, threadId])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(e)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="relative bg-white border border-gray-300 rounded-2xl shadow-sm focus-within:border-blue-500/50 transition-all duration-200"
        >
          <textarea
            ref={textareaRef}
            rows="1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="w-full bg-transparent text-gray-900 placeholder-gray-500 py-[18px] pl-4 pr-16 resize-none focus:outline-none text-sm min-h-[56px] max-h-[200px] leading-relaxed overflow-hidden"
            disabled={isLoading}
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isLoading ? (
              <button
                type="button"
                onClick={onStopGeneration}
                className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-200"
                title="Stop generation"
              >
                <Square size={18} fill="currentColor" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2.5 bg-blue-600 text-white hover:bg-blue-500 disabled:bg-gray-200 disabled:text-gray-500 rounded-xl transition-all duration-200"
              >
                <Send size={18} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default MessageInput
