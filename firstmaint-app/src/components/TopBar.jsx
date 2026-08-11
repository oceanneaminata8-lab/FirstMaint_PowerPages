import { useState } from 'react'
import logoFirstMaint from '../images/company-logo-transparent.png'
import { Icon } from './Icons.jsx'

// Barre supérieure calquée sur l'entête OpenMaint/CMDBuild : logo à gauche,
// liseré d'icônes utilitaires à droite (info, agenda, profil, alertes,
// configuration, déconnexion) plutôt que le bloc profil en bas de la sidebar.
function initiales(email) {
  if (!email) return '?'
  const local = email.split('@')[0]
  const parts = local.split(/[.\-_]/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return local.slice(0, 2).toUpperCase()
}

export function TopBar({ utilisateurEmail, role, alertesNonLues, onNaviguer, onDeconnexion }) {
  const [menuOuvert, setMenuOuvert] = useState(false)

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <img src={logoFirstMaint} alt="FirstMaint" />
      </div>

      <div className="topbar-icons">
        <button className="topbar-icon-btn topbar-icon-optional" title="À propos de FirstMaint">
          <Icon type="info" />
        </button>
        <button className="topbar-icon-btn topbar-icon-optional" title="Échéancier" onClick={() => onNaviguer('tachesAlertes')}>
          <Icon type="calendrier" />
        </button>
        <button className="topbar-icon-btn" title="Tâches et alertes" onClick={() => onNaviguer('tachesAlertes')}>
          <Icon type="cloche" />
          {alertesNonLues > 0 && <span className="topbar-badge">{alertesNonLues}</span>}
        </button>
        <button className="topbar-icon-btn" title="Configurations" onClick={() => onNaviguer('utilisateurs')}>
          <Icon type="reglages" />
        </button>

        <div className="topbar-user">
          <button className="topbar-user-toggle" onClick={() => setMenuOuvert((v) => !v)}>
            <span className="topbar-avatar">{initiales(utilisateurEmail)}</span>
            <span className="topbar-user-role">{role || 'Utilisateur'}</span>
            <Icon type="chevron" />
          </button>
          {menuOuvert && (
            <div className="topbar-user-menu">
              <div className="topbar-user-email">{utilisateurEmail}</div>
              <button className="topbar-user-logout" onClick={onDeconnexion}>
                <Icon type="deconnexion" /> Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
