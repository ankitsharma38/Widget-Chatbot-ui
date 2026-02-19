import React from 'react'
import { MessageCircle, Phone, MessageSquareText, Mail } from 'lucide-react'

const navItems = [
  { key: 'chat', label: 'Chat', icon: MessageCircle },
  { key: 'call', label: 'Call', icon: Phone },
  { key: 'text', label: 'Text', icon: MessageSquareText },
  { key: 'email', label: 'Email', icon: Mail }
]

const BottomNav = ({ activePage, onChange }) => {
  return (
    <nav className="h-16 grid grid-cols-4 bg-green-800 border-t border-green-700">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = activePage != null && activePage === item.key

        return (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className={`flex items-center justify-center gap-2 text-sm sm:text-base font-medium transition-colors ${
              isActive ? 'bg-green-900 text-white' : 'text-white hover:bg-green-700'
            }`}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export default BottomNav
