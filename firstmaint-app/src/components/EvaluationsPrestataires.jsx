import { useState } from 'react'

function noteGlobale(e) {
  return ((e.noteQualite + e.noteDelai + e.noteCout) / 3).toFixed(1)
}

function Etoiles({ note }) {
  return (
    <span style={{ color: 'var(--color-accent)', letterSpacing: 1 }}>
      {'★'.repeat(Math.round(note))}{'☆'.repeat(5 - Math.round(note))}
    </span>
  )
}

export function EvaluationsPrestataires({ evaluationsPrestataires, fournisseurs, onCreer }) {
  const [ouvert, setOuvert] = useState(false)
  const [form, setForm] = useState({
    fournisseurId: fournisseurs[0]?.id || '', periode: '', noteQualite: 3, noteDelai: 3, noteCout: 3,
    commentaire: '', evaluateur: '',
  })

  function soumettre(e) {
    e.preventDefault()
    if (!form.periode.trim()) return
    onCreer({
      ...form,
      noteQualite: Number(form.noteQualite),
      noteDelai: Number(form.noteDelai),
      noteCout: Number(form.noteCout),
    })
    setForm({ ...form, periode: '', commentaire: '', evaluateur: '' })
    setOuvert(false)
  }

  return (
    <>
      <div className="page-header">
        <span className="page-eyebrow">Modules Afriland</span>
        <h1>Évaluations prestataires</h1>
        <p>Notation périodique des fournisseurs sur la qualité, les délais et les coûts.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>{evaluationsPrestataires.length} évaluation(s)</h2>
          <button className="btn" onClick={() => setOuvert(!ouvert)}>
            {ouvert ? 'Annuler' : '+ Nouvelle évaluation'}
          </button>
        </div>

        {ouvert && (
          <form className="form-panel" onSubmit={soumettre}>
            <div className="form-field">
              <label>Fournisseur</label>
              <select value={form.fournisseurId} onChange={(e) => setForm({ ...form, fournisseurId: e.target.value })}>
                {fournisseurs.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Période (ex. 2026-T3)</label>
              <input value={form.periode} onChange={(e) => setForm({ ...form, periode: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Note qualité (0-5)</label>
              <input type="number" min="0" max="5" value={form.noteQualite} onChange={(e) => setForm({ ...form, noteQualite: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Note délai (0-5)</label>
              <input type="number" min="0" max="5" value={form.noteDelai} onChange={(e) => setForm({ ...form, noteDelai: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Note coût (0-5)</label>
              <input type="number" min="0" max="5" value={form.noteCout} onChange={(e) => setForm({ ...form, noteCout: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Évaluateur</label>
              <input value={form.evaluateur} onChange={(e) => setForm({ ...form, evaluateur: e.target.value })} />
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Commentaire</label>
              <textarea rows={2} value={form.commentaire} onChange={(e) => setForm({ ...form, commentaire: e.target.value })} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn secondary" onClick={() => setOuvert(false)}>Annuler</button>
              <button type="submit" className="btn">Enregistrer l'évaluation</button>
            </div>
          </form>
        )}

        <table>
          <thead>
            <tr>
              <th>Fournisseur</th>
              <th>Période</th>
              <th>Note globale</th>
              <th>Évaluateur</th>
              <th>Commentaire</th>
            </tr>
          </thead>
          <tbody>
            {evaluationsPrestataires.length === 0 && (
              <tr><td colSpan={5} className="empty-state">Aucune évaluation enregistrée.</td></tr>
            )}
            {evaluationsPrestataires.map((e) => {
              const fournisseur = fournisseurs.find((f) => f.id === e.fournisseurId)
              return (
                <tr key={e.id}>
                  <td><strong>{fournisseur?.nom || '—'}</strong></td>
                  <td>{e.periode}</td>
                  <td>
                    <Etoiles note={Number(noteGlobale(e))} />
                    <span style={{ marginLeft: 6, color: 'var(--color-muted)', fontSize: 12 }}>{noteGlobale(e)}/5</span>
                  </td>
                  <td>{e.evaluateur || '—'}</td>
                  <td style={{ color: 'var(--color-muted)', fontSize: 12.5 }}>{e.commentaire}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
