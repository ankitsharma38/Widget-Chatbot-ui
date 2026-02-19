(function () {
  // ── Config ─────────────────────────────────────────────────────────────────
  var scriptTag = document.currentScript || (function () {
    var s = document.getElementsByTagName('script')
    return s[s.length - 1]
  })()
  var WIDGET_URL = scriptTag.getAttribute('data-url') || 'http://localhost:5173'
  var BOTTOM = '24px'
  var RIGHT  = '24px'

  // ── Inline SVGs ────────────────────────────────────────────────────────────
  var icons = {
    chat:  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    call:  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l1.27-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    text:  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="13" y2="14"/></svg>',
    email: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
    close: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
  }

  var navItems = [
    { key: 'chat',  label: 'Chat'  },
    { key: 'call',  label: 'Call'  },
    { key: 'text',  label: 'Text'  },
    { key: 'email', label: 'Email' },
  ]

  // ── Styles ─────────────────────────────────────────────────────────────────
  var style = document.createElement('style')
  style.textContent = [
    '._hpas_wrap {',
    '  position: fixed;',
    '  bottom: ' + BOTTOM + ';',
    '  right: ' + RIGHT + ';',
    '  z-index: 999999;',
    '  display: flex;',
    '  flex-direction: column;',
    '  align-items: flex-end;',
    '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;',
    '}',

    /* outer clipping wrapper — animates max-height for smooth slide */
    '._hpas_panel_outer {',
    '  width: 400px;',
    '  overflow: hidden;',
    '  border-radius: 16px;',
    '  box-shadow: 0 8px 40px rgba(0,0,0,0.20);',
    '  border: 1px solid #d1d5db;',
    '  transition: max-height 0.38s cubic-bezier(0.4,0,0.2,1),',
    '              opacity 0.32s ease,',
    '              margin-bottom 0.38s cubic-bezier(0.4,0,0.2,1);',
    '}',
    '._hpas_panel_outer._closed {',
    '  max-height: 0;',
    '  opacity: 0;',
    '  pointer-events: none;',
    '  margin-bottom: 0;',
    '  border-color: transparent;',
    '  box-shadow: none;',
    '}',
    '._hpas_panel_outer._open {',
    '  max-height: 600px;',
    '  opacity: 1;',
    '  pointer-events: auto;',
    '  margin-bottom: 10px;',
    '}',

    /* inner panel — flex column */
    '._hpas_panel {',
    '  width: 400px;',
    '  height: 580px;',
    '  display: flex;',
    '  flex-direction: column;',
    '  background: #fff;',
    '}',

    /* header bar inside panel */
    '._hpas_header {',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: space-between;',
    '  padding: 10px 14px;',
    '  background: #166534;',
    '  color: white;',
    '  flex-shrink: 0;',
    '}',
    '._hpas_header_title {',
    '  font-size: 13px;',
    '  font-weight: 600;',
    '  letter-spacing: 0.01em;',
    '}',
    '._hpas_close_btn {',
    '  background: none;',
    '  border: none;',
    '  cursor: pointer;',
    '  color: white;',
    '  padding: 4px;',
    '  border-radius: 6px;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  transition: background 0.15s;',
    '}',
    '._hpas_close_btn:hover { background: rgba(255,255,255,0.15); }',

    '._hpas_iframe {',
    '  width: 100%;',
    '  flex: 1;',
    '  border: none;',
    '  display: block;',
    '}',

    '._hpas_nav {',
    '  display: grid;',
    '  grid-template-columns: repeat(4, 1fr);',
    '  width: 400px;',
    '  border-radius: 14px;',
    '  overflow: hidden;',
    '  box-shadow: 0 4px 20px rgba(0,0,0,0.18);',
    '  border: 1px solid #14532d;',
    '}',

    '._hpas_nav_btn {',
    '  display: flex;',
    '  flex-direction: column;',
    '  align-items: center;',
    '  justify-content: center;',
    '  gap: 4px;',
    '  padding: 10px 0;',
    '  background: #166534;',
    '  border: none;',
    '  cursor: pointer;',
    '  color: white;',
    '  font-size: 11px;',
    '  font-weight: 500;',
    '  font-family: inherit;',
    '  transition: background 0.18s;',
    '  border-right: 1px solid #14532d;',
    '}',
    '._hpas_nav_btn:last-child { border-right: none; }',
    '._hpas_nav_btn:hover { background: #14532d; }',
    '._hpas_nav_btn._active { background: #14532d; }',
  ].join('\n')
  document.head.appendChild(style)

  // ── DOM ────────────────────────────────────────────────────────────────────
  var wrap = document.createElement('div')
  wrap.className = '_hpas_wrap'

  // Outer animated wrapper
  var panelOuter = document.createElement('div')
  panelOuter.className = '_hpas_panel_outer _closed'

  // Inner panel
  var panel = document.createElement('div')
  panel.className = '_hpas_panel'

  // Header bar with title + close button
  var header = document.createElement('div')
  header.className = '_hpas_header'

  var headerTitle = document.createElement('span')
  headerTitle.className = '_hpas_header_title'
  headerTitle.textContent = "Holper's Pest & Animal Solutions"

  var closeBtn = document.createElement('button')
  closeBtn.className = '_hpas_close_btn'
  closeBtn.setAttribute('aria-label', 'Close')
  closeBtn.innerHTML = icons.close
  closeBtn.addEventListener('click', function () {
    activeKey = null
    panelOuter.className = '_hpas_panel_outer _closed'
    nav.querySelectorAll('._hpas_nav_btn').forEach(function (b) {
      b.classList.remove('_active')
    })
  })

  header.appendChild(headerTitle)
  header.appendChild(closeBtn)
  panel.appendChild(header)

  var iframe = document.createElement('iframe')
  iframe.className = '_hpas_iframe'
  iframe.src = WIDGET_URL
  iframe.setAttribute('allow', 'microphone')
  iframe.setAttribute('title', 'Support Widget')
  panel.appendChild(iframe)

  panelOuter.appendChild(panel)

  // Nav bar with 4 buttons
  var nav = document.createElement('div')
  nav.className = '_hpas_nav'

  var activeKey = null

  navItems.forEach(function (item) {
    var btn = document.createElement('button')
    btn.className = '_hpas_nav_btn'
    btn.innerHTML = icons[item.key] + '<span>' + item.label + '</span>'
    btn.setAttribute('aria-label', item.label)

    btn.addEventListener('click', function () {
      if (activeKey === item.key) {
        activeKey = null
        panelOuter.className = '_hpas_panel_outer _closed'
        nav.querySelectorAll('._hpas_nav_btn').forEach(function (b) {
          b.classList.remove('_active')
        })
      } else {
        activeKey = item.key
        panelOuter.className = '_hpas_panel_outer _open'
        nav.querySelectorAll('._hpas_nav_btn').forEach(function (b) {
          b.classList.remove('_active')
        })
        btn.classList.add('_active')
        iframe.contentWindow.postMessage({ type: 'navigate', page: item.key }, '*')
      }
    })

    nav.appendChild(btn)
  })

  wrap.appendChild(panelOuter)
  wrap.appendChild(nav)
  document.body.appendChild(wrap)
})()
