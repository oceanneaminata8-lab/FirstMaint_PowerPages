import { useState } from 'react'
import { EmplacementChain } from './EmplacementChain.jsx'

const TYPES_ENERGIE = ['Électricité', 'Carburant (groupe électrogène)', 'Eau']

function formatMontant(montant) {
  return `${(montant || 0).toLocaleString('fr-FR')} FCFA`
}

export function ConsommationEnergie({ consommationsEnergie, emplacements, onCreer }) {
  const [ouvert, setOuvert] = useState(false)
  const [form, setForm] = useState({
    emplacementId: emplacements[0]?.id || '', typeEnergie: 'Électricité', date: '', valeur: '', unite: 'kWh', cout: '',
  })

  const coutTotal = consommationsEnergie.reduce((s, c) => s + (c.cout || 0), 0)

  function soumettre(e) {
    e.preventDefault()
    if (!form.date || !form.valeur) return
    onCreer({ ...form, valeur: Number(form.valeur) || 0, cout: Number(form.cout) || 0 })
    setForm({ ...form, date: '', valeur: '', cout: '' })
    setOuvert(false)
  }

  return (
    <>
      <div className="page-header">
        <span className="page-eyebrow">Gestion de l'énergie</span>
        <h1>Relevés de consommation</h1>
        <p>Suivi de la consommation électrique, du carburant et de l'eau par site.</p>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="kpi-card">
          <div className="kpi-body">
            <div className="value">{consommationsEnergie.length}</div>
            <div className="label">Relevé(s) enregistré(s)</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-body">
            <div className="value">{formatMontant(coutTotal)}</div>
            <div className="label">Coût cumulé</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Relevés</h2>
          <button className="btn" onClick={() => setOuvert(!ouvert)}>{ouvert ? 'Annuler' : '+ Nouveau relevé'}</button>
        </div>

        {ouvert && (
          <form className="form-panel" onSubmit={soumettre}>
            <div className="form-field">
              <label>Emplacement</label>
              <select value={form.emplacementId} onChange={(e) => setForm({ ...form, emplacementId: e.target.value })}>
                {emplacements.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Type d'énergie</label>
              <select value={form.typeEnergie} onChange={(e) => setForm({ ...form, typeEnergie: e.target.value })}>
                {TYPES_ENERGIE.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Date du relevé</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Valeur</label>
              <input type="number" value={form.valeur} onChange={(e) => setForm({ ...form, valeur: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Unité</label>
              <input value={form.unite} onChange={(e) => setForm({ ...form, unite: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Coût (FCFA)</label>
              <input type="number" value={form.cout} onChange={(e) => setForm({ ...form, cout: e.target.value })} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn secondary" onClick={() => setOuvert(false)}>Annuler</button>
              <button type="submit" className="btn">Enregistrer le relevé</button>
            </div>
          </form>
        )}

        <table>
          <thead>
            <tr>
              <th>Emplacement</th>
              <th>Type</th>
              <th>Date</th>
              <th>Valeur</th>
              <th>Coût</th>
            </tr>
          </thead>
          <tbody>
            {consommationsEnergie.length === 0 && (
              <tr><td colSpan={5} className="empty-state">Aucun relevé enregistré.</td></tr>
            )}
            {[...consommationsEnergie].sort((a, b) => new Date(b.date) - new Date(a.date)).map((c) => (
              <tr key={c.id}>
                <td><EmplacementChain emplacementId={c.emplacementId} emplacements={emplacements} /></td>
                <td>{c.typeEnergie}</td>
                <td>{c.date}</td>
                <td>{c.valeur} {c.unite}</td>
                <td>{formatMontant(c.cout)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
