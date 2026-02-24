import React, { useEffect, useRef, useState } from 'react'
import Header from '../components/chatbot/Header'
import MessageList from '../components/chatbot/MessageList'
import MessageInput from '../components/chatbot/MessageInput'
import { getWidgetConfig } from '../hooks/useWidgetConfig'
import 'amazon-connect-chatjs'

const ChatPage = () => {
  const [threadId, setThreadId] = useState(() => sessionStorage.getItem('currentThreadId') || null)
  const [isAgentMode, setIsAgentMode] = useState(false)
  const [connectSession, setConnectSession] = useState(null)

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

  const resetConversation = async () => {
    if (abortControllerRef.current) abortControllerRef.current.abort()

    // If an Amazon Connect session is active, disconnect it properly
    if (connectSession) {
      try {
        await connectSession.disconnectParticipant()
      } catch { /* ignore errors on disconnect */ }
    }

    setMessages([])
    setThreadId(null)
    setInput('')
    setIsLoading(false)
    setIsAgentMode(false)
    setConnectSession(null)
    sessionStorage.removeItem('messages')
    sessionStorage.removeItem('currentThreadId')
  }

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsLoading(false)
    }
  }

  const handleAgentTransfer = async (transferData) => {
    try {
      // Get customer name from conversation or use default
      const customerName = transferData?.name || 'Customer'
      
      const response = await fetch('http://localhost:8000/api/agent-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thread_id: threadId,
          customer_name: customerName
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Set region before creating session
        window.connect.ChatSession.setGlobalConfig({ region: 'us-east-1' })

        // Initialize Amazon Connect Chat
        const session = window.connect.ChatSession.create({
          chatDetails: {
            ContactId: result.contactId,
            ParticipantId: result.participantId,
            ParticipantToken: result.participantToken
          },
          type: 'CUSTOMER'
        })
        
        // Connect to the chat
        await session.connect()
        setConnectSession(session)
        setIsAgentMode(true)
        
        // Listen for agent messages
        session.onMessage((event) => {
          if (event.data.Type === 'MESSAGE' && event.data.ParticipantRole === 'AGENT') {
            setMessages((prev) => [
              ...prev,
              { role: 'assistant', content: event.data.Content, isAgent: true }
            ])
          }
        })

        // When agent ends/disconnects the chat → switch back to AI bot
        const handleAgentEnd = async () => {
          setIsAgentMode(false)
          setConnectSession(null)
          // Silently reset LangGraph context so bot doesn't re-transfer
          try {
            await fetch('http://localhost:8000/api/agent-session-ended', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ thread_id: threadId })
            })
          } catch { /* ignore */ }
          setMessages((prev) => [
            ...prev,
            { role: 'system', content: '👋 Agent has left the chat.' },
            { role: 'assistant', content: 'Thank you for chatting with our agent! If you have any more questions about pest control, I\'m here to help. Is there anything else I can assist you with?' }
          ])
        }

        session.onEnded(handleAgentEnd)
        session.onConnectionBroken(handleAgentEnd)

        // Add system message
        setMessages((prev) => [
          ...prev,
          { role: 'system', content: '✅ Connected to live agent. You can now chat with a real person.' }
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: '❌ ' + (result.error || 'Unable to connect to agent. Please try again later.') }
        ])
      }
    } catch (error) {
      console.error('Agent transfer error:', error)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '❌ Connection error: ' + (error?.message || String(error)) }
      ])
    }
  }

  const sendMessageToAgent = async (message) => {
    if (!connectSession) return
    
    try {
      await connectSession.sendMessage({
        contentType: 'text/plain',
        message: message
      })
    } catch (error) {
      console.error('Error sending message to agent:', error)
      setMessages((prev) => [
        ...prev,
        { role: 'system', content: '❌ Failed to send message. Connection may be lost.' }
      ])
    }
  }

  const sendMessage = async (e) => {
    if (e) e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    
    // If in agent mode, send to Amazon Connect
    if (isAgentMode) {
      await sendMessageToAgent(input)
      return
    }
    
    setIsLoading(true)

    abortControllerRef.current = new AbortController()
    let hasStartedText = false

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
              
              // Check for agent transfer request
              if (data.agent_transfer) {
                await handleAgentTransfer(data.transfer_data)
              }
            } catch {
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
