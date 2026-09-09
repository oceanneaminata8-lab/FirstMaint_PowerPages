import { useState } from 'react'
import { BrandMark } from './BrandMark.jsx'
import { ROLES } from '../data/appConfig.js'

const STATS = [
  { valeur: '1987', label: 'Annee de creation' },
  { valeur: '9 pays', label: 'Presence panafricaine' },
  { valeur: 'Yaounde', label: 'Siege du Groupe' },
]

export function LoginPage({ onConnexion, onRetour }) {
  const [identifiant, setIdentifiant] = useState('')
  const [roleChoisi, setRoleChoisi] = useState(ROLES[0])
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
      await onConnexion(identifiant.trim(), roleChoisi)
    } catch (error) {
      setErreur(error.message || 'Echec de connexion. Veuillez reessayer.')
      setEnCours(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-brand-panel">
        <div className="landing-hero-pattern" aria-hidden="true" />
        <button className="login-back" onClick={onRetour}>Retour a l'accueil</button>

        <div className="login-brand-panel-body">
          <BrandMark variant="inverse" />
          <h2>La maintenance d'un Groupe panafricain, pilotee avec precision.</h2>
          <p>
            FirstMaint centralise le suivi des actifs, des interventions et des
            sites d'Afriland First Bank, du siege de Yaounde a ses agences a
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
            Renseignez votre adresse email professionnelle, puis choisissez le
            profil a utiliser pour afficher les modules correspondants.
          </p>

          <form onSubmit={soumettre} className="login-form">
            <div className="form-field">
              <label>Email d'utilisateur</label>
              <input
                type="email"
                value={identifiant}
                onChange={(e) => setIdentifiant(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-field">
              <label>Role</label>
              <select value={roleChoisi} onChange={(e) => setRoleChoisi(e.target.value)}>
                {ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            {erreur && <div className="login-erreur">{erreur}</div>}

            <button type="submit" className="login-card-submit" disabled={enCours}>
              {enCours ? 'Connexion en cours...' : 'Connexion'}
            </button>
          </form>

          <div className="login-card-divider" />

          <div className="login-card-links">
            <button className="link-button" onClick={onRetour}>Retour a l'accueil</button>
          </div>

          <p className="login-card-footnote">FirstMaint - Afriland First Bank - {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  )
}
