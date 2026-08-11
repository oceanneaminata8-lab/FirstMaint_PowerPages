import { useState } from 'react'

export function SlaReglesMesures({ slaRules, slaMeasures, categoriesActif, contrats, fournisseurs, ordresTravail, onCreerRegle, onCreerMesure }) {
  const [ouvertRegle, setOuvertRegle] = useState(false)
  const [formRegle, setFormRegle] = useState({
    nom: '', description: '', categorieId: categoriesActif[0]?.id || '', contratId: '',
    delaiReponseHeures: 4, delaiResolutionHeures: 24, penalitePourcentage: 1,
  })

  const [ouvertMesure, setOuvertMesure] = useState(false)
  const [formMesure, setFormMesure] = useState({
    slaRuleId: slaRules[0]?.id || '', ordreTravailId: ordresTravail[0]?.id || '',
    dateMesure: '', delaiReponseReelHeures: 0, delaiResolutionReelHeures: 0,
  })

  function soumettreRegle(e) {
    e.preventDefault()
    if (!formRegle.nom.trim()) return
    onCreerRegle({
      ...formRegle,
      delaiReponseHeures: Number(formRegle.delaiReponseHeures),
      delaiResolutionHeures: Number(formRegle.delaiResolutionHeures),
      penalitePourcentage: Number(formRegle.penalitePourcentage),
    })
    setFormRegle({ ...formRegle, nom: '', description: '' })
    setOuvertRegle(false)
  }

  function soumettreMesure(e) {
    e.preventDefault()
    if (!formMesure.dateMesure) return
    const regle = slaRules.find((r) => r.id === formMesure.slaRuleId)
    onCreerMesure({
      ...formMesure,
      delaiReponseReelHeures: Number(formMesure.delaiReponseReelHeures),
      delaiResolutionReelHeures: Number(formMesure.delaiResolutionReelHeures),
      delaiResolutionSeuilHeures: regle?.delaiResolutionHeures ?? 0,
    })
    setFormMesure({ ...formMesure, dateMesure: '', delaiReponseReelHeures: 0, delaiResolutionReelHeures: 0 })
    setOuvertMesure(false)
  }

  return (
    <>
      <div className="page-header">
        <span className="page-eyebrow">Modules Afriland</span>
        <h1>Règles & Mesures SLA</h1>
        <p>Engagements de délai par catégorie d'actif et suivi de leur respect.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>{slaRules.length} règle(s) SLA</h2>
          <button className="btn" onClick={() => setOuvertRegle(!ouvertRegle)}>
            {ouvertRegle ? 'Annuler' : '+ Nouvelle règle'}
          </button>
        </div>

        {ouvertRegle && (
          <form className="form-panel" onSubmit={soumettreRegle}>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Nom de la règle</label>
              <input value={formRegle.nom} onChange={(e) => setFormRegle({ ...formRegle, nom: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Catégorie d'actif</label>
              <select value={formRegle.categorieId} onChange={(e) => setFormRegle({ ...formRegle, categorieId: e.target.value })}>
                {categoriesActif.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Contrat rattaché</label>
              <select value={formRegle.contratId} onChange={(e) => setFormRegle({ ...formRegle, contratId: e.target.value })}>
                <option value="">— Aucun (par catégorie seulement)</option>
                {(contrats || []).map((c) => {
                  const fournisseur = (fournisseurs || []).find((f) => f.id === c.fournisseurId)
                  return <option key={c.id} value={c.id}>{fournisseur?.nom || '—'} — {c.type}</option>
                })}
              </select>
            </div>
            <div className="form-field">
              <label>Pénalité (% du contrat / dépassement)</label>
              <input type="number" step="0.1" value={formRegle.penalitePourcentage} onChange={(e) => setFormRegle({ ...formRegle, penalitePourcentage: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Délai de réponse (heures)</label>
              <input type="number" value={formRegle.delaiReponseHeures} onChange={(e) => setFormRegle({ ...formRegle, delaiReponseHeures: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Délai de résolution (heures)</label>
              <input type="number" value={formRegle.delaiResolutionHeures} onChange={(e) => setFormRegle({ ...formRegle, delaiResolutionHeures: e.target.value })} />
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Description</label>
              <textarea rows={2} value={formRegle.description} onChange={(e) => setFormRegle({ ...formRegle, description: e.target.value })} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn secondary" onClick={() => setOuvertRegle(false)}>Annuler</button>
              <button type="submit" className="btn">Créer la règle</button>
            </div>
          </form>
        )}

        <table>
          <thead>
            <tr>
              <th>Règle</th>
              <th>Catégorie</th>
              <th>Contrat</th>
              <th>Délai réponse</th>
              <th>Délai résolution</th>
              <th>Pénalité</th>
            </tr>
          </thead>
          <tbody>
            {slaRules.length === 0 && (
              <tr><td colSpan={6} className="empty-state">Aucune règle SLA définie.</td></tr>
            )}
            {slaRules.map((r) => {
              const categorie = categoriesActif.find((c) => c.id === r.categorieId)
              const contrat = (contrats || []).find((c) => c.id === r.contratId)
              const fournisseur = (fournisseurs || []).find((f) => f.id === contrat?.fournisseurId)
              return (
                <tr key={r.id}>
                  <td>
                    <strong>{r.nom}</strong>
                    <br />
                    <span style={{ color: 'var(--color-muted)', fontSize: 12 }}>{r.description}</span>
                  </td>
                  <td>{categorie?.nom || '—'}</td>
                  <td>{fournisseur ? `${fournisseur.nom} — ${contrat.type}` : '—'}</td>
                  <td>{r.delaiReponseHeures} h</td>
                  <td>{r.delaiResolutionHeures} h</td>
                  <td>{r.penalitePourcentage}% / dépassement</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>{slaMeasures.length} mesure(s) SLA</h2>
          <button className="btn" onClick={() => setOuvertMesure(!ouvertMesure)}>
            {ouvertMesure ? 'Annuler' : '+ Nouvelle mesure'}
          </button>
        </div>

        {ouvertMesure && (
          <form className="form-panel" onSubmit={soumettreMesure}>
            <div className="form-field">
              <label>Règle SLA</label>
              <select value={formMesure.slaRuleId} onChange={(e) => setFormMesure({ ...formMesure, slaRuleId: e.target.value })}>
                {slaRules.map((r) => <option key={r.id} value={r.id}>{r.nom}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Ordre de travail</label>
              <select value={formMesure.ordreTravailId} onChange={(e) => setFormMesure({ ...formMesure, ordreTravailId: e.target.value })}>
                {ordresTravail.map((o) => <option key={o.id} value={o.id}>{o.titre}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Date de mesure</label>
              <input type="date" value={formMesure.dateMesure} onChange={(e) => setFormMesure({ ...formMesure, dateMesure: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Délai de réponse réel (heures)</label>
              <input type="number" value={formMesure.delaiReponseReelHeures} onChange={(e) => setFormMesure({ ...formMesure, delaiReponseReelHeures: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Délai de résolution réel (heures)</label>
              <input type="number" value={formMesure.delaiResolutionReelHeures} onChange={(e) => setFormMesure({ ...formMesure, delaiResolutionReelHeures: e.target.value })} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn secondary" onClick={() => setOuvertMesure(false)}>Annuler</button>
              <button type="submit" className="btn">Enregistrer la mesure</button>
            </div>
          </form>
        )}

        <table>
          <thead>
            <tr>
              <th>Règle SLA</th>
              <th>Ordre de travail</th>
              <th>Date</th>
              <th>Réponse réelle</th>
              <th>Résolution réelle</th>
              <th>Conformité</th>
            </tr>
          </thead>
          <tbody>
            {slaMeasures.length === 0 && (
              <tr><td colSpan={6} className="empty-state">Aucune mesure enregistrée.</td></tr>
            )}
            {slaMeasures.map((m) => {
              const regle = slaRules.find((r) => r.id === m.slaRuleId)
              const ordre = ordresTravail.find((o) => o.id === m.ordreTravailId)
              return (
                <tr key={m.id}>
                  <td>{regle?.nom || '—'}</td>
                  <td>{ordre?.titre || '—'}</td>
                  <td>{m.dateMesure}</td>
                  <td>{m.delaiReponseReelHeures} h</td>
                  <td>{m.delaiResolutionReelHeures} h</td>
                  <td>
                    <span className="badge" style={{
                      color: m.conforme ? 'var(--status-succes)' : 'var(--status-urgent)',
                      background: m.conforme ? 'var(--status-succes-bg)' : 'var(--status-urgent-bg)',
                    }}>
                      {m.conforme ? 'Conforme' : 'Non conforme'}
                    </span>
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
