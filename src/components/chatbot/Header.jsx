import React from 'react'
import { SquarePen } from 'lucide-react'
import { getWidgetConfig } from '../../hooks/useWidgetConfig'

const Header = ({ onReset }) => {
  const cfg = getWidgetConfig()
  
  return (
    <header 
      style={{ 
        height: cfg.headerHeight,
        background: cfg.colorSubHeaderBg || cfg.colorPrimary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        flexShrink: 0
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: cfg.headerFontSize, 
          fontWeight: 700, 
          color: cfg.colorText || '#fff'
        }}>
          AI Assistant
        </h1>
        <p style={{ margin: '1px 0 0', fontSize: 10, color: `${cfg.colorText || '#fff'}cc` }}>
          Online & Ready to Help
        </p>
      </div>
      <button
        onClick={onReset}
        title="New conversation"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: cfg.colorText || '#fff',
          padding: '8px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.2s'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'none'
        }}
      >
        <SquarePen size={18} />
      </button>
    </header>
  )
}

export default Header
