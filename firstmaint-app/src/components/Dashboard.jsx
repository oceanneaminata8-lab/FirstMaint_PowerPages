import { StatusBadge, PriorityBadge } from './StatusBadge.jsx'
import { EmplacementChain } from './EmplacementChain.jsx'
import { Icon } from './Icons.jsx'
import { exportToCsv } from '../utils/csvExport.js'

export function Dashboard({ actifs, ordresTravail, tickets, emplacements, role }) {
  const actifsEnPanne = actifs.filter((a) => a.statut === 'En panne').length
  const otEnCours = ordresTravail.filter((o) => o.statut === 'En cours' || o.statut === 'Assigné').length
  const ticketsOuverts = tickets.filter((t) => t.statut === 'Ouvert' || t.statut === 'En traitement').length
  const otCritiques = ordresTravail.filter((o) => o.priorite === 'Critique' && o.statut !== 'Terminé').length

  // Taux de disponibilité des actifs critiques et ratio préventif/correctif (US-06).
  const actifsCritiques = actifs.filter((a) => a.criticite === 'Critique')
  const tauxDisponibiliteCritiques = actifsCritiques.length
    ? Math.round((actifsCritiques.filter((a) => a.statut === 'En service').length / actifsCritiques.length) * 100)
    : 100
  const otPreventifs = ordresTravail.filter((o) => o.origine === 'Préventif').length
  const otCorrectifs = ordresTravail.filter((o) => o.origine !== 'Préventif').length
  const ratioPreventifCorrectif = otCorrectifs > 0 ? (otPreventifs / otCorrectifs).toFixed(2) : otPreventifs > 0 ? '∞' : '0'

  const otRecents = [...ordresTravail]
    .sort((a, b) => new Date(b.dateOuverture) - new Date(a.dateOuverture))
    .slice(0, 5)

  const kpis = [
    { label: 'Actifs en panne', valeur: actifsEnPanne, icone: 'actifs', alerte: actifsEnPanne > 0 },
    { label: 'Ordres en cours', valeur: otEnCours, icone: 'ordres' },
    { label: 'Tickets ouverts', valeur: ticketsOuverts, icone: 'tickets' },
    { label: 'Interventions critiques', valeur: otCritiques, icone: 'alerte', alerte: otCritiques > 0 },
    { label: 'Disponibilité (actifs critiques)', valeur: `${tauxDisponibiliteCritiques}%`, icone: 'actifs', alerte: tauxDisponibiliteCritiques < 90 },
    { label: 'Ratio préventif / correctif', valeur: ratioPreventifCorrectif, icone: 'preventive' },
  ]

  function exporter() {
    exportToCsv('tableau-de-bord', ordresTravail.map((o) => ({
      titre: o.titre,
      actif: actifs.find((a) => a.id === o.actifId)?.nom || '',
      priorite: o.priorite,
      origine: o.origine,
      statut: o.statut,
      technicien: o.technicien,
      dateOuverture: o.dateOuverture,
      dateEcheance: o.dateEcheance,
    })))
  }

  return (
    <>
      <div className="page-header">
        <span className="page-eyebrow">Tableau de bord{role ? ` — ${role}` : ''}</span>
        <h1>Vue d'ensemble</h1>
        <p>Suivi de la maintenance des sites Afriland First Bank.</p>
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

      <div className="card">
        <div className="card-header">
          <h2>Ordres de travail récents</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Titre</th>
              <th>Actif</th>
              <th>Priorité</th>
              <th>Statut</th>
              <th>Technicien</th>
            </tr>
          </thead>
          <tbody>
            {otRecents.map((o) => {
              const actif = actifs.find((a) => a.id === o.actifId)
              return (
                <tr key={o.id}>
                  <td>{o.titre}</td>
                  <td>
                    {actif ? (
                      <>
                        {actif.nom}
                        <br />
                        <EmplacementChain emplacementId={actif.emplacementId} emplacements={emplacements} />
                      </>
                    ) : '—'}
                  </td>
                  <td><PriorityBadge priorite={o.priorite} /></td>
                  <td><StatusBadge statut={o.statut} /></td>
                  <td>{o.technicien}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
