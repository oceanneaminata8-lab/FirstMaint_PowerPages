import { useState } from 'react'
import logoFirstMaint from '../images/company-logo-transparent.png'
import heroBackground from '../images/hero-background.jpeg'
import { Icon } from './Icons.jsx'
import { ROLES } from '../data/mockData.js'

const STATS = [
  { valeur: '1987', label: 'Année de création' },
  { valeur: '9 pays', label: 'Présence panafricaine' },
  { valeur: 'Yaoundé', label: 'Siège du Groupe' },
]

// Connexion en mode démonstration : aucune vérification côté serveur pour
// l'instant, seuls les champs sont validés. L'authentification réelle sera
// branchée sur Dataverse / Azure AD plus tard.
// Le sélecteur de profil détermine l'affichage différencié par profil requis
// par le cahier des charges (US-06) : il filtre le menu et les tableaux de bord.
export function LoginPage({ onConnexion, onRetour, emplacements = [] }) {
  const [identifiant, setIdentifiant] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [motDePasseVisible, setMotDePasseVisible] = useState(false)
  const [role, setRole] = useState(ROLES[0])
  const sitesRacine = emplacements.filter((e) => !e.parentId)
  const [siteId, setSiteId] = useState('')
  const [erreur, setErreur] = useState('')

  function soumettre(e) {
    e.preventDefault()
    if (!identifiant.trim() || !motDePasse.trim()) {
      setErreur('Veuillez renseigner votre email d\'utilisateur et votre mot de passe.')
      return
    }
    setErreur('')
    onConnexion(identifiant, role, siteId)
  }

  function ouvrirApplication() {
    onConnexion(identifiant.trim() || 'demo@afrilandfirstbank.com', role, siteId)
  }

  return (
    <div className="login-page">
      <div
        className="login-brand-panel"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(20,20,20,0.82) 0%, rgba(20,20,20,0.93) 65%, rgba(20,20,20,0.97) 100%), url(${heroBackground})`,
        }}
      >
        <div className="landing-hero-pattern" aria-hidden="true" />
        <button className="login-back" onClick={onRetour}>← Retour à l'accueil</button>

        <div className="login-brand-panel-body">
          <img src={logoFirstMaint} alt="FirstMaint" className="login-brand-logo" />
          <h2>La maintenance d'un Groupe panafricain, pilotée avec précision.</h2>
          <p>
            FirstMaint centralise le suivi des actifs, des interventions et des
            sites d'Afriland First Bank — du siège de Yaoundé à ses agences à
            travers le continent.
          </p>

          <div className="login-stats">
            {STATS.map((s) => (
              <div key={s.label} className="login-stat">
                <span className="value">{s.valeur}</span>
                <span className="label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="login-form-panel">
        <div className="login-card login-card-v2">
          <img src={logoFirstMaint} alt="FirstMaint" className="login-card-logo" />

          <h1 className="login-card-heading">
            <span>FirstMaint</span>
            <span className="accent">Afriland</span>
          </h1>
          <p className="login-subtitle">
            Connexion au système FirstMaint. Authentifiez-vous pour accéder à
            votre espace de gestion de maintenance.
          </p>

          <form onSubmit={soumettre} className="login-form">
            <div className="form-field">
              <label>Email d'utilisateur</label>
              <input
                type="email"
                value={identifiant}
                onChange={(e) => setIdentifiant(e.target.value)}
                placeholder="jean.mballa@afrilandfirstbank.com"
                autoFocus
              />
            </div>
            <div className="form-field">
              <label>Mot de passe</label>
              <div className="login-password-field">
                <input
                  type={motDePasseVisible ? 'text' : 'password'}
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setMotDePasseVisible((v) => !v)}
                  aria-label={motDePasseVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  <Icon type={motDePasseVisible ? 'oeil-barre' : 'oeil'} />
                </button>
              </div>
            </div>
            <div className="form-field">
              <label>Profil</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {role === 'Responsable de site' && (
              <div className="form-field">
                <label>Site (sécurité par ligne — vous ne verrez que ce site)</label>
                <select value={siteId} onChange={(e) => setSiteId(e.target.value)}>
                  <option value="">Tous les sites (démonstration)</option>
                  {sitesRacine.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
              </div>
            )}

            {erreur && <div className="login-erreur">{erreur}</div>}

            <button type="submit" className="login-card-submit">Connexion</button>
          </form>

          <div className="login-card-divider" />

          <div className="login-card-links">
            <button className="link-button" onClick={onRetour}>Retour à l'accueil</button>
            <button className="link-button" onClick={ouvrirApplication}>Ouvrir l'application</button>
          </div>

          <p className="login-card-footnote">FirstMaint — Afriland First Bank — {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  )
}
