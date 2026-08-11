const STATUTS_TACHE = ['À faire', 'En cours', 'Terminé']
const NIVEAUX_ALERTE = { 'Info': 'info', 'Avertissement': 'attention', 'Critique': 'urgent' }

export function TachesAlertes({ tachesWorkflow, alertesAutomatiques, onChangerStatutTache, onMarquerLue, onExecuterMoteur }) {
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
        </div>
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
        </div>
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
