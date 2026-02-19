import React, { useRef, useEffect } from 'react'
import { Send, Square } from 'lucide-react'
import { getWidgetConfig } from '../../hooks/useWidgetConfig'

const MessageInput = ({ input, setInput, onSendMessage, isLoading, onStopGeneration, threadId }) => {
  const textareaRef = useRef(null)
  const cfg = getWidgetConfig()

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
    <div className="p-4 sm:p-5">
      <div className="max-w-4xl mx-auto">
        <form
          onSubmit={handleSubmit}
          style={{ 
            borderColor: '#e5e7eb',
            background: '#fff',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}
          onFocusCapture={(e) => { e.currentTarget.style.borderColor = cfg.colorPrimary; e.currentTarget.style.boxShadow = `0 0 0 1px ${cfg.colorPrimary}44` }}
          onBlurCapture={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)' }}
        >
          <textarea
            ref={textareaRef}
            rows="1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            style={{
              width: '100%',
              background: 'transparent',
              color: '#111827',
              paddingTop: '16px',
              paddingBottom: '16px',
              paddingLeft: '16px',
              paddingRight: '60px',
              resize: 'none',
              outline: 'none',
              fontSize: '14px',
              minHeight: '56px',
              maxHeight: '200px',
              lineHeight: '1.5',
              border: 'none',
              fontFamily: 'inherit'
            }}
            disabled={isLoading}
          />

          <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isLoading ? (
              <button
                type="button"
                onClick={onStopGeneration}
                style={{
                  padding: '8px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Stop generation"
              >
                <Square size={18} fill="currentColor" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                style={{
                  padding: '10px',
                  background: !input.trim() ? '#f3f4f6' : cfg.colorPrimary,
                  color: !input.trim() ? '#9ca3af' : cfg.colorText,
                  borderRadius: '12px',
                  border: 'none',
                  cursor: !input.trim() ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
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
