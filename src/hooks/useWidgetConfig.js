/**
 * useWidgetConfig — reads the saved widget config.
 * When inside an iframe, it PRIORITIZES URL query parameters.
 * When standalone/preview, it falls back to localStorage.
 */

const STORAGE_KEY = 'hpas_widget_settings'

const DEFAULTS = {
  colorPrimary:     '#166534',
  colorDark:      '#14532d',
  colorSubHeaderBg: '#166534',
  colorText:      '#ffffff',
  colorChatBg:    '#f3f4f6',
  colorFormBg:    '#ffffff',
  headerHeight:   44,
  headerFontSize: 13,
  btnText:        'Submit',
  btnFontSize:    13,
  btnRadius:      9,
}

export function getWidgetConfig() {
  const urlParams = new URLSearchParams(window.location.search)
  
  // If we have query params (usually means we are embedded and widget.js passed them)
  if (urlParams.has('colorPrimary')) {
    return {
      colorPrimary:   urlParams.get('colorPrimary')   || DEFAULTS.colorPrimary,
      colorDark:      urlParams.get('colorDark')      || DEFAULTS.colorDark,
      colorSubHeaderBg: urlParams.get('colorSubHeaderBg') || urlParams.get('colorPrimary') || DEFAULTS.colorSubHeaderBg,
      colorText:      urlParams.get('colorText')      || DEFAULTS.colorText,
      colorChatBg:    urlParams.get('colorChatBg')    || DEFAULTS.colorChatBg,
      colorFormBg:    urlParams.get('colorFormBg')    || DEFAULTS.colorFormBg,
      headerHeight:   Number(urlParams.get('headerHeight'))   || DEFAULTS.headerHeight,
      headerFontSize: Number(urlParams.get('headerFontSize')) || DEFAULTS.headerFontSize,
      btnText:        urlParams.get('btnText')        || DEFAULTS.btnText,
      btnFontSize:    Number(urlParams.get('btnFontSize'))    || DEFAULTS.btnFontSize,
      btnRadius:      Number(urlParams.get('btnRadius'))      || DEFAULTS.btnRadius,
    }
  }

  // Fallback to localStorage (for preview inside settings page or standalone)
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return { ...DEFAULTS, ...JSON.parse(saved) }
  } catch (e) { void e }
  
  return { ...DEFAULTS }
}
