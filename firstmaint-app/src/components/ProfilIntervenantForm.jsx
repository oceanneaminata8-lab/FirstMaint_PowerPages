import { useState } from 'react'
import { BrandMark } from './BrandMark.jsx'

const TYPES_INTERVENANT = ['Technicien', 'Prestataire']

export function ProfilIntervenantForm({ emailConnexion, role, onEnregistrer, onDeconnexion }) {
  const [form, setForm] = useState({
    type: role?.includes('Prestataire') && !role?.includes('Technicien') ? 'Prestataire' : 'Technicien',
    nom: '',
    entreprise: '',
    domaine: '',
    specialite: '',
    telephone: '',
    emailContact: emailConnexion || '',
    ville: '',
    matricule: '',
  })
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState('')

  function modifier(champ, valeur) {
    setForm((prev) => ({ ...prev, [champ]: valeur }))
  }

  async function soumettre(e) {
    e.preventDefault()
    if (!form.nom.trim() || !form.domaine.trim() || !form.specialite.trim()) {
      setErreur('Renseignez au minimum le nom, le domaine et la specialite.')
      return
    }
    setErreur('')
    setEnCours(true)
    try {
      await onEnregistrer({
        ...form,
        nom: form.nom.trim(),
        entreprise: form.entreprise.trim(),
        domaine: form.domaine.trim(),
        specialite: form.specialite.trim(),
        telephone: form.telephone.trim(),
        emailContact: form.emailContact.trim() || emailConnexion,
        identifiantConnexion: emailConnexion,
      })
    } catch (error) {
      setErreur(error.message || 'Impossible d enregistrer ce profil.')
      setEnCours(false)
    }
  }

  return (
    <div className="intervenant-page">
      <section className="intervenant-card">
        <div className="intervenant-card-header">
          <BrandMark />
          <div>
            <span className="page-eyebrow">Profil intervenant</span>
            <h1>Completez vos informations</h1>
            <p>
              Cette adresse sert seulement a entrer dans l application. La DMG doit connaitre
              votre nom, votre domaine et votre specialite pour vous identifier correctement.
            </p>
          </div>
        </div>

        <form className="form-panel intervenant-form" onSubmit={soumettre}>
          <div className="form-field">
            <label>Type d intervenant</label>
            <select value={form.type} onChange={(e) => modifier('type', e.target.value)}>
              {TYPES_INTERVENANT.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

          <div className="form-field">
            <label>{form.type === 'Prestataire' ? 'Nom du contact' : 'Nom complet'}</label>
            <input value={form.nom} onChange={(e) => modifier('nom', e.target.value)} required />
          </div>

          {form.type === 'Prestataire' && (
            <div className="form-field">
              <label>Entreprise / societe</label>
              <input value={form.entreprise} onChange={(e) => modifier('entreprise', e.target.value)} placeholder="Nom du prestataire" />
            </div>
          )}

          <div className="form-field">
            <label>Domaine</label>
            <input value={form.domaine} onChange={(e) => modifier('domaine', e.target.value)} placeholder="Electricite, climatisation, informatique..." required />
          </div>

          <div className="form-field">
            <label>Specialite / champ d intervention</label>
            <input value={form.specialite} onChange={(e) => modifier('specialite', e.target.value)} placeholder="Onduleurs, groupes electrogenes, reseau..." required />
          </div>

          <div className="form-field">
            <label>Telephone</label>
            <input value={form.telephone} onChange={(e) => modifier('telephone', e.target.value)} />
          </div>

          <div className="form-field">
            <label>Email de contact</label>
            <input type="email" value={form.emailContact} onChange={(e) => modifier('emailContact', e.target.value)} />
          </div>

          <div className="form-field">
            <label>Ville / zone</label>
            <input value={form.ville} onChange={(e) => modifier('ville', e.target.value)} placeholder="Douala, Yaounde, Ouest..." />
          </div>

          <div className="form-field">
            <label>Matricule ou reference</label>
            <input value={form.matricule} onChange={(e) => modifier('matricule', e.target.value)} />
          </div>

          {erreur && <div className="login-erreur">{erreur}</div>}

          <div className="form-actions">
            <button type="button" className="btn secondary" onClick={onDeconnexion}>Annuler</button>
            <button type="submit" className="btn" disabled={enCours}>
              {enCours ? 'Enregistrement...' : 'Continuer'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
