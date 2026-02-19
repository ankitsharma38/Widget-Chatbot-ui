import React from 'react'
import ReactMarkdown from 'react-markdown'

const MessageItem = ({ message }) => {
  const isUser = message.role === 'user'

  return (
    <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[85%]">
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div
            className={`px-4 py-3 rounded-2xl ${
              isUser
                ? 'bg-blue-600 text-white rounded-tr-none'
                : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
            }`}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
            ) : (
              <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-slate-900 prose-p:text-slate-800 prose-strong:text-slate-900 prose-li:text-slate-800 prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:border prose-pre:border-slate-700 prose-code:text-indigo-700">
                <ReactMarkdown
                  components={{
                    h1: (props) => <h1 className="text-xl font-bold mb-2 mt-4" {...props} />,
                    h2: (props) => <h2 className="text-lg font-bold mb-2 mt-3" {...props} />,
                    code: ({ inline, ...props }) =>
                      inline ? (
                        <code className="bg-indigo-50 px-1 py-0.5 rounded text-xs text-indigo-700" {...props} />
                      ) : (
                        <code
                          className="block bg-slate-900 p-3 rounded-lg my-2 text-xs font-mono overflow-x-auto border border-slate-700 text-slate-100"
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
