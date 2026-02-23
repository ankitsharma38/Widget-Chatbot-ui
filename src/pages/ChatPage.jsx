import React, { useEffect, useRef, useState } from 'react'
import Header from '../components/chatbot/Header'
import MessageList from '../components/chatbot/MessageList'
import MessageInput from '../components/chatbot/MessageInput'
import { getWidgetConfig } from '../hooks/useWidgetConfig'

const ChatPage = () => {
  const [threadId, setThreadId] = useState(() => sessionStorage.getItem('currentThreadId') || null)

  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('messages')
    return saved ? JSON.parse(saved) : []
  })

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const abortControllerRef = useRef(null)

  useEffect(() => {
    sessionStorage.setItem('messages', JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    if (threadId) sessionStorage.setItem('currentThreadId', threadId)
  }, [threadId])

  const resetConversation = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort()
    setMessages([])
    setThreadId(null)
    setInput('')
    setIsLoading(false)
    sessionStorage.removeItem('messages')
    sessionStorage.removeItem('currentThreadId')
  }

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsLoading(false)
    }
  }

  const sendMessage = async (e) => {
    if (e) e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    abortControllerRef.current = new AbortController()

    try {
      const cfg = getWidgetConfig()
      const response = await fetch('http://localhost:8000/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          thread_id: threadId,
          company: cfg.company || 'woyce'
        }),
        signal: abortControllerRef.current.signal,
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let botResponse = ''
      let displayedLength = 0
      let hasStartedText = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (trimmedLine.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmedLine.slice(6))

              if (data.thread_id && !threadId) setThreadId(data.thread_id)

              // Handle metadata/heartbeats - keep loading dots visible, but show no text
              if (data.heartbeat) {
                continue
              }

              if (data.content) {
                if (!hasStartedText) {
                  hasStartedText = true
                  setIsLoading(false) // Hide the three-dot loader
                  botResponse = data.content
                  // Add the assistant bubble only when we have actual text
                  setMessages((prev) => [...prev, { role: 'assistant', content: '' }])
                } else {
                  botResponse += data.content
                }

                while (displayedLength < botResponse.length) {
                  if (abortControllerRef.current?.signal.aborted) break
                  displayedLength++
                  const displayText = botResponse.substring(0, displayedLength)
                  
                  setMessages((prev) => {
                    const updated = [...prev]
                    const last = updated[updated.length - 1]
                    if (last && last.role === 'assistant') {
                      updated[updated.length - 1] = { ...last, content: displayText }
                    }
                    return updated
                  })
                  
                  // Keep it smooth
                  if (botResponse.length - displayedLength > 50) {
                      displayedLength = botResponse.length 
                  } else {
                      await new Promise((resolve) => setTimeout(resolve, 10))
                  }
                }
              }
            } catch (e) {
              // Ignore partial JSON
            }
          }
        }
      }

      setIsLoading(false)
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Connection Error:', error)
        setMessages((prev) => {
          const updated = [...prev]
          const lastMsg = updated[updated.length - 1]
          if (lastMsg && lastMsg.role === 'assistant') {
            if (!(hasStartedText && lastMsg.content.length > 10)) {
               updated[updated.length - 1] = { role: 'assistant', content: '⚠️ Connection lost. Please try again.' }
            }
          } else if (!hasStartedText) {
             updated.push({ role: 'assistant', content: '⚠️ Connection error. Please check if the backend is running.' })
          }
          return updated
        })
      }
      setIsLoading(false)
    }
  }

  const cfg = getWidgetConfig()

  return (
    <div className="flex h-full overflow-hidden">
      <main className="flex-1 flex flex-col" style={{ background: cfg.colorChatBg || '#f3f4f6' }}>
        <Header onReset={resetConversation} />

        <MessageList messages={messages} isLoading={isLoading} />

        <MessageInput
          input={input}
          setInput={setInput}
          onSendMessage={sendMessage}
          isLoading={isLoading}
          onStopGeneration={stopGeneration}
          threadId={threadId}
        />
      </main>
    </div>
  )
}

export default ChatPage
