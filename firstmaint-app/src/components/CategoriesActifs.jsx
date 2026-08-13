import { useState } from 'react'

const CRITICITES = ['Critique', 'Haute', 'Moyenne', 'Basse']
const FREQUENCES = ['Hebdomadaire', 'Mensuelle', 'Trimestrielle', 'Semestrielle', 'Annuelle']

const FORM_VIDE = {
  nom: '', description: '', criticiteParDefaut: 'Moyenne',
  frequencePreventiveParDefaut: 'Trimestrielle', prestataireParDefautId: '', modeOperatoireParDefaut: '',
}

// Familles d'équipement (workflows v2.0, principe directeur 2) : chaque famille
// porte des caractéristiques par défaut — criticité, fréquence préventive,
// prestataire habituel, mode opératoire — dont héritent les fiches actif à la
// création (surchargeables au cas par cas sur l'actif individuel).
export function CategoriesActifs({ categoriesActif, actifs, fournisseurs = [], onCreer }) {
  const [ouvert, setOuvert] = useState(false)
  const [form, setForm] = useState(FORM_VIDE)

  function soumettre(e) {
    e.preventDefault()
    if (!form.nom.trim()) return
    onCreer({ ...form, prestataireParDefautId: form.prestataireParDefautId || null })
    setForm(FORM_VIDE)
    setOuvert(false)
  }

  return (
    <>
      <div className="page-header">
        <span className="page-eyebrow">Archives de base</span>
        <h1>Familles d'équipement</h1>
        <p>Référentiel des familles d'équipements et de leurs caractéristiques par défaut (héritées par les actifs).</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>{categoriesActif.length} famille(s)</h2>
          <button className="btn" onClick={() => setOuvert(!ouvert)}>{ouvert ? 'Annuler' : '+ Nouvelle famille'}</button>
        </div>

        {ouvert && (
          <form className="form-panel" onSubmit={soumettre}>
            <div className="form-field">
              <label>Nom</label>
              <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Criticité par défaut</label>
              <select value={form.criticiteParDefaut} onChange={(e) => setForm({ ...form, criticiteParDefaut: e.target.value })}>
                {CRITICITES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Fréquence préventive par défaut</label>
              <select value={form.frequencePreventiveParDefaut} onChange={(e) => setForm({ ...form, frequencePreventiveParDefaut: e.target.value })}>
                {FREQUENCES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Prestataire par défaut</label>
              <select value={form.prestataireParDefautId} onChange={(e) => setForm({ ...form, prestataireParDefautId: e.target.value })}>
                <option value="">Aucun</option>
                {fournisseurs.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
              </select>
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Mode opératoire par défaut</label>
              <input value={form.modeOperatoireParDefaut} onChange={(e) => setForm({ ...form, modeOperatoireParDefaut: e.target.value })} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn secondary" onClick={() => setOuvert(false)}>Annuler</button>
              <button type="submit" className="btn">Créer la famille</button>
            </div>
          </form>
        )}

        <table>
          <thead>
            <tr>
              <th>Famille</th>
              <th>Criticité par défaut</th>
              <th>Fréquence préventive</th>
              <th>Prestataire par défaut</th>
              <th>Actifs rattachés</th>
            </tr>
          </thead>
          <tbody>
            {categoriesActif.length === 0 && (
              <tr><td colSpan={5} className="empty-state">Aucune famille enregistrée.</td></tr>
            )}
            {categoriesActif.map((c) => {
              const prestataire = fournisseurs.find((f) => f.id === c.prestataireParDefautId)
              return (
                <tr key={c.id}>
                  <td>
                    <strong>{c.nom}</strong>
                    <br />
                    <span style={{ color: 'var(--color-muted)', fontSize: 12 }}>{c.description || '—'}</span>
                  </td>
                  <td>{c.criticiteParDefaut || '—'}</td>
                  <td>{c.frequencePreventiveParDefaut || '—'}</td>
                  <td>{prestataire?.nom || '—'}</td>
                  <td>{actifs.filter((a) => a.categorieId === c.id).length}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
