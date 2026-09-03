import { useState } from 'react'
import { BrandMark } from './BrandMark.jsx'

const STATS = [
  { valeur: '1987', label: 'Année de création' },
  { valeur: '9 pays', label: 'Présence panafricaine' },
  { valeur: 'Yaoundé', label: 'Siège du Groupe' },
]

// Connexion par email uniquement : le rôle n'est jamais saisi ici, il est
// retrouvé (ou attribué par défaut au premier accès) côté Dataverse par
// onConnexion — voir seConnecter dans App.jsx. Personne ne peut donc
// s'attribuer un profil en le choisissant dans ce formulaire.
export function LoginPage({ onConnexion, onRetour }) {
  const [identifiant, setIdentifiant] = useState('')
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState('')

  async function soumettre(e) {
    e.preventDefault()
    if (!identifiant.trim()) {
      setErreur('Veuillez renseigner votre adresse email.')
      return
    }
    setErreur('')
    setEnCours(true)
    try {
      await onConnexion(identifiant.trim())
    } catch (error) {
      setErreur(error.message || 'Échec de connexion. Veuillez réessayer.')
      setEnCours(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-brand-panel">
        <div className="landing-hero-pattern" aria-hidden="true" />
        <button className="login-back" onClick={onRetour}>← Retour à l'accueil</button>

        <div className="login-brand-panel-body">
          <BrandMark variant="inverse" />
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
          <BrandMark />

          <h1 className="login-card-heading">
            <span>FirstMaint</span>
            <span className="accent">Afriland</span>
          </h1>
          <p className="login-subtitle">
            Connexion au système FirstMaint. Renseignez votre adresse email
            professionnelle pour accéder à votre espace de gestion de
            maintenance — votre profil est déterminé automatiquement.
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

            {erreur && <div className="login-erreur">{erreur}</div>}

            <button type="submit" className="login-card-submit" disabled={enCours}>
              {enCours ? 'Connexion en cours…' : 'Connexion'}
            </button>
          </form>

          <div className="login-card-divider" />

          <div className="login-card-links">
            <button className="link-button" onClick={onRetour}>Retour à l'accueil</button>
          </div>

          <p className="login-card-footnote">FirstMaint — Afriland First Bank — {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  )
}
