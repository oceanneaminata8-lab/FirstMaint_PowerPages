// Icônes sobres en SVG (traits, monochromes) — pas d'emoji, pour un rendu plus
// institutionnel, partagées entre la landing page, la sidebar et les listes.
export function Icon({ type }) {
  const props = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (type) {
    case 'dashboard':
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7.5" height="9" rx="1.2" />
          <rect x="13.5" y="3" width="7.5" height="5.5" rx="1.2" />
          <rect x="13.5" y="11" width="7.5" height="10" rx="1.2" />
          <rect x="3" y="15" width="7.5" height="6" rx="1.2" />
        </svg>
      )
    case 'actifs':
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="12" rx="1.5" />
          <line x1="8" y1="20" x2="16" y2="20" />
          <line x1="12" y1="16" x2="12" y2="20" />
        </svg>
      )
    case 'emplacements':
      return (
        <svg {...props}>
          <rect x="5" y="3" width="14" height="18" rx="1" />
          <rect x="8" y="6.5" width="2.4" height="2.4" />
          <rect x="13.6" y="6.5" width="2.4" height="2.4" />
          <rect x="8" y="11.5" width="2.4" height="2.4" />
          <rect x="13.6" y="11.5" width="2.4" height="2.4" />
          <rect x="9.7" y="16.2" width="4.6" height="4.8" />
        </svg>
      )
    case 'ordres':
      return (
        <svg {...props}>
          <rect x="5" y="4" width="14" height="17" rx="1.5" />
          <rect x="9" y="2.3" width="6" height="3" rx="1" />
          <line x1="8" y1="10.5" x2="16" y2="10.5" />
          <line x1="8" y1="14" x2="16" y2="14" />
          <line x1="8" y1="17.5" x2="13" y2="17.5" />
        </svg>
      )
    case 'tickets':
      return (
        <svg {...props}>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <line x1="12" y1="6" x2="12" y2="18" strokeDasharray="1.5 2.5" />
        </svg>
      )
    case 'preventive':
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="16" rx="1.5" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="7" y1="3" x2="7" y2="7" />
          <line x1="17" y1="3" x2="17" y2="7" />
          <polyline points="8,15 10.7,17.7 16,12.3" />
        </svg>
      )
    case 'fournisseurs':
      return (
        <svg {...props}>
          <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
          <polyline points="14,3 14,7 18,7" />
          <line x1="8.5" y1="12" x2="15.5" y2="12" />
          <line x1="8.5" y1="15.3" x2="15.5" y2="15.3" />
        </svg>
      )
    case 'alerte':
      return (
        <svg {...props}>
          <path d="M12 3.5 21.5 20h-19z" strokeLinejoin="round" />
          <line x1="12" y1="9.5" x2="12" y2="14" />
          <circle cx="12" cy="16.8" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'plus':
      return (
        <svg {...props}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      )
    case 'folder':
      return (
        <svg {...props}>
          <path d="M3 6.5a1 1 0 0 1 1-1h4.5l2 2H20a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
        </svg>
      )
    case 'chevron':
      return (
        <svg {...props}>
          <polyline points="9,6 15,12 9,18" />
        </svg>
      )
    case 'search':
      return (
        <svg {...props}>
          <circle cx="10.5" cy="10.5" r="6.5" />
          <line x1="15.3" y1="15.3" x2="20" y2="20" />
        </svg>
      )
    case 'menu':
      return (
        <svg {...props}>
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      )
    case 'close':
      return (
        <svg {...props}>
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
      )
    case 'oeil':
      return (
        <svg {...props}>
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
          <circle cx="12" cy="12" r="2.8" />
        </svg>
      )
    case 'oeil-barre':
      return (
        <svg {...props}>
          <path d="M3.5 3.5l17 17" />
          <path d="M10.6 5.3C11 5.2 11.5 5.2 12 5.2c6.4 0 10 6.8 10 6.8a17.6 17.6 0 0 1-3.4 4.3M6.6 6.7C4 8.4 2 12 2 12s3.6 6.8 10 6.8c1.3 0 2.4-.3 3.4-.7" />
          <path d="M9.7 9.9a2.8 2.8 0 0 0 3.9 3.9" />
        </svg>
      )
    case 'retour':
      return (
        <svg {...props}>
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="11,6 5,12 11,18" />
        </svg>
      )
    case 'stock':
      return (
        <svg {...props}>
          <path d="M3 8l9-5 9 5-9 5-9-5z" />
          <path d="M3 8v8l9 5 9-5V8" />
          <line x1="12" y1="13" x2="12" y2="21" />
        </svg>
      )
    case 'energie':
      return (
        <svg {...props}>
          <polygon points="13,2 4,14 11,14 9,22 20,9 12,9 13,2" />
        </svg>
      )
    case 'utilisateurs':
      return (
        <svg {...props}>
          <circle cx="9" cy="8" r="3.2" />
          <path d="M3 20c0-3.6 2.7-6 6-6s6 2.4 6 6" />
          <path d="M16.5 5.5a3.2 3.2 0 0 1 0 6.2" />
          <path d="M20.5 20c0-3-1.9-5.2-4.5-5.9" />
        </svg>
      )
    case 'info':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="11" x2="12" y2="16.5" />
          <circle cx="12" cy="7.7" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'calendrier':
      return (
        <svg {...props}>
          <rect x="3.5" y="5" width="17" height="15.5" rx="1.2" />
          <line x1="3.5" y1="9.5" x2="20.5" y2="9.5" />
          <line x1="7.5" y1="2.8" x2="7.5" y2="6.5" />
          <line x1="16.5" y1="2.8" x2="16.5" y2="6.5" />
        </svg>
      )
    case 'cloche':
      return (
        <svg {...props}>
          <path d="M6 17v-5.5a6 6 0 0 1 12 0V17l1.8 2.3H4.2z" />
          <path d="M10 20.5a2.2 2.2 0 0 0 4 0" />
        </svg>
      )
    case 'reglages':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.5-2-3.4-2.4 1a7.6 7.6 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.6a7.6 7.6 0 0 0-2.6 1.5l-2.4-1-2 3.4 2 1.5a7.6 7.6 0 0 0 0 3l-2 1.5 2 3.4 2.4-1a7.6 7.6 0 0 0 2.6 1.5l.4 2.6h4l.4-2.6a7.6 7.6 0 0 0 2.6-1.5l2.4 1 2-3.4z" />
        </svg>
      )
    case 'deconnexion':
      return (
        <svg {...props}>
          <path d="M14 7V5a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 5v14A1.5 1.5 0 0 0 6 20.5h6.5A1.5 1.5 0 0 0 14 19v-2" />
          <line x1="9.5" y1="12" x2="20.5" y2="12" />
          <polyline points="17,8.5 20.5,12 17,15.5" />
        </svg>
      )
    case 'actualiser':
      return (
        <svg {...props}>
          <path d="M4 12a8 8 0 0 1 14-5.2M20 12a8 8 0 0 1-14 5.2" />
          <polyline points="18,4 18.5,7.5 15,7" />
          <polyline points="6,20 5.5,16.5 9,17" />
        </svg>
      )
    case 'imprimer':
      return (
        <svg {...props}>
          <rect x="6" y="8.5" width="12" height="7" rx="1" />
          <path d="M7 8.5V4.5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v4" />
          <path d="M7 15.5v3.5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3.5" />
        </svg>
      )
    default:
      return null
  }
}
