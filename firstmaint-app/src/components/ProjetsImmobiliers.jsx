import { useState } from 'react'
import { EmplacementChain } from './EmplacementChain.jsx'

const TYPES_PROJET = ['Construction', 'Rénovation', 'Extension']
const STATUTS_PROJET = { 'Planifié': 'info', 'En cours': 'attention', 'Terminé': 'succes', 'Suspendu': 'neutre' }
const STATUTS_JALON = ['À venir', 'En cours', 'Atteint', 'Retardé']
const TONS_JALON = { 'À venir': 'info', 'En cours': 'attention', 'Atteint': 'succes', 'Retardé': 'urgent' }

function formatBudget(montant) {
  return `${(montant || 0).toLocaleString('fr-FR')} FCFA`
}

function DepenseForm({ projet, onEnregistrerDepense }) {
  const [ouvert, setOuvert] = useState(false)
  const [montant, setMontant] = useState('')

  function soumettre(e) {
    e.preventDefault()
    const valeur = Number(montant)
    if (!valeur) return
    onEnregistrerDepense(projet.id, valeur)
    setMontant('')
    setOuvert(false)
  }

  if (!ouvert) {
    return <button className="btn secondary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => setOuvert(true)}>+ Dépense</button>
  }

  return (
    <form onSubmit={soumettre} style={{ display: 'flex', gap: 6 }}>
      <input
        type="number"
        placeholder="Montant"
        value={montant}
        onChange={(e) => setMontant(e.target.value)}
        style={{ width: 100, fontSize: 12, padding: '4px 6px' }}
        autoFocus
      />
      <button type="submit" className="btn secondary" style={{ padding: '4px 8px', fontSize: 12 }}>OK</button>
    </form>
  )
}

export function ProjetsImmobiliers({
  projetsImmobiliers, jalonsProjets, emplacements,
  onCreerProjet, onChangerStatutJalon, onEnregistrerDepense, onReceptionner,
}) {
  const [ouvert, setOuvert] = useState(false)
  const [form, setForm] = useState({
    nom: '', emplacementId: emplacements[0]?.id || '', typeProjet: 'Rénovation',
    budget: '', dateDebut: '', dateFinPrevue: '', chefProjet: '',
  })

  function soumettre(e) {
    e.preventDefault()
    if (!form.nom.trim()) return
    onCreerProjet({ ...form, budget: Number(form.budget) || 0, budgetConsomme: 0 })
    setForm({ ...form, nom: '', budget: '', dateDebut: '', dateFinPrevue: '', chefProjet: '' })
    setOuvert(false)
  }

  return (
    <>
      <div className="page-header">
        <span className="page-eyebrow">Modules Afriland</span>
        <h1>Projets immobiliers</h1>
        <p>Constructions, rénovations et extensions des sites du Groupe.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>{projetsImmobiliers.length} projet(s)</h2>
          <button className="btn" onClick={() => setOuvert(!ouvert)}>
            {ouvert ? 'Annuler' : '+ Nouveau projet'}
          </button>
        </div>

        {ouvert && (
          <form className="form-panel" onSubmit={soumettre}>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Nom du projet</label>
              <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Emplacement</label>
              <select value={form.emplacementId} onChange={(e) => setForm({ ...form, emplacementId: e.target.value })}>
                {emplacements.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Type de projet</label>
              <select value={form.typeProjet} onChange={(e) => setForm({ ...form, typeProjet: e.target.value })}>
                {TYPES_PROJET.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Budget (FCFA)</label>
              <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Chef de projet</label>
              <input value={form.chefProjet} onChange={(e) => setForm({ ...form, chefProjet: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Date de début</label>
              <input type="date" value={form.dateDebut} onChange={(e) => setForm({ ...form, dateDebut: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Date de fin prévue</label>
              <input type="date" value={form.dateFinPrevue} onChange={(e) => setForm({ ...form, dateFinPrevue: e.target.value })} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn secondary" onClick={() => setOuvert(false)}>Annuler</button>
              <button type="submit" className="btn">Créer le projet</button>
            </div>
          </form>
        )}

        <table>
          <thead>
            <tr>
              <th>Projet</th>
              <th>Emplacement</th>
              <th>Type</th>
              <th>Budget consommé / alloué</th>
              <th>Échéance</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {projetsImmobiliers.length === 0 && (
              <tr><td colSpan={7} className="empty-state">Aucun projet enregistré.</td></tr>
            )}
            {projetsImmobiliers.map((p) => {
              const tauxConsomme = p.budget ? Math.round(((p.budgetConsomme || 0) / p.budget) * 100) : 0
              const depassement = tauxConsomme > 110
              const jalonsDuProjet = jalonsProjets.filter((j) => j.projetId === p.id)
              const tousJalonsAtteints = jalonsDuProjet.length > 0 && jalonsDuProjet.every((j) => j.statut === 'Atteint')
              return (
                <tr key={p.id}>
                  <td>
                    <strong>{p.nom}</strong>
                    <br />
                    <span style={{ color: 'var(--color-muted)', fontSize: 12 }}>{p.chefProjet}</span>
                  </td>
                  <td><EmplacementChain emplacementId={p.emplacementId} emplacements={emplacements} /></td>
                  <td>{p.typeProjet}</td>
                  <td>
                    <div style={{ fontSize: 12.5, color: depassement ? 'var(--status-urgent)' : 'inherit', fontWeight: depassement ? 600 : 400 }}>
                      {formatBudget(p.budgetConsomme)} / {formatBudget(p.budget)} ({tauxConsomme}%)
                      {depassement && ' — dépassement'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <div style={{ flex: 1, height: 5, background: 'var(--color-surface-sunken)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(tauxConsomme, 100)}%`, height: '100%',
                          background: depassement ? 'var(--status-urgent)' : 'var(--color-accent)',
                        }} />
                      </div>
                      {p.statut !== 'Terminé' && <DepenseForm projet={p} onEnregistrerDepense={onEnregistrerDepense} />}
                    </div>
                  </td>
                  <td>{p.dateFinPrevue || '—'}</td>
                  <td>
                    <span className="badge" style={{
                      color: `var(--status-${STATUTS_PROJET[p.statut] || 'neutre'})`,
                      background: `var(--status-${STATUTS_PROJET[p.statut] || 'neutre'}-bg)`,
                    }}>
                      {p.statut}
                    </span>
                  </td>
                  <td>
                    {p.statut !== 'Terminé' && (
                      <button
                        className="btn secondary"
                        style={{ padding: '4px 8px', fontSize: 12 }}
                        disabled={!tousJalonsAtteints}
                        title={tousJalonsAtteints ? 'Bascule le projet en exploitation' : 'Tous les jalons doivent être Atteint'}
                        onClick={() => onReceptionner(p.id)}
                      >
                        Réceptionner
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>{jalonsProjets.length} jalon(s)</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Jalon</th>
              <th>Projet</th>
              <th>Échéance</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {jalonsProjets.length === 0 && (
              <tr><td colSpan={4} className="empty-state">Aucun jalon enregistré.</td></tr>
            )}
            {jalonsProjets.map((j) => {
              const projet = projetsImmobiliers.find((p) => p.id === j.projetId)
              return (
                <tr key={j.id}>
                  <td>{j.nom}</td>
                  <td>{projet?.nom || '—'}</td>
                  <td>{j.dateEcheance}</td>
                  <td>
                    <select
                      value={j.statut}
                      onChange={(e) => onChangerStatutJalon(j.id, e.target.value)}
                      style={{ border: 'none', background: 'transparent', fontSize: 13, cursor: 'pointer' }}
                    >
                      {STATUTS_JALON.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div style={{ marginTop: 4 }}>
                      <span className="badge" style={{
                        color: `var(--status-${TONS_JALON[j.statut] || 'neutre'})`,
                        background: `var(--status-${TONS_JALON[j.statut] || 'neutre'}-bg)`,
                      }}>
                        {j.statut}
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
