import React from 'react'
import { SquarePen } from 'lucide-react'

const Header = ({ onReset }) => {
  return (
    <header className="h-14 flex items-center justify-between px-4 bg-white border-b border-gray-200 shrink-0">
      <h1 className="text-base font-semibold text-gray-900">AI Assistant</h1>
      <button
        onClick={onReset}
        title="New conversation"
        className="p-2 text-gray-500 hover:text-green-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <SquarePen size={16} />
      </button>
    </header>
  )
}

export default Header
