import { Icon } from './Icons.jsx'
import { exportToCsv } from '../utils/csvExport.js'

const NIVEAUX_ALERTE = { 'Info': 'info', 'Avertissement': 'attention', 'Critique': 'urgent' }

function formatMontant(montant) {
  return `${montant.toLocaleString('fr-FR')} FCFA`
}

export function AfrilandDashboard({
  slaMeasures, penalites, validationsPaiement, evaluationsPrestataires,
  projetsImmobiliers, jalonsProjets, tachesWorkflow, alertesAutomatiques, role,
  rapportsMensuels = [], fichesAnalysePostIncident = [],
}) {
  const penalitesEnAttente = penalites.filter((p) => p.statut === 'En attente')
  const montantPenalitesEnAttente = penalitesEnAttente.reduce((s, p) => s + p.montant, 0)
  const alertesNonLues = alertesAutomatiques.filter((a) => !a.lu)
  const tachesAFaire = tachesWorkflow.filter((t) => t.statut !== 'Terminé')
  const projetsEnCours = projetsImmobiliers.filter((p) => p.statut === 'En cours')

  const tauxConformite = slaMeasures.length
    ? Math.round((slaMeasures.filter((m) => m.conforme).length / slaMeasures.length) * 100)
    : 0

  const noteMoyenne = evaluationsPrestataires.length
    ? (evaluationsPrestataires.reduce((s, e) => s + (e.noteQualite + e.noteDelai + e.noteCout) / 3, 0) / evaluationsPrestataires.length).toFixed(1)
    : '—'

  // Taux de respect des jalons projets échus (US-06, KPI requis par le cahier des charges).
  const jalonsEchus = (jalonsProjets || []).filter((j) => new Date(j.dateEcheance) <= new Date())
  const tauxRespectJalons = jalonsEchus.length
    ? Math.round((jalonsEchus.filter((j) => j.statut === 'Atteint').length / jalonsEchus.length) * 100)
    : 100

  const kpis = [
    { label: 'Conformité SLA', valeur: `${tauxConformite}%`, icone: 'preventive', alerte: tauxConformite < 80 },
    { label: 'Pénalités en attente', valeur: penalitesEnAttente.length, icone: 'alerte', alerte: penalitesEnAttente.length > 0 },
    { label: 'Alertes non lues', valeur: alertesNonLues.length, icone: 'alerte', alerte: alertesNonLues.length > 0 },
    { label: 'Note moyenne prestataires', valeur: `${noteMoyenne}/5`, icone: 'fournisseurs' },
    { label: 'Respect des jalons projets', valeur: `${tauxRespectJalons}%`, icone: 'ordres', alerte: tauxRespectJalons < 80 },
  ]

  const alertesRecentes = [...alertesAutomatiques]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  function exporter() {
    exportToCsv('tableau-de-bord-afriland', alertesAutomatiques.map((a) => ({
      titre: a.titre,
      niveau: a.niveau,
      source: a.source,
      date: a.date,
      lu: a.lu ? 'Oui' : 'Non',
      description: a.description,
    })))
  }

  return (
    <>
      <div className="page-header">
        <span className="page-eyebrow">Modules Afriland{role ? ` — ${role}` : ''}</span>
        <h1>Tableau de bord Afriland</h1>
        <p>Vue consolidée des SLA, pénalités, projets et alertes propres au Groupe.</p>
        <div className="no-print" style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button className="btn secondary" onClick={exporter}>Exporter en CSV</button>
          <button className="btn secondary" onClick={() => window.print()}>Imprimer / PDF</button>
        </div>
      </div>

      <div className="kpi-grid">
        {kpis.map((k) => (
          <div key={k.label} className={`kpi-card ${k.alerte ? 'kpi-card-alerte' : ''}`}>
            <span className="kpi-icon"><Icon type={k.icone} /></span>
            <div className="kpi-body">
              <div className="value">{k.valeur}</div>
              <div className="label">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="kpi-card">
          <span className="kpi-icon"><Icon type="fournisseurs" /></span>
          <div className="kpi-body">
            <div className="value">{formatMontant(montantPenalitesEnAttente)}</div>
            <div className="label">Montant pénalités en attente</div>
          </div>
        </div>
        <div className="kpi-card">
          <span className="kpi-icon"><Icon type="ordres" /></span>
          <div className="kpi-body">
            <div className="value">{tachesAFaire.length}</div>
            <div className="label">Tâches workflow à traiter</div>
          </div>
        </div>
        <div className="kpi-card">
          <span className="kpi-icon"><Icon type="emplacements" /></span>
          <div className="kpi-body">
            <div className="value">{projetsEnCours.length}</div>
            <div className="label">Projets immobiliers en cours</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Alertes récentes</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Alerte</th>
              <th>Source</th>
              <th>Date</th>
              <th>Niveau</th>
            </tr>
          </thead>
          <tbody>
            {alertesRecentes.length === 0 && (
              <tr><td colSpan={4} className="empty-state">Aucune alerte récente.</td></tr>
            )}
            {alertesRecentes.map((a) => (
              <tr key={a.id} style={{ opacity: a.lu ? 0.6 : 1 }}>
                <td>{a.titre}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Rapports mensuels préventifs (US-03)</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Mois</th>
              <th>Réalisés</th>
              <th>Prévus (jusqu'à ce jour)</th>
              <th>En retard</th>
              <th>Envoyé le</th>
            </tr>
          </thead>
          <tbody>
            {rapportsMensuels.length === 0 && (
              <tr><td colSpan={5} className="empty-state">Aucun rapport mensuel généré pour l'instant.</td></tr>
            )}
            {[...rapportsMensuels].sort((a, b) => b.mois.localeCompare(a.mois)).map((r) => (
              <tr key={r.id}>
                <td>{r.mois}</td>
                <td>{r.realises}</td>
                <td>{r.prevus}</td>
                <td style={{ color: r.enRetard > 0 ? 'var(--status-urgent)' : 'inherit' }}>{r.enRetard}</td>
                <td>{r.dateEnvoi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Fiches d'analyse post-incident (criticité Critique — US-02)</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>OT</th>
              <th>Cause identifiée</th>
            </tr>
          </thead>
          <tbody>
            {fichesAnalysePostIncident.length === 0 && (
              <tr><td colSpan={3} className="empty-state">Aucune fiche générée pour l'instant.</td></tr>
            )}
            {fichesAnalysePostIncident.map((f) => (
              <tr key={f.id}>
                <td>{f.dateCreation}</td>
                <td>{f.ordreTravailId}</td>
                <td>{f.causeIdentifiee}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
