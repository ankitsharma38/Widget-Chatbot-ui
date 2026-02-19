import React, { useState } from 'react'
import { getWidgetConfig } from '../../hooks/useWidgetConfig'

const ContactFormCard = ({ title, fields }) => {
  const cfg              = getWidgetConfig()
  const [hover, setHover] = useState(false)
  const textareaRows     = title === 'Send us an email' ? 4 : 3
  const headerH          = cfg.headerHeight   || 44
  const headerFS         = cfg.headerFontSize || 13
  const btnText          = cfg.btnText        || 'Submit'
  const btnFS            = cfg.btnFontSize    || 13
  const btnR             = cfg.btnRadius      ?? 9

  return (
    <div style={{ height: '100%', width: '100%', overflowY: 'auto', background: cfg.colorFormBg || '#ffffff', color: '#1f2937' }}>
      {/* Header strip */}
      <div style={{ minHeight: headerH, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 16px', background: cfg.colorSubHeaderBg || cfg.colorPrimary }}>
        <h1 style={{ margin: 0, fontSize: headerFS, fontWeight: 700, color: cfg.colorText || '#fff' }}>{title}</h1>
        <p style={{ margin: '3px 0 0', fontSize: 11, color: `${cfg.colorText || '#fff'}cc` }}>
          We'll get back to you shortly.
        </p>
      </div>

      <form style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}
        onSubmit={e => e.preventDefault()}>
        {fields.map((row, rowIdx) => (
          <div key={rowIdx} style={{ display: 'grid', gridTemplateColumns: row.length === 2 ? '1fr 1fr' : '1fr', gap: 10 }}>
            {row.map((field) => (
              <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#4b5563' }}>{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    rows={textareaRows}
                    placeholder="Enter your message…"
                    style={{
                      width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 8,
                      padding: '8px 10px', fontSize: 13, color: '#1f2937',
                      background: '#fafafa', outline: 'none', resize: 'none',
                      fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = cfg.colorPrimary}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                ) : (
                  <input
                    type={field.type}
                    placeholder={field.label.replace(' *', '')}
                    style={{
                      width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 8,
                      padding: '8px 10px', fontSize: 13, color: '#1f2937',
                      background: '#fafafa', outline: 'none', boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = cfg.colorPrimary}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                )}
              </div>
            ))}
          </div>
        ))}

        <p style={{ fontSize: 10, color: '#9ca3af', lineHeight: 1.5, margin: '2px 0 0' }}>
          By submitting, you agree to be contacted using automated technology. Msg &amp; data rates may apply. Text STOP to cancel.
        </p>

        {/* Submit button — uses primary color from settings */}
        <button
          type="submit"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: btnR,
            fontSize: btnFS,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            color: cfg.colorText || '#fff',
            background: hover ? cfg.colorDark : cfg.colorPrimary,
            transition: 'background 0.2s, transform 0.1s',
            transform: hover ? 'translateY(-1px)' : 'none',
            boxShadow: hover ? `0 4px 14px ${cfg.colorPrimary}55` : `0 2px 6px ${cfg.colorPrimary}33`,
            letterSpacing: '0.01em',
          }}
        >
          {btnText}
        </button>
      </form>
    </div>
  )
}

export default ContactFormCard
