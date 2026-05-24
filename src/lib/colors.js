// Helpers de color compartidos por todas las vistas.
// Adaptan el color base de cada categoría a la legibilidad del tema actual.

export function hexToRgba(hex, alpha) {
  if (!hex || hex[0] !== '#') return hex
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')'
}

// Devuelve una versión oscura del color (para texto sobre fondos claros)
export function darken(hex, factor) {
  if (!hex || hex[0] !== '#') return hex
  const f = factor == null ? 0.55 : factor
  const h = hex.replace('#', '')
  let r = parseInt(h.substring(0, 2), 16)
  let g = parseInt(h.substring(2, 4), 16)
  let b = parseInt(h.substring(4, 6), 16)
  r = Math.floor(r * f); g = Math.floor(g * f); b = Math.floor(b * f)
  return 'rgb(' + r + ',' + g + ',' + b + ')'
}

// Devuelve una versión clara del color (para texto sobre fondos oscuros)
export function lighten(hex, amount) {
  if (!hex || hex[0] !== '#') return hex
  const a = amount == null ? 0.55 : amount
  const h = hex.replace('#', '')
  let r = parseInt(h.substring(0, 2), 16)
  let g = parseInt(h.substring(2, 4), 16)
  let b = parseInt(h.substring(4, 6), 16)
  r = Math.min(255, Math.floor(r + (255 - r) * a))
  g = Math.min(255, Math.floor(g + (255 - g) * a))
  b = Math.min(255, Math.floor(b + (255 - b) * a))
  return 'rgb(' + r + ',' + g + ',' + b + ')'
}

// Paleta lista para usar en un evento, adaptada al tema.
// theme: 'cookie' | 'dark'
// Devuelve { bg, bgStrong, text, textSoft, border }
export function getEventColors(hex, theme) {
  if (theme === 'dark') {
    return {
      bg:       hexToRgba(hex, 0.22),
      bgStrong: hexToRgba(hex, 0.32),
      text:     lighten(hex, 0.55),  // claro y legible sobre fondo oscuro
      textSoft: lighten(hex, 0.35),
      border:   hex,
    }
  }
  // cookie (claro)
  return {
    bg:       hexToRgba(hex, 0.10),
    bgStrong: hexToRgba(hex, 0.18),
    text:     darken(hex, 0.55),
    textSoft: darken(hex, 0.70),
    border:   hex,
  }
}
