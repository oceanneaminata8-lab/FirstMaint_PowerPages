import { useState } from 'react'

const STATUTS_TACHE = ['À faire', 'En cours', 'Terminé']
const TYPES_TACHE = ['Validation', 'Intervention', 'Suivi', 'Contrôle', 'Autre']
const NIVEAUX = ['Info', 'Avertissement', 'Critique']
const NIVEAUX_ALERTE = { 'Info': 'info', 'Avertissement': 'attention', 'Critique': 'urgent' }

export function TachesAlertes({
  tachesWorkflow, alertesAutomatiques, onCreerTache, onCreerAlerte,
  onChangerStatutTache, onMarquerLue, onExecuterMoteur,
}) {
  const [ouvertTache, setOuvertTache] = useState(false)
  const [ouvertAlerte, setOuvertAlerte] = useState(false)
  const [formTache, setFormTache] = useState({
    titre: '', description: '', type: 'Suivi', assigneA: '', dateEcheance: '', statut: 'À faire',
  })
  const [formAlerte, setFormAlerte] = useState({
    titre: '', description: '', source: 'Saisie manuelle', niveau: 'Info', assigneA: '', lu: false,
  })

  function soumettreTache(e) {
    e.preventDefault()
    if (!formTache.titre.trim()) return
    onCreerTache(formTache)
    setFormTache({ titre: '', description: '', type: 'Suivi', assigneA: '', dateEcheance: '', statut: 'À faire' })
    setOuvertTache(false)
  }

  function soumettreAlerte(e) {
    e.preventDefault()
    if (!formAlerte.titre.trim()) return
    onCreerAlerte({ ...formAlerte, date: new Date().toISOString().slice(0, 10) })
    setFormAlerte({ titre: '', description: '', source: 'Saisie manuelle', niveau: 'Info', assigneA: '', lu: false })
    setOuvertAlerte(false)
  }

  return (
    <>
      <div className="page-header">
        <span className="page-eyebrow">Modules Afriland</span>
        <h1>Tâches & Alertes</h1>
        <p>Tâches de workflow à traiter et alertes générées automatiquement par le système.</p>
        <p style={{ color: 'var(--color-muted)', fontSize: 12.5, marginTop: 4 }}>
          Le moteur de règles s'exécute automatiquement à l'ouverture de l'application
          (OT préventifs à échéance, escalades de délai, dépassements budgétaires). Le
          bouton ci-dessous permet de le relancer manuellement pour la démonstration.
        </p>
        <button className="btn secondary" style={{ marginTop: 10 }} onClick={onExecuterMoteur}>
          Exécuter le moteur d'alertes
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>{tachesWorkflow.length} tâche(s) workflow</h2>
          <button className="btn" onClick={() => setOuvertTache(!ouvertTache)}>
            {ouvertTache ? 'Annuler' : '+ Nouvelle tâche'}
          </button>
        </div>
        {ouvertTache && (
          <form className="form-panel" onSubmit={soumettreTache}>
            <div className="form-field">
              <label>Titre</label>
              <input value={formTache.titre} onChange={(e) => setFormTache({ ...formTache, titre: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Type</label>
              <select value={formTache.type} onChange={(e) => setFormTache({ ...formTache, type: e.target.value })}>
                {TYPES_TACHE.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Assigné à</label>
              <input value={formTache.assigneA} onChange={(e) => setFormTache({ ...formTache, assigneA: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Échéance</label>
              <input type="date" value={formTache.dateEcheance} onChange={(e) => setFormTache({ ...formTache, dateEcheance: e.target.value })} />
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Description</label>
              <textarea rows={2} value={formTache.description} onChange={(e) => setFormTache({ ...formTache, description: e.target.value })} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn secondary" onClick={() => setOuvertTache(false)}>Annuler</button>
              <button type="submit" className="btn">Créer la tâche</button>
            </div>
          </form>
        )}
        <table>
          <thead>
            <tr>
              <th>Tâche</th>
              <th>Type</th>
              <th>Assigné à</th>
              <th>Échéance</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {tachesWorkflow.length === 0 && (
              <tr><td colSpan={5} className="empty-state">Aucune tâche en attente.</td></tr>
            )}
            {tachesWorkflow.map((t) => (
              <tr key={t.id}>
                <td>{t.titre}</td>
                <td>{t.type}</td>
                <td>{t.assigneA}</td>
                <td>{t.dateEcheance}</td>
                <td>
                  <select
                    value={t.statut}
                    onChange={(e) => onChangerStatutTache(t.id, e.target.value)}
                    style={{ border: 'none', background: 'transparent', fontSize: 13, cursor: 'pointer' }}
                  >
                    {STATUTS_TACHE.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>{alertesAutomatiques.length} alerte(s)</h2>
          <button className="btn" onClick={() => setOuvertAlerte(!ouvertAlerte)}>
            {ouvertAlerte ? 'Annuler' : '+ Nouvelle alerte'}
          </button>
        </div>
        {ouvertAlerte && (
          <form className="form-panel" onSubmit={soumettreAlerte}>
            <div className="form-field">
              <label>Titre</label>
              <input value={formAlerte.titre} onChange={(e) => setFormAlerte({ ...formAlerte, titre: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Niveau</label>
              <select value={formAlerte.niveau} onChange={(e) => setFormAlerte({ ...formAlerte, niveau: e.target.value })}>
                {NIVEAUX.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Source</label>
              <input value={formAlerte.source} onChange={(e) => setFormAlerte({ ...formAlerte, source: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Assigné à</label>
              <input value={formAlerte.assigneA} onChange={(e) => setFormAlerte({ ...formAlerte, assigneA: e.target.value })} />
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Description</label>
              <textarea rows={2} value={formAlerte.description} onChange={(e) => setFormAlerte({ ...formAlerte, description: e.target.value })} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn secondary" onClick={() => setOuvertAlerte(false)}>Annuler</button>
              <button type="submit" className="btn">Créer l'alerte</button>
            </div>
          </form>
        )}
        <table>
          <thead>
            <tr>
              <th>Alerte</th>
              <th>Source</th>
              <th>Date</th>
              <th>Niveau</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {alertesAutomatiques.length === 0 && (
              <tr><td colSpan={5} className="empty-state">Aucune alerte.</td></tr>
            )}
            {alertesAutomatiques.map((a) => (
              <tr key={a.id} style={{ opacity: a.lu ? 0.6 : 1 }}>
                <td>
                  <strong>{a.titre}</strong>
                  <br />
                  <span style={{ color: 'var(--color-muted)', fontSize: 12 }}>{a.description}</span>
                </td>
                <td>{a.source}</td>
                <td>{a.date}</td>
                <td>
                  <span className="badge" style={{
                    color: `var(--status-${NIVEAUX_ALERTE[a.niveau] || 'neutre'})`,
                    background: `var(--status-${NIVEAUX_ALERTE[a.niveau] || 'neutre'}-bg)`,
                  }}>
                    {a.niveau}
                  </span>
                </td>
                <td>
                  {!a.lu && (
                    <button className="btn secondary" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => onMarquerLue(a.id)}>
                      Marquer lue
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
