import { useState, useRef, useCallback } from 'react'
import { Check, Copy, RotateCcw, Save, Code2, Palette, Layout, ToggleLeft, Eye, Settings2, ChevronDown } from 'lucide-react'

// ── SVG icons (same as widget.js) ──────────────────────────────────────────
const SVG_ICONS = {
  chat:  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  call:  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l1.27-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  text:  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="13" y2="14"/></svg>`,
  email: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  close: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
}

const ALL_TABS = [
  { key: 'chat',  defaultLabel: 'Chat'  },
  { key: 'call',  defaultLabel: 'Call'  },
  { key: 'text',  defaultLabel: 'Text'  },
  { key: 'email', defaultLabel: 'Email' },
]

const STORAGE_KEY = 'hpas_widget_settings'

const DEFAULT_CONFIG = {
  title:          "Holper's Pest & Animal Solutions",
  widgetUrl:      'http://localhost:5173',
  scriptUrl:      'http://localhost:5173/widget.js',
  colorPrimary:   '#166534',
  colorDark:      '#14532d',
  colorSubHeaderBg: '#166534',
  colorText:      '#ffffff',
  colorChatBg:    '#f3f4f6',
  colorFormBg:    '#ffffff',
  width:          400,
  height:         580,
  bottom:         '24px',
  right:          '24px',
  headerFontSize: 13,
  headerHeight:   44,
  btnText:        'Submit',
  btnFontSize:    13,
  btnRadius:      9,
  tabs: {
    chat:  { enabled: true,  label: 'Chat'  },
    call:  { enabled: true,  label: 'Call'  },
    text:  { enabled: true,  label: 'Text'  },
    email: { enabled: true,  label: 'Email' },
  }
}

function loadConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return { ...DEFAULT_CONFIG, ...JSON.parse(saved) }
  } catch (e) { void e }
  return { ...DEFAULT_CONFIG }
}

// ── Script Generator ────────────────────────────────────────────────────────
function generateScript(cfg) {
  const enabledTabKeys = ALL_TABS.filter(t => cfg.tabs[t.key]?.enabled).map(t => t.key)
  const customLabels   = enabledTabKeys.map(k => cfg.tabs[k]?.label || '')
  const labelsChanged  = customLabels.some((l, i) => l !== ALL_TABS.find(t => t.key === enabledTabKeys[i])?.defaultLabel)

  const attrs = [
    `  src="${cfg.scriptUrl}"`,
    `  data-url="${cfg.widgetUrl}"`,
    `  data-title="${cfg.title}"`,
    `  data-color="${cfg.colorPrimary}"`,
    `  data-color-dark="${cfg.colorDark}"`,
    `  data-sub-header-bg="${cfg.colorSubHeaderBg || cfg.colorPrimary}"`,
    `  data-text-color="${cfg.colorText}"`,
    `  data-width="${cfg.width}"`,
    `  data-height="${cfg.height}"`,
    `  data-bottom="${cfg.bottom}"`,
    `  data-right="${cfg.right}"`,
    `  data-header-height="${cfg.headerHeight || 44}"`,
    `  data-header-fs="${cfg.headerFontSize || 13}"`,
    `  data-btn-text="${cfg.btnText || 'Submit'}"`,
    `  data-btn-fs="${cfg.btnFontSize || 13}"`,
    `  data-btn-radius="${cfg.btnRadius || DEFAULT_CONFIG.btnRadius}"`,
    `  data-chat-bg="${cfg.colorChatBg || DEFAULT_CONFIG.colorChatBg}"`,
    `  data-form-bg="${cfg.colorFormBg || DEFAULT_CONFIG.colorFormBg}"`,
    `  data-tabs="${enabledTabKeys.join(',')}"`,
  ]
  if (labelsChanged) {
    attrs.push(`  data-tab-labels="${customLabels.join(',')}"`)
  }
  return `<script\n${attrs.join('\n')}\n></script>`
}

// ── Live Widget Preview ─────────────────────────────────────────────────────
function WidgetPreview({ cfg }) {
  const [open, setOpen]           = useState(false)
  const [activeKey, setActiveKey] = useState(null)

  const enabledTabs = ALL_TABS.filter(t => cfg.tabs[t.key]?.enabled)
  const colCount    = enabledTabs.length || 1
  const headerH     = cfg.headerHeight  || 44
  const headerFS    = cfg.headerFontSize || 13
  const btnText     = cfg.btnText       || 'Submit'
  const btnFS       = cfg.btnFontSize   || 13
  const btnR        = cfg.btnRadius     || 9

  const toggle = (key) => {
    if (activeKey === key) { setActiveKey(null); setOpen(false) }
    else { setActiveKey(key); setOpen(true) }
  }
  const close = () => { setActiveKey(null); setOpen(false) }

  const previewScale = 0.72

  /* ── Realistic chat content ── */
  const ChatContent = () => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: cfg.colorChatBg || '#f3f4f6', overflow: 'hidden' }}>
      <div style={{ padding: '8px 12px 7px', background: cfg.colorSubHeaderBg || cfg.colorPrimary, flexShrink: 0 }}>
        <div style={{ fontSize: Math.round(headerFS * 0.85), fontWeight: 700, color: cfg.colorText }}>AI Assistant</div>
        <div style={{ fontSize: 8, color: `${cfg.colorText}aa`, marginTop: 1 }}>Online &amp; Ready to Help</div>
      </div>
      <div style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'hidden' }}>
        <div style={{ alignSelf: 'center', fontSize: 9, color: '#9ca3af', background: '#e5e7eb', borderRadius: 20, padding: '2px 8px' }}>Today</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: cfg.colorPrimary, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.colorText, fontSize: 8, fontWeight: 700 }}>AI</div>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px 12px 12px 2px', padding: '6px 10px', fontSize: 9.5, color: '#374151', maxWidth: '75%', lineHeight: 1.4 }}>
            Hi! How can I help you today? 
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ background: cfg.colorPrimary, color: cfg.colorText, borderRadius: '12px 12px 2px 12px', padding: '6px 10px', fontSize: 9.5, maxWidth: '75%', lineHeight: 1.4 }}>
            I need pest control help
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: cfg.colorPrimary, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.colorText, fontSize: 8, fontWeight: 700 }}>AI</div>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px 12px 12px 2px', padding: '6px 10px', fontSize: 9.5, color: '#374151', maxWidth: '75%', lineHeight: 1.4 }}>
            Sure! What type of pest issue are you facing?
          </div>
        </div>
      </div>
      <div style={{ padding: '8px 10px', background: '#fff', borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <div style={{ flex: 1, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 20, padding: '5px 10px', fontSize: 9, color: '#9ca3af' }}>Type a message…</div>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: cfg.colorPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={cfg.colorText} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </div>
      </div>
    </div>
  )

  /* ── Realistic form content ── */
  const formTitle = activeKey === 'call' ? 'Request a callback' : activeKey === 'text' ? 'Send us a text' : 'Send us an email'
  const FormContent = () => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: cfg.colorFormBg || '#fff', overflow: 'hidden' }}>
      <div style={{ padding: '8px 12px 7px', background: cfg.colorSubHeaderBg || cfg.colorPrimary, flexShrink: 0 }}>
        <div style={{ fontSize: Math.round(headerFS * 0.85), fontWeight: 700, color: cfg.colorText }}>{formTitle}</div>
        <div style={{ fontSize: 8, color: `${cfg.colorText}aa`, marginTop: 1 }}>We'll get back to you shortly.</div>
      </div>
      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7, flex: 1, overflowY: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {['First Name','Last Name'].map(p => (
            <div key={p}>
              <div style={{ fontSize: 8, color: '#6b7280', marginBottom: 2, fontWeight: 600 }}>{p}</div>
              <div style={{ height: 20, background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 5 }} />
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 8, color: '#6b7280', marginBottom: 2, fontWeight: 600 }}>Cell Phone *</div>
          <div style={{ height: 20, background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 5 }} />
        </div>
        <div>
          <div style={{ fontSize: 8, color: '#6b7280', marginBottom: 2, fontWeight: 600 }}>Message *</div>
          <div style={{ height: 40, background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 5 }} />
        </div>
        <div style={{ fontSize: 7, color: '#9ca3af', lineHeight: 1.4 }}>By submitting, you agree to be contacted via automated technology.</div>
        {/* Submit button — exact mirror of settings */}
        <div style={{ height: 26, background: cfg.colorPrimary, borderRadius: btnR, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.colorText, fontSize: Math.round(btnFS * 0.75), fontWeight: 700, boxShadow: `0 2px 6px ${cfg.colorPrimary}44` }}>
          {btnText}
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ transform: `scale(${previewScale})`, transformOrigin: 'bottom center', width: cfg.width }}>
        {/* Panel */}
        <div style={{ width: cfg.width, overflow: 'hidden', borderRadius: 16, boxShadow: open ? '0 8px 40px rgba(0,0,0,0.20)' : 'none', border: open ? '1px solid #d1d5db' : '1px solid transparent', maxHeight: open ? cfg.height + 20 : 0, opacity: open ? 1 : 0, marginBottom: open ? 10 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'max-height 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.32s ease, margin-bottom 0.38s cubic-bezier(0.4,0,0.2,1)' }}>
          <div style={{ width: cfg.width, height: cfg.height, display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ height: headerH, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', background: cfg.colorPrimary, color: cfg.colorText, flexShrink: 0 }}>
              <span style={{ fontSize: headerFS, fontWeight: 600, letterSpacing: '0.01em' }}>{cfg.title}</span>
              <button onClick={close} style={{ background: 'none', border: 'none', cursor: 'pointer', color: cfg.colorText, padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}
                dangerouslySetInnerHTML={{ __html: SVG_ICONS.close }} />
            </div>
            {/* Realistic content */}
            {activeKey === 'chat' ? <ChatContent /> : activeKey ? <FormContent /> : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: cfg.colorChatBg || '#f9fafb', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 28 }}>💬</div>
                <span style={{ fontWeight: 500, fontSize: 13, color: '#374151' }}>Select a tab below</span>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>to preview the widget</span>
              </div>
            )}
          </div>
        </div>
        {/* Nav bar */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colCount}, 1fr)`, width: cfg.width, borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.18)', border: `1px solid ${cfg.colorDark}` }}>
          {enabledTabs.map(tab => {
            const label    = cfg.tabs[tab.key]?.label || tab.defaultLabel
            const isActive = activeKey === tab.key
            return (
              <button key={tab.key} onClick={() => toggle(tab.key)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '10px 0', background: isActive ? cfg.colorDark : cfg.colorPrimary, border: 'none', borderRight: `1px solid ${cfg.colorDark}`, cursor: 'pointer', color: cfg.colorText, fontSize: 11, fontWeight: 500, fontFamily: 'inherit', transition: 'background 0.18s' }}
                dangerouslySetInnerHTML={{ __html: SVG_ICONS[tab.key] + `<span style="display:block;margin-top:2px">${label}</span>` }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}



// ── Slider Input ─────────────────────────────────────────────────────────────
function SliderField({ label, value, onChange, min, max, unit = '' }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#166534', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '2px 8px' }}>
          {value}{unit}
        </span>
      </div>
      <div style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
        {/* Track fill */}
        <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '100%', height: 4, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#166534,#16a34a)', borderRadius: 4, transition: 'width 0.1s' }} />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ position: 'relative', width: '100%', appearance: 'none', background: 'transparent', cursor: 'pointer', margin: 0, zIndex: 1 }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, color: '#9ca3af' }}>{min}{unit}</span>
        <span style={{ fontSize: 10, color: '#9ca3af' }}>{max}{unit}</span>
      </div>
    </div>
  )
}

// ── Field helpers ────────────────────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div>
        <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
        {hint && <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{hint}</p>}
      </div>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '8px 12px', fontSize: 13, outline: 'none', background: '#fff', color: '#111827', transition: 'border-color 0.2s, box-shadow 0.2s', width: '100%', boxSizing: 'border-box' }}
      onFocus={e => { e.target.style.borderColor = '#166534'; e.target.style.boxShadow = '0 0 0 3px rgba(22,101,52,0.08)' }}
      onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
    />
  )
}

function ColorRow({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: '#f9fafb', borderRadius: 10, border: '1.5px solid #f0f0f0' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ width: 36, height: 36, borderRadius: 8, border: '2px solid #e5e7eb', cursor: 'pointer', padding: 2, background: 'none' }}
        />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4, fontWeight: 500 }}>{label}</div>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ border: '1.5px solid #e5e7eb', borderRadius: 7, padding: '4px 8px', fontSize: 12, fontFamily: 'monospace', width: '100%', boxSizing: 'border-box', background: '#fff', outline: 'none', color: '#111827' }}
          onFocus={e => { e.target.style.borderColor = '#166534' }}
          onBlur={e => { e.target.style.borderColor = '#e5e7eb' }}
        />
      </div>
      {/* Color preview dot */}
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: value, border: '2px solid #e5e7eb', flexShrink: 0 }} />
    </div>
  )
}

// ── Section wrapper (collapsible) ────────────────────────────────────────────
function Section({ icon, title, children, accent = false, defaultOpen = true }) {
  const [open, setOpen]       = useState(defaultOpen)
  const [hovered, setHovered] = useState(false)

  const headerBg = hovered
    ? (accent ? 'linear-gradient(135deg,#ecfdf5,#d1fae5)' : '#eff0f2')
    : (accent ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)' : '#fafafa')

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      border: `1.5px solid ${open ? (accent ? '#bbf7d0' : '#e5e7eb') : '#f0f0f0'}`,
      boxShadow: open ? '0 2px 8px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.03)',
      transition: 'border-color 0.25s, box-shadow 0.25s',
    }}>
      {/* ── Clickable header ── */}
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          background: headerBg,
          border: 'none',
          borderBottom: open ? '1px solid #f0f0f0' : '1px solid transparent',
          borderRadius: open ? '14px 14px 0 0' : 14,
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background 0.18s, border-color 0.18s',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Left icon */}
        <span style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          borderRadius: 8,
          background: accent ? 'rgba(22,101,52,0.10)' : 'rgba(107,114,128,0.08)',
          color: accent ? '#166534' : '#6b7280',
          flexShrink: 0,
        }}>
          {icon}
        </span>

        {/* Title */}
        <h2 style={{ margin: 0, flex: 1, fontSize: 13, fontWeight: 700, color: accent ? '#166534' : '#374151', letterSpacing: '0.01em' }}>
          {title}
        </h2>

        {/* Status badge when closed */}
        {!open && (
          <span style={{ fontSize: 10, color: '#9ca3af', background: '#f3f4f6', borderRadius: 20, padding: '2px 8px', fontWeight: 500 }}>
            collapsed
          </span>
        )}

        {/* Chevron */}
        <span style={{
          display: 'flex',
          color: accent ? '#16a34a' : '#9ca3af',
          transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
          flexShrink: 0,
        }}>
          <ChevronDown size={16} />
        </span>
      </button>

      {/* ── Collapsible body ── */}
      <div style={{
        maxHeight: open ? '2000px' : '0px',
        overflow: 'hidden',
        transition: open
          ? 'max-height 0.42s cubic-bezier(0.4,0,0.2,1)'
          : 'max-height 0.30s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ── Embed Script Panel ───────────────────────────────────────────────────────
function EmbedScriptPanel({ cfg, savedCfg, hasSaved }) {
  const [copied, setCopied] = useState(false)
  const scriptCode = savedCfg ? generateScript(savedCfg) : generateScript(cfg)

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #f0f0f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ padding: '12px 18px', borderBottom: '1px solid #f5f5f5', background: 'linear-gradient(135deg,#1e293b,#0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Code2 size={15} color="#7dd3fc" />
          <h2 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.01em' }}>Embed Script</h2>
        </div>
        {hasSaved && (
          <span style={{ fontSize: 10, fontWeight: 600, color: '#4ade80', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 20, padding: '2px 8px' }}>
            ✓ Ready to use
          </span>
        )}
      </div>
      <div style={{ padding: '16px 18px', background: '#0f172a' }}>
        {!hasSaved ? (
          <div style={{ textAlign: 'center', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Save size={20} color="#475569" />
            </div>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.5, textAlign: 'center' }}>
              Save your settings to generate<br />the embed script.
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 11, color: '#64748b', marginBottom: 12, lineHeight: 1.5, marginTop: 0 }}>
              Paste this just before <code style={{ background: 'rgba(255,255,255,0.08)', color: '#7dd3fc', padding: '1px 5px', borderRadius: 4, fontFamily: 'monospace' }}>&lt;/body&gt;</code> on your website.
            </p>
            <div style={{ position: 'relative' }}>
              <pre style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px', margin: 0, fontSize: 11.5, fontFamily: '"Fira Code", "Cascadia Code", monospace', color: '#86efac', lineHeight: 1.7, overflowX: 'auto', whiteSpace: 'pre' }}>
                {scriptCode}
              </pre>
              <button
                onClick={handleCopy}
                style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: copied ? '#166534' : 'rgba(255,255,255,0.12)', color: copied ? '#fff' : '#cbd5e1' }}
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Main Settings Page ───────────────────────────────────────────────────────
export default function SettingsPage() {
  const [cfg, setCfg]         = useState(loadConfig)
  const [saved, setSaved]     = useState(false)
  const [hasSaved, setHasSaved] = useState(() => !!localStorage.getItem(STORAGE_KEY))
  const [savedCfg, setSavedCfg] = useState(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY)
      return s ? { ...DEFAULT_CONFIG, ...JSON.parse(s) } : null
    } catch { return null }
  })

  const update = useCallback((patch) => {
    setCfg(prev => ({ ...prev, ...patch }))
  }, [])

  const updateTab = (key, patch) => {
    setCfg(prev => ({
      ...prev,
      tabs: { ...prev.tabs, [key]: { ...prev.tabs[key], ...patch } }
    }))
  }

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg))
    setSaved(true)
    setHasSaved(true)
    setSavedCfg({ ...cfg })
    setTimeout(() => setSaved(false), 2500)
  }

  const handleReset = () => {
    setCfg({ ...DEFAULT_CONFIG })
    localStorage.removeItem(STORAGE_KEY)
    setHasSaved(false)
    setSavedCfg(null)
  }

  /* ── range-input thumb global style (injected once) ── */
  if (typeof document !== 'undefined' && !document.getElementById('sp-range-style')) {
    const s = document.createElement('style')
    s.id = 'sp-range-style'
    s.textContent = `
      input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 18px; height: 18px;
        border-radius: 50%;
        background: #166534;
        border: 3px solid #fff;
        box-shadow: 0 1px 6px rgba(22,101,52,0.35);
        cursor: pointer;
      }
      input[type=range]::-moz-range-thumb {
        width: 18px; height: 18px;
        border-radius: 50%;
        background: #166534;
        border: 3px solid #fff;
        box-shadow: 0 1px 6px rgba(22,101,52,0.35);
        cursor: pointer;
      }
    `
    document.head.appendChild(s)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', overflow: 'hidden' }}>

      {/* ── Top Header ── */}
      <div style={{ background: 'linear-gradient(135deg, #166534 0%, #14532d 100%)', color: '#fff', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, boxShadow: '0 2px 12px rgba(22,101,52,0.25)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            <Settings2 size={17} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>Widget Settings</h1>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 1 }}>Customize your chat widget and generate the embed code</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={handleReset}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(4px)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          >
            <RotateCcw size={13} />
            Reset
          </button>
          <button
            onClick={handleSave}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 18px', borderRadius: 9, background: saved ? '#4ade80' : '#fff', border: 'none', color: saved ? '#14532d' : '#166534', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.25s', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
            onMouseEnter={e => { if (!saved) e.currentTarget.style.background = '#f0fdf4' }}
            onMouseLeave={e => { if (!saved) e.currentTarget.style.background = '#fff' }}
          >
            {saved ? <Check size={13} /> : <Save size={13} />}
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '580px 480px 1fr', gridTemplateRows: '1fr', overflow: 'hidden' }}>

        {/* ── LEFT: Scrollable settings ── */}
        <div style={{ overflowY: 'auto', overflowX: 'hidden', padding: '22px 20px 30px 24px', display: 'flex', flexDirection: 'column', gap: 16, scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent', boxSizing: 'border-box', borderRight: '1px solid #e5e7eb' }}>

          {/* Branding */}
          <Section icon={<Palette size={14} />} title="Branding">
            <Field label="Header Title" hint="Shown in the widget header bar">
              <TextInput value={cfg.title} onChange={v => update({ title: v })} placeholder="Your Business Name" />
            </Field>
            <Field label="Widget URL" hint="The iframe src — where your app is hosted">
              <TextInput value={cfg.widgetUrl} onChange={v => update({ widgetUrl: v })} placeholder="http://localhost:5173" />
            </Field>
            <Field label="Script URL" hint="Path to widget.js on your server">
              <TextInput value={cfg.scriptUrl} onChange={v => update({ scriptUrl: v })} placeholder="http://localhost:5173/widget.js" />
            </Field>
          </Section>

          {/* Colors */}
          <Section icon={<Palette size={14} />} title="Colors" accent>
            <ColorRow label="Primary Color"       value={cfg.colorPrimary} onChange={v => update({ colorPrimary: v })} />
            <ColorRow label="Dark / Hover Color"  value={cfg.colorDark}    onChange={v => update({ colorDark: v })} />
            <div style={{ height: 1, background: '#f0f0f0', margin: '2px 0' }} />
            <ColorRow label="Internal Header Background" value={cfg.colorSubHeaderBg || cfg.colorPrimary} onChange={v => update({ colorSubHeaderBg: v })} />
            <ColorRow label="Text Color"          value={cfg.colorText}    onChange={v => update({ colorText: v })} />
            <div style={{ height: 1, background: '#f0f0f0', margin: '2px 0' }} />
            <ColorRow label="Chat Background"     value={cfg.colorChatBg  || '#f3f4f6'} onChange={v => update({ colorChatBg: v })} />
            <ColorRow label="Form Page Background" value={cfg.colorFormBg || '#ffffff'} onChange={v => update({ colorFormBg: v })} />
          </Section>

          {/* Header Style */}
          <Section icon={<Settings2 size={14} />} title="Header Style">
            <SliderField label="Header Height"   value={cfg.headerHeight   || 44} onChange={v => update({ headerHeight: v })}   min={36} max={80} unit="px" />
            <SliderField label="Title Font Size"  value={cfg.headerFontSize || 13} onChange={v => update({ headerFontSize: v })} min={10} max={22} unit="px" />
          </Section>

          {/* Button Style */}
          <Section icon={<Check size={14} />} title="Submit Button Style">
            <Field label="Button Text">
              <TextInput value={cfg.btnText || 'Submit'} onChange={v => update({ btnText: v })} placeholder="Submit" />
            </Field>
            <SliderField label="Font Size"     value={cfg.btnFontSize || 13} onChange={v => update({ btnFontSize: v })} min={10} max={18} unit="px" />
            <SliderField label="Border Radius" value={cfg.btnRadius   || 9}  onChange={v => update({ btnRadius: v })}   min={0}  max={28} unit="px" />
          </Section>

          {/* Size & Position — sliders */}
          <Section icon={<Layout size={14} />} title="Size & Position">
            <SliderField label="Width"         value={cfg.width}   onChange={v => update({ width: v })}  min={280} max={700} unit="px" />
            <SliderField label="Height"        value={cfg.height}  onChange={v => update({ height: v })} min={300} max={900} unit="px" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Bottom Offset">
                <TextInput value={cfg.bottom} onChange={v => update({ bottom: v })} placeholder="24px" />
              </Field>
              <Field label="Right Offset">
                <TextInput value={cfg.right} onChange={v => update({ right: v })} placeholder="24px" />
              </Field>
            </div>
          </Section>

          {/* Tabs */}
          <Section icon={<ToggleLeft size={14} />} title="Tabs">
            <p style={{ margin: 0, marginTop: -4, fontSize: 11.5, color: '#9ca3af', lineHeight: 1.5 }}>
              Toggle each tab on/off and customize their display labels.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ALL_TABS.map(tab => {
                const tabCfg = cfg.tabs[tab.key]
                return (
                  <div key={tab.key} style={{ display: 'flex', alignItems: 'center', gap: 12, background: tabCfg.enabled ? '#f0fdf4' : '#fafafa', border: `1.5px solid ${tabCfg.enabled ? '#bbf7d0' : '#f0f0f0'}`, borderRadius: 12, padding: '10px 14px', transition: 'all 0.2s' }}>
                    {/* Toggle switch */}
                    <button
                      onClick={() => updateTab(tab.key, { enabled: !tabCfg.enabled })}
                      style={{ position: 'relative', width: 38, height: 20, borderRadius: 10, background: tabCfg.enabled ? '#166534' : '#d1d5db', border: 'none', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s', padding: 0 }}
                    >
                      <span style={{ position: 'absolute', top: 2, left: tabCfg.enabled ? 20 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s', display: 'block' }} />
                    </button>

                    {/* Icon */}
                    <span style={{ color: tabCfg.enabled ? '#166534' : '#9ca3af', display: 'flex', transition: 'color 0.2s' }}
                      dangerouslySetInnerHTML={{ __html: SVG_ICONS[tab.key] }} />

                    {/* Label input */}
                    <div style={{ flex: 1 }}>
                      <input
                        type="text"
                        value={tabCfg.label}
                        onChange={e => updateTab(tab.key, { label: e.target.value })}
                        disabled={!tabCfg.enabled}
                        placeholder={tab.defaultLabel}
                        style={{ width: '100%', border: `1.5px solid ${tabCfg.enabled ? '#e5e7eb' : 'transparent'}`, borderRadius: 8, padding: '5px 10px', fontSize: 13, background: tabCfg.enabled ? '#fff' : 'transparent', color: tabCfg.enabled ? '#111827' : '#9ca3af', cursor: tabCfg.enabled ? 'text' : 'not-allowed', outline: 'none', boxSizing: 'border-box', fontWeight: 500 }}
                        onFocus={e => { if (tabCfg.enabled) e.target.style.borderColor = '#166534' }}
                        onBlur={e => { e.target.style.borderColor = '#e5e7eb' }}
                      />
                    </div>

                    {/* Key badge */}
                    <span style={{ fontSize: 10, fontWeight: 700, color: tabCfg.enabled ? '#15803d' : '#9ca3af', background: tabCfg.enabled ? '#dcfce7' : '#f3f4f6', border: `1px solid ${tabCfg.enabled ? '#86efac' : '#e5e7eb'}`, borderRadius: 6, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>
                      {tab.key}
                    </span>
                  </div>
                )
              })}
            </div>
          </Section>

        </div>

        {/* ── MIDDLE: Embed Script ── */}
        <div style={{ padding: '22px 20px', background: '#f8fafc', borderRight: '1px solid #e5e7eb', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Code2 size={13} color="#6b7280" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', letterSpacing: '0.02em', textTransform: 'uppercase' }}>Integration</span>
          </div>
          <EmbedScriptPanel cfg={cfg} savedCfg={savedCfg} hasSaved={hasSaved} />
          
          {!hasSaved && (
              <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 6, padding: '12px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12 }}>
                <span style={{ fontSize: 16 }}>💡</span>
                <span style={{ fontSize: 12, color: '#92400e', lineHeight: 1.5 }}>
                  Press <strong>Save Settings</strong> at the top to generate your custom embed script.
                </span>
              </div>
          )}

          <div style={{ marginTop: 24, padding: '16px', background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 16 }}>
            <h4 style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Next Steps</h4>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#6b7280', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>Copy the script above.</li>
              <li>Paste it before the closing &lt;/body&gt; tag.</li>
              <li>The widget will appear instantly on your site.</li>
            </ul>
          </div>
        </div>

        {/* ── RIGHT: Live Preview ── */}
        <div style={{ background: '#f1f5f9', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
          
          <div style={{ padding: '22px 20px 0', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <Eye size={13} color="#6b7280" />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', letterSpacing: '0.02em', textTransform: 'uppercase' }}>Live Preview</span>
              <span style={{ marginLeft: 'auto', fontSize: 10, color: '#9ca3af', background: '#e5e7eb', borderRadius: 20, padding: '2px 8px' }}>Interactive</span>
            </div>

            <div style={{ background: 'linear-gradient(135deg,#e0f2fe 0%,#e0e7ff 100%)', borderRadius: 20, padding: '30px 20px', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', minHeight: 'calc(100vh - 160px)', border: '1px solid #bfdbfe', overflow: 'hidden' }}>
              <WidgetPreview cfg={cfg} />
            </div>
          </div>

          <div style={{ padding: '12px 20px 30px', textAlign: 'center' }}>
             <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>
                This is a live representation of how the widget will look on your website.
             </p>
          </div>

        </div>
      </div>

    </div>
  )
}
