(function () {
  // ── Config from data-* attributes ─────────────────────────────────────────
  var scriptTag = document.currentScript || (function () {
    var s = document.getElementsByTagName('script')
    return s[s.length - 1]
  })()

  var WIDGET_URL    = scriptTag.getAttribute('data-url')         || 'http://localhost:5173'
  var COLOR_PRIMARY = scriptTag.getAttribute('data-color')        || '#166534'
  var COLOR_DARK    = scriptTag.getAttribute('data-color-dark')   || '#14532d'
  var SUB_HEADER_BG = scriptTag.getAttribute('data-sub-header-bg') || COLOR_PRIMARY
  var COLOR_TEXT    = scriptTag.getAttribute('data-text-color')   || '#ffffff'
  var TITLE         = scriptTag.getAttribute('data-title')        || "Holper's Pest & Animal Solutions"
  var PANEL_WIDTH   = parseInt(scriptTag.getAttribute('data-width'),  10) || 400
  var PANEL_HEIGHT  = parseInt(scriptTag.getAttribute('data-height'), 10) || 580
  var BOTTOM        = scriptTag.getAttribute('data-bottom')       || '24px'
  var RIGHT         = scriptTag.getAttribute('data-right')        || '24px'
  
  // New customization attributes
  var HEADER_HEIGHT = scriptTag.getAttribute('data-header-height') || '44'
  var HEADER_FS     = scriptTag.getAttribute('data-header-fs')     || '13'
  var BTN_TEXT      = scriptTag.getAttribute('data-btn-text')      || 'Submit'
  var BTN_FS        = scriptTag.getAttribute('data-btn-fs')        || '13'
  var BTN_RADIUS    = scriptTag.getAttribute('data-btn-radius')    || '9'
  var CHAT_BG       = scriptTag.getAttribute('data-chat-bg')       || '#f3f4f6'
  var FORM_BG       = scriptTag.getAttribute('data-form-bg')       || '#ffffff'

  // which tabs to show (comma-separated keys)
  var TAB_KEYS_RAW  = scriptTag.getAttribute('data-tabs') || 'chat,call,text,email'
  var ENABLED_TABS  = TAB_KEYS_RAW.split(',').map(function(s){ return s.trim() }).filter(Boolean)

  // custom tab labels (comma-separated, same order as data-tabs)
  var TAB_LABELS_RAW = scriptTag.getAttribute('data-tab-labels') || ''
  var customLabels   = TAB_LABELS_RAW ? TAB_LABELS_RAW.split(',').map(function(s){ return s.trim() }) : []

  // ── Inline SVGs ────────────────────────────────────────────────────────────
  var icons = {
    chat:  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    call:  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l1.27-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    text:  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="13" y2="14"/></svg>',
    email: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
    close: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
  }

  // build navItems from enabled tabs, apply custom labels
  var allTabDefs = [
    { key: 'chat',  label: 'Chat'  },
    { key: 'call',  label: 'Call'  },
    { key: 'text',  label: 'Text'  },
    { key: 'email', label: 'Email' },
  ]
  var navItems = []
  ENABLED_TABS.forEach(function(key, idx) {
    var def = allTabDefs.find(function(d){ return d.key === key })
    if (!def) return
    navItems.push({
      key:   key,
      label: (customLabels[idx] && customLabels[idx].length) ? customLabels[idx] : def.label
    })
  })

  var colCount = navItems.length || 1

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

    '._hpas_panel_outer {',
    '  width: ' + PANEL_WIDTH + 'px;',
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
    '  max-height: ' + (PANEL_HEIGHT + 20) + 'px;',
    '  opacity: 1;',
    '  pointer-events: auto;',
    '  margin-bottom: 10px;',
    '}',

    '._hpas_panel {',
    '  width: ' + PANEL_WIDTH + 'px;',
    '  height: ' + PANEL_HEIGHT + 'px;',
    '  display: flex;',
    '  flex-direction: column;',
    '  background: #fff;',
    '}',

    '._hpas_header {',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: space-between;',
    '  padding: 0 14px;',
    '  height: ' + HEADER_HEIGHT + 'px;',
    '  background: ' + COLOR_PRIMARY + ';',
    '  color: ' + COLOR_TEXT + ';',
    '  flex-shrink: 0;',
    '}',
    '._hpas_header_title {',
    '  font-size: ' + HEADER_FS + 'px;',
    '  font-weight: 600;',
    '  letter-spacing: 0.01em;',
    '}',
    '._hpas_close_btn {',
    '  background: none;',
    '  border: none;',
    '  cursor: pointer;',
    '  color: ' + COLOR_TEXT + ';',
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
    '  grid-template-columns: repeat(' + colCount + ', 1fr);',
    '  width: ' + PANEL_WIDTH + 'px;',
    '  border-radius: 14px;',
    '  overflow: hidden;',
    '  box-shadow: 0 4px 20px rgba(0,0,0,0.18);',
    '  border: 1px solid ' + COLOR_DARK + ';',
    '}',

    '._hpas_nav_btn {',
    '  display: flex;',
    '  flex-direction: column;',
    '  align-items: center;',
    '  justify-content: center;',
    '  gap: 4px;',
    '  padding: 10px 0;',
    '  background: ' + COLOR_PRIMARY + ';',
    '  border: none;',
    '  cursor: pointer;',
    '  color: ' + COLOR_TEXT + ';',
    '  font-size: 11px;',
    '  font-weight: 500;',
    '  font-family: inherit;',
    '  transition: background 0.18s;',
    '  border-right: 1px solid ' + COLOR_DARK + ';',
    '}',
    '._hpas_nav_btn:last-child { border-right: none; }',
    '._hpas_nav_btn:hover { background: ' + COLOR_DARK + '; }',
    '._hpas_nav_btn._active { background: ' + COLOR_DARK + '; }',
  ].join('\n')
  document.head.appendChild(style)

  // ── DOM ────────────────────────────────────────────────────────────────────
  var wrap = document.createElement('div')
  wrap.className = '_hpas_wrap'

  var panelOuter = document.createElement('div')
  panelOuter.className = '_hpas_panel_outer _closed'

  var panel = document.createElement('div')
  panel.className = '_hpas_panel'

  var header = document.createElement('div')
  header.className = '_hpas_header'

  var headerTitle = document.createElement('span')
  headerTitle.className = '_hpas_header_title'
  headerTitle.textContent = TITLE

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
  
  // Construct URL with query params for the app to consume
  var params = new URLSearchParams({
    colorPrimary: COLOR_PRIMARY,
    colorDark:    COLOR_DARK,
    colorSubHeaderBg: SUB_HEADER_BG,
    colorText:    COLOR_TEXT,
    headerHeight: HEADER_HEIGHT,
    headerFontSize: HEADER_FS,
    btnText:      BTN_TEXT,
    btnFontSize:  BTN_FS,
    btnRadius:    BTN_RADIUS,
    colorChatBg:  CHAT_BG,
    colorFormBg:  FORM_BG
  })
  iframe.src = WIDGET_URL + (WIDGET_URL.indexOf('?') === -1 ? '?' : '&') + params.toString()
  
  iframe.setAttribute('allow', 'microphone')
  iframe.setAttribute('title', 'Support Widget')
  panel.appendChild(iframe)

  panelOuter.appendChild(panel)

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
