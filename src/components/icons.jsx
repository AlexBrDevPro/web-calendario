const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

function Svg({ children, className = 'w-5 h-5', ...rest }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} {...rest}>
      {children}
    </svg>
  )
}

export const Plus = (p) => (<Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>)
export const X = (p) => (<Svg {...p}><path d="M18 6L6 18M6 6l12 12" /></Svg>)
export const ChevronLeft = (p) => (<Svg {...p}><path d="M15 18l-6-6 6-6" /></Svg>)
export const ChevronRight = (p) => (<Svg {...p}><path d="M9 18l6-6-6-6" /></Svg>)
export const Calendar = (p) => (<Svg {...p}>
  <rect x="3" y="4" width="18" height="18" rx="2"/>
  <path d="M16 2v4M8 2v4M3 10h18"/>
</Svg>)
export const Clock = (p) => (<Svg {...p}>
  <circle cx="12" cy="12" r="10"/>
  <path d="M12 6v6l4 2"/>
</Svg>)
export const Trash = (p) => (<Svg {...p}>
  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
</Svg>)
export const Pencil = (p) => (<Svg {...p}>
  <path d="M12 20h9"/>
  <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z"/>
</Svg>)
export const Eye = (p) => (<Svg {...p}>
  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
  <circle cx="12" cy="12" r="3"/>
</Svg>)
export const Tag = (p) => (<Svg {...p}>
  <path d="M20.59 13.41L13 21l-9-9V4h8l8.59 8.59a2 2 0 010 2.82z"/>
  <circle cx="7.5" cy="7.5" r="1.5"/>
</Svg>)
export const Repeat = (p) => (<Svg {...p}>
  <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
  <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
</Svg>)
export const Check = (p) => (<Svg {...p}><polyline points="20 6 9 17 4 12"/></Svg>)
export const Sun = (p) => (<Svg {...p}>
  <circle cx="12" cy="12" r="4"/>
  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
</Svg>)
export const Moon = (p) => (<Svg {...p}>
  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
</Svg>)
export const Users = (p) => (<Svg {...p}>
  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
  <circle cx="9" cy="7" r="4"/>
  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
</Svg>)
export const Filter = (p) => (<Svg {...p}>
  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
</Svg>)
export const LogOut = (p) => (<Svg {...p}>
  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
  <polyline points="16 17 21 12 16 7"/>
  <line x1="21" y1="12" x2="9" y2="12"/>
</Svg>)
