import React, { useEffect, useRef, useState } from 'react'
import Header from '../components/chatbot/Header'
import MessageList from '../components/chatbot/MessageList'
import MessageInput from '../components/chatbot/MessageInput'

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
      const response = await fetch('http://localhost:8000/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          thread_id: threadId,
        }),
        signal: abortControllerRef.current.signal,
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let botResponse = ''
      let displayedLength = 0

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))

            if (data.thread_id && !threadId) setThreadId(data.thread_id)

            if (data.content) {
              botResponse += data.content

              while (displayedLength < botResponse.length) {
                if (abortControllerRef.current.signal.aborted) break
                displayedLength++
                const displayText = botResponse.substring(0, displayedLength)
                setMessages((prev) => {
                  const updated = [...prev]
                  updated[updated.length - 1] = { role: 'assistant', content: displayText }
                  return updated
                })
                await new Promise((resolve) => setTimeout(resolve, 5))
              }
            }
          }
        }
      }

      setIsLoading(false)
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error:', error)
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Error connecting to server. Make sure backend is running.' },
        ])
      }
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      <main className="flex-1 flex flex-col bg-gradient-to-b from-white to-gray-100">
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
