import React from 'react'
import ReactMarkdown from 'react-markdown'
import { getWidgetConfig } from '../../hooks/useWidgetConfig'

const MessageItem = ({ message }) => {
  const isUser = message.role === 'user'
  const cfg = getWidgetConfig()

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[90%] sm:max-w-[85%]">
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '16px',
              fontSize: '14px',
              lineHeight: '1.5',
              background: isUser ? cfg.colorPrimary : '#ffffff',
              color: isUser ? cfg.colorText : '#1f2937',
              border: isUser ? 'none' : '1px solid #e5e7eb',
              borderTopRightRadius: isUser ? '2px' : '16px',
              borderTopLeftRadius: isUser ? '16px' : '2px',
              boxShadow: isUser ? `0 2px 8px ${cfg.colorPrimary}33` : '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap m-0">{message.content}</p>
            ) : (
              <div className="prose prose-sm max-w-none text-inherit">
                <ReactMarkdown
                  components={{
                    h1: (props) => <h1 style={{fontSize: '1.1rem', fontWeight: 700, margin: '1em 0 0.5em'}} {...props} />,
                    h2: (props) => <h2 style={{fontSize: '1rem', fontWeight: 700, margin: '1em 0 0.5em'}} {...props} />,
                    p:  (props) => <p style={{margin: '0.4em 0', lineHeight: 1.5}} {...props} />,
                    code: ({ inline, ...props }) =>
                      inline ? (
                        <code style={{ background: 'rgba(0,0,0,0.05)', padding: '2px 4px', borderRadius: '4px', fontSize: '0.85em', color: cfg.colorPrimary }} {...props} />
                      ) : (
                        <code
                          style={{
                            display: 'block',
                            background: '#111827',
                            padding: '12px',
                            borderRadius: '8px',
                            margin: '8px 0',
                            fontSize: '0.85em',
                            fontFamily: 'monospace',
                            overflowX: 'auto',
                            color: '#f3f4f6'
                          }}
                          {...props}
                        />
                      ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessageItem
