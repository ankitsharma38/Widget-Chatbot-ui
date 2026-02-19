import React from 'react'
import { MessageCircle, Phone, MessageSquareText, Mail } from 'lucide-react'
import { getWidgetConfig } from '../../hooks/useWidgetConfig'

const navItems = [
  { key: 'chat',  label: 'Chat',  icon: MessageCircle },
  { key: 'call',  label: 'Call',  icon: Phone },
  { key: 'text',  label: 'Text',  icon: MessageSquareText },
  { key: 'email', label: 'Email', icon: Mail },
]

const BottomNav = ({ activePage, onChange }) => {
  const cfg = getWidgetConfig()

  return (
    <nav 
      style={{ 
        height: '64px', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        background: cfg.colorPrimary, 
        borderTop: `1px solid ${cfg.colorDark}` 
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = activePage != null && activePage === item.key

        return (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s',
              background: isActive ? cfg.colorDark : 'transparent',
              color: cfg.colorText
            }}
            onMouseEnter={e => { if(!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
            onMouseLeave={e => { if(!isActive) e.currentTarget.style.background = 'transparent' }}
          >
            <Icon size={18} />
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export default BottomNav
