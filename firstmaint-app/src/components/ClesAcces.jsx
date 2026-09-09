import { useState } from 'react'
import { EmplacementChain } from './EmplacementChain.jsx'

const STATUTS_CLE = { 'Disponible': 'succes', 'En possession': 'attention', 'Perdue': 'urgent' }
const ACTIONS = ['Retrait', 'Retour', 'Perte signalée']
const TYPES_CLE = ['Clé physique', 'Badge', 'Carte accès', 'Autre']
const CLASSIFICATIONS = ['Standard', 'Élevée']

export function ClesAcces({ cles, mouvementsCles, emplacements, journalAudit, onCreerCle, onCreerMouvement }) {
  const [ouvertCle, setOuvertCle] = useState(false)
  const [ouvert, setOuvert] = useState(false)
  const [formCle, setFormCle] = useState({
    libelle: '', emplacementId: emplacements[0]?.id || '', type: 'Clé physique',
    classification: 'Standard', detenteurActuel: '', statut: 'Disponible',
  })
  const [form, setForm] = useState({
    cleId: cles[0]?.id || '', action: 'Retrait', personne: '',
    dateRestitutionPrevue: '', valideur1: '', valideur2: '', commentaire: '',
  })
  const [erreur, setErreur] = useState('')

  const cleSelectionnee = cles.find((c) => c.id === form.cleId)
  const exigeDoubleValidation = cleSelectionnee?.classification === 'Élevée' && form.action === 'Retrait'

  async function soumettreCle(e) {
    e.preventDefault()
    if (!formCle.libelle.trim()) return
    setErreur('')
    try {
      await onCreerCle(formCle)
      setFormCle({
        libelle: '', emplacementId: emplacements[0]?.id || '', type: 'Clé physique',
        classification: 'Standard', detenteurActuel: '', statut: 'Disponible',
      })
      setOuvertCle(false)
    } catch (err) {
      setErreur(err.message || 'Impossible de créer cette clé.')
    }
  }

  async function soumettre(e) {
    e.preventDefault()
    if (!form.personne.trim()) return
    setErreur('')
    try {
      await onCreerMouvement(form)
      setForm({ ...form, personne: '', dateRestitutionPrevue: '', valideur1: '', valideur2: '', commentaire: '' })
      setOuvert(false)
    } catch (err) {
      setErreur(err.message || 'Une erreur est survenue.')
    }
  }

  return (
    <>
      <div className="page-header">
        <span className="page-eyebrow">Modules Afriland</span>
        <h1>Clés & Accès</h1>
        <p>Suivi des clés physiques et badges d'accès aux sites techniques.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>{cles.length} clé(s)/badge(s)</h2>
          <button className="btn" onClick={() => setOuvertCle(!ouvertCle)}>
            {ouvertCle ? 'Annuler' : '+ Nouvelle clé'}
          </button>
        </div>
        {ouvertCle && (
          <form className="form-panel" onSubmit={soumettreCle}>
            <div className="form-field">
              <label>Libellé</label>
              <input value={formCle.libelle} onChange={(e) => setFormCle({ ...formCle, libelle: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Emplacement</label>
              <select value={formCle.emplacementId} onChange={(e) => setFormCle({ ...formCle, emplacementId: e.target.value })}>
                {emplacements.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Type</label>
              <select value={formCle.type} onChange={(e) => setFormCle({ ...formCle, type: e.target.value })}>
                {TYPES_CLE.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Classification</label>
              <select value={formCle.classification} onChange={(e) => setFormCle({ ...formCle, classification: e.target.value })}>
                {CLASSIFICATIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Détenteur actuel</label>
              <input value={formCle.detenteurActuel} onChange={(e) => setFormCle({ ...formCle, detenteurActuel: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Statut</label>
              <select value={formCle.statut} onChange={(e) => setFormCle({ ...formCle, statut: e.target.value })}>
                {Object.keys(STATUTS_CLE).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {erreur && <div className="login-erreur" style={{ gridColumn: '1 / -1' }}>{erreur}</div>}
            <div className="form-actions">
              <button type="button" className="btn secondary" onClick={() => setOuvertCle(false)}>Annuler</button>
              <button type="submit" className="btn">Créer la clé</button>
            </div>
          </form>
        )}
        <table>
          <thead>
            <tr>
              <th>Libellé</th>
              <th>Emplacement</th>
              <th>Type</th>
              <th>Classification</th>
              <th>Détenteur actuel</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {cles.length === 0 && (
              <tr><td colSpan={6} className="empty-state">Aucune clé enregistrée.</td></tr>
            )}
            {cles.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.libelle}</strong></td>
                <td><EmplacementChain emplacementId={c.emplacementId} emplacements={emplacements} /></td>
                <td>{c.type}</td>
                <td>
                  {c.classification === 'Élevée' ? (
                    <span className="badge" style={{ color: 'var(--status-urgent)', background: 'var(--status-urgent-bg)' }}>Zone sensible</span>
                  ) : (
                    <span style={{ color: 'var(--color-muted)', fontSize: 12.5 }}>Standard</span>
                  )}
                </td>
                <td>{c.detenteurActuel || '—'}</td>
                <td>
                  <span className="badge" style={{
                    color: `var(--status-${STATUTS_CLE[c.statut] || 'neutre'})`,
                    background: `var(--status-${STATUTS_CLE[c.statut] || 'neutre'}-bg)`,
                  }}>
                    {c.statut}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>{mouvementsCles.length} mouvement(s)</h2>
          <button className="btn" onClick={() => setOuvert(!ouvert)}>
            {ouvert ? 'Annuler' : '+ Nouveau mouvement'}
          </button>
        </div>

        {ouvert && (
          <form className="form-panel" onSubmit={soumettre}>
            <div className="form-field">
              <label>Clé / Badge</label>
              <select value={form.cleId} onChange={(e) => setForm({ ...form, cleId: e.target.value })}>
                {cles.map((c) => <option key={c.id} value={c.id}>{c.libelle}{c.classification === 'Élevée' ? ' — zone sensible' : ''}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Action</label>
              <select value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })}>
                {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Personne concernée</label>
              <input value={form.personne} onChange={(e) => setForm({ ...form, personne: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Date de restitution prévue</label>
              <input type="date" value={form.dateRestitutionPrevue} onChange={(e) => setForm({ ...form, dateRestitutionPrevue: e.target.value })} />
            </div>
            {exigeDoubleValidation && (
              <>
                <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                  <span style={{ color: 'var(--status-urgent)', fontSize: 12.5 }}>
                    Zone classifiée Élevée : deux valideurs distincts sont requis pour ce retrait.
                  </span>
                </div>
                <div className="form-field">
                  <label>1er valideur</label>
                  <input value={form.valideur1} onChange={(e) => setForm({ ...form, valideur1: e.target.value })} required />
                </div>
                <div className="form-field">
                  <label>2e valideur</label>
                  <input value={form.valideur2} onChange={(e) => setForm({ ...form, valideur2: e.target.value })} required />
                </div>
              </>
            )}
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Commentaire</label>
              <textarea rows={2} value={form.commentaire} onChange={(e) => setForm({ ...form, commentaire: e.target.value })} />
            </div>
            {erreur && <div className="login-erreur" style={{ gridColumn: '1 / -1' }}>{erreur}</div>}
            <div className="form-actions">
              <button type="button" className="btn secondary" onClick={() => setOuvert(false)}>Annuler</button>
              <button type="submit" className="btn">Enregistrer le mouvement</button>
            </div>
          </form>
        )}

        <table>
          <thead>
            <tr>
              <th>Clé / Badge</th>
              <th>Action</th>
              <th>Personne</th>
              <th>Date</th>
              <th>Commentaire</th>
            </tr>
          </thead>
          <tbody>
            {mouvementsCles.length === 0 && (
              <tr><td colSpan={5} className="empty-state">Aucun mouvement enregistré.</td></tr>
            )}
            {[...mouvementsCles].sort((a, b) => new Date(b.date) - new Date(a.date)).map((m) => {
              const cle = cles.find((c) => c.id === m.cleId)
              return (
                <tr key={m.id}>
                  <td>{cle?.libelle || '—'}</td>
                  <td>{m.action}</td>
                  <td>{m.personne}</td>
                  <td>{m.date}</td>
                  <td style={{ color: 'var(--color-muted)', fontSize: 12.5 }}>{m.commentaire || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Journal d'audit — clés</h2>
        </div>
        <p style={{ padding: '0 20px', color: 'var(--color-muted)', fontSize: 12 }}>
          Journal horodaté et immuable : chaque ligne est ajoutée automatiquement, jamais modifiée ni supprimée.
        </p>
        {(journalAudit || []).filter((a) => a.entite === 'cle').length === 0 ? (
          <p style={{ padding: '0 20px 16px', color: 'var(--color-muted)', fontSize: 12.5 }}>Aucune opération enregistrée.</p>
        ) : (
          <ul className="journal-list" style={{ padding: '0 20px 16px' }}>
            {[...journalAudit]
              .filter((a) => a.entite === 'cle')
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((a) => (
                <li key={a.id}>{a.date} — {a.action} ({a.auteur}) — {a.details}</li>
              ))}
          </ul>
        )}
      </div>
    </>
  )
}
