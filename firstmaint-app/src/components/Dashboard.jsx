import { StatusBadge, PriorityBadge } from './StatusBadge.jsx'
import { EmplacementChain } from './EmplacementChain.jsx'
import { exportToCsv } from '../utils/csvExport.js'

export function Dashboard({ actifs, ordresTravail, tickets = [], emplacements, role }) {
  const otRecents = [...ordresTravail]
    .sort((a, b) => new Date(b.dateOuverture) - new Date(a.dateOuverture))
    .slice(0, 6)

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
        <p>Suivi consolidé des actifs, interventions et demandes internes Afriland First Bank.</p>
        <div className="no-print page-actions">
          <button className="btn secondary" onClick={exporter}>Exporter CSV</button>
          <button className="btn secondary" onClick={() => window.print()}>Imprimer / PDF</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Ordres de travail récents</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Titre</th>
              <th>Actif / Localisation</th>
              <th>Priorité</th>
              <th>Technicien</th>
              <th>Statut</th>
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
                        <strong>{actif.nom}</strong>
                        <br />
                        <EmplacementChain emplacementId={actif.emplacementId} emplacements={emplacements} />
                      </>
                    ) : '-'}
                  </td>
                  <td><PriorityBadge priorite={o.priorite} /></td>
                  <td>{o.technicien || '-'}</td>
                  <td><StatusBadge statut={o.statut} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
