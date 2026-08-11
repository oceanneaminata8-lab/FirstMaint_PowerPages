import { useState } from 'react'
import { StatusBadge, PriorityBadge } from './StatusBadge.jsx'
import { EmplacementChain } from './EmplacementChain.jsx'
import { PieceJointeUploader } from './PieceJointeUploader.jsx'
import { QrCode } from './QrCode.jsx'

const TYPES_DOCUMENTS = ['Facture d\'achat', 'PV de réception', 'Manuel', 'Garantie', 'Plan technique', 'Autre']

function peutValider(role) {
  return role === 'Gestionnaire DMG' || role === 'Direction'
}

export function ActifDetail({
  actif, role, emplacements, categoriesActif, ordresTravail, tickets,
  plansPreventifs, contrats, fournisseurs, journalAudit, demandesModificationActif = [],
  onRetour, onSoumettrePourValidation, onValider, onRejeter,
  onDemanderRetrait, onConfirmerRetrait, onAjouterPieceJointe,
  onDemanderModification, onValiderDemandeModification,
}) {
  const categorie = categoriesActif.find((c) => c.id === actif.categorieId)
  const [motifRejet, setMotifRejet] = useState('')
  const [afficherRejet, setAfficherRejet] = useState(false)
  const [motifRetrait, setMotifRetrait] = useState('')
  const [afficherRetrait, setAfficherRetrait] = useState(false)
  const [modifCritique, setModifCritique] = useState({ criticite: actif.criticite })

  const ordresLies = ordresTravail
    .filter((o) => o.actifId === actif.id)
    .sort((a, b) => new Date(b.dateOuverture) - new Date(a.dateOuverture))

  const idsOrdresLies = new Set(ordresLies.map((o) => o.id))
  const ticketsLies = tickets.filter((t) => t.ordreTravailId && idsOrdresLies.has(t.ordreTravailId))

  const plansLies = plansPreventifs.filter(
    (p) => p.actifId === actif.id || p.categorieId === actif.categorieId
  )

  const contratsLies = contrats.filter((c) => c.actifsCouverts.includes(actif.id))

  const historiqueActif = (journalAudit || [])
    .filter((a) => a.entite === 'actif' && a.entiteId === actif.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  function confirmerRejet() {
    onRejeter(actif.id, motifRejet || 'Non motivé')
    setAfficherRejet(false)
  }

  function confirmerDemandeRetrait() {
    onDemanderRetrait(actif.id, motifRetrait || 'Non motivé')
    setAfficherRetrait(false)
  }

  function demanderModifCritique() {
    onDemanderModification(actif.id, { criticite: modifCritique.criticite }, 'critique')
  }

  return (
    <>
      <div className="page-header">
        <button className="btn secondary" onClick={onRetour} style={{ marginBottom: 14 }}>
          ← Retour aux actifs
        </button>
        <h1>{actif.nom}</h1>
        <p>{actif.codeInventaire} — {categorie?.nom || 'Sans catégorie'}</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Informations générales</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <StatusBadge statut={actif.etatCycleVie} />
            <StatusBadge statut={actif.statut} />
          </div>
        </div>
        <div className="form-panel" style={{ borderTop: 'none' }}>
          <div className="form-field">
            <label>Emplacement</label>
            <EmplacementChain emplacementId={actif.emplacementId} emplacements={emplacements} />
          </div>
          <div className="form-field">
            <label>N° de série</label>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{actif.numeroSerie}</span>
          </div>
          <div className="form-field">
            <label>Criticité</label>
            <span>{actif.criticite || '—'}</span>
          </div>
          <div className="form-field">
            <label>Date d'acquisition</label>
            <span>{actif.dateAcquisition || '—'}</span>
          </div>
          <div className="form-field">
            <label>Fin de garantie</label>
            <span>{actif.dateFinGarantie || '—'}</span>
          </div>
          <div className="form-field">
            <label>Valeur</label>
            <span>{actif.valeur ? `${actif.valeur.toLocaleString('fr-FR')} FCFA` : '—'}</span>
          </div>
          <div className="form-field">
            <label>QR code</label>
            <QrCode valeur={actif.codeInventaire} taille={100} />
          </div>
        </div>

        {actif.motifRejet && (
          <p style={{ padding: '0 20px 12px', color: 'var(--status-urgent)', fontSize: 12.5 }}>
            Dernier rejet : {actif.motifRejet}
          </p>
        )}

        <div style={{ padding: '0 20px 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {actif.etatCycleVie === 'Brouillon' && (
            <button className="btn" onClick={() => onSoumettrePourValidation(actif.id)}>Soumettre pour validation</button>
          )}
          {actif.etatCycleVie === 'En validation' && peutValider(role) && !afficherRejet && (
            <>
              <button className="btn" onClick={() => onValider(actif.id)}>Valider</button>
              <button className="btn secondary" onClick={() => setAfficherRejet(true)}>Rejeter</button>
            </>
          )}
          {afficherRejet && (
            <div style={{ display: 'flex', gap: 8 }}>
              <input placeholder="Motif du rejet" value={motifRejet} onChange={(e) => setMotifRejet(e.target.value)} />
              <button className="btn secondary" onClick={confirmerRejet}>Confirmer le rejet</button>
            </div>
          )}
          {actif.etatCycleVie === 'Actif' && !afficherRetrait && (
            <button className="btn secondary" onClick={() => setAfficherRetrait(true)}>Demander le retrait</button>
          )}
          {afficherRetrait && (
            <div style={{ display: 'flex', gap: 8 }}>
              <input placeholder="Motif du retrait" value={motifRetrait} onChange={(e) => setMotifRetrait(e.target.value)} />
              <button className="btn secondary" onClick={confirmerDemandeRetrait}>Confirmer la demande</button>
            </div>
          )}
          {actif.etatCycleVie === 'En retrait' && (
            <button className="btn secondary" onClick={() => onConfirmerRetrait(actif.id)}>Confirmer le retrait définitif</button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Pièces jointes</h2>
        </div>
        <div style={{ padding: '0 20px 16px' }}>
          <PieceJointeUploader
            piecesJointes={actif.piecesJointes || []}
            typesDocuments={TYPES_DOCUMENTS}
            onAjouter={(nomFichier, typeDocument) => onAjouterPieceJointe(actif.id, nomFichier, typeDocument)}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Modification critique de la criticité</h2>
        </div>
        <div style={{ padding: '0 20px 16px' }}>
          <p style={{ fontSize: 12.5, color: 'var(--color-muted)' }}>
            Nécessite deux valideurs distincts avant application (US-01, section 1.4).
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={modifCritique.criticite} onChange={(e) => setModifCritique({ criticite: e.target.value })}>
              {['Critique', 'Haute', 'Moyenne', 'Basse'].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="btn secondary" onClick={demanderModifCritique}>Demander le changement</button>
          </div>
          {demandesModificationActif.length > 0 && (
            <ul className="journal-list" style={{ marginTop: 10 }}>
              {demandesModificationActif.map((d) => (
                <li key={d.id}>
                  {JSON.stringify(d.champs)} — {d.statut}
                  {d.statut === 'En attente' && (
                    <button className="btn secondary" style={{ marginLeft: 8, padding: '3px 8px', fontSize: 11 }} onClick={() => onValiderDemandeModification(d.id)}>
                      {d.valideur1 ? 'Valider (2e signature)' : 'Valider (1re signature)'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>{ordresLies.length} ordre(s) de travail lié(s)</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Titre</th>
              <th>Priorité</th>
              <th>Technicien</th>
              <th>Ouverture</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {ordresLies.length === 0 && (
              <tr><td colSpan={5} className="empty-state">Aucun ordre de travail pour cet actif.</td></tr>
            )}
            {ordresLies.map((o) => (
              <tr key={o.id}>
                <td>{o.numero ? `${o.numero} — ` : ''}{o.titre}</td>
                <td><PriorityBadge priorite={o.priorite} /></td>
                <td>{o.technicien || '—'}</td>
                <td>{o.dateOuverture}</td>
                <td><StatusBadge statut={o.statut} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>{ticketsLies.length} ticket(s) lié(s)</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Titre</th>
              <th>Demandeur</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {ticketsLies.length === 0 && (
              <tr><td colSpan={3} className="empty-state">Aucun ticket lié à cet actif.</td></tr>
            )}
            {ticketsLies.map((t) => (
              <tr key={t.id}>
                <td>{t.titre}</td>
                <td>{t.demandeur || '—'}</td>
                <td><StatusBadge statut={t.statut} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>{plansLies.length} plan(s) de maintenance préventive</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Plan</th>
              <th>Type</th>
              <th>Fréquence</th>
            </tr>
          </thead>
          <tbody>
            {plansLies.length === 0 && (
              <tr><td colSpan={3} className="empty-state">Aucun plan préventif rattaché.</td></tr>
            )}
            {plansLies.map((p) => (
              <tr key={p.id}>
                <td>{p.nom}</td>
                <td>{p.type || '—'}</td>
                <td>{p.frequence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>{contratsLies.length} contrat(s) couvrant cet actif</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Fournisseur</th>
              <th>Type</th>
              <th>Validité</th>
            </tr>
          </thead>
          <tbody>
            {contratsLies.length === 0 && (
              <tr><td colSpan={3} className="empty-state">Aucun contrat ne couvre cet actif.</td></tr>
            )}
            {contratsLies.map((c) => {
              const fournisseur = fournisseurs.find((f) => f.id === c.fournisseurId)
              return (
                <tr key={c.id}>
                  <td>{fournisseur?.nom || '—'}</td>
                  <td>{c.type}</td>
                  <td>{c.dateDebut} → {c.dateFin}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Historique</h2>
        </div>
        {historiqueActif.length === 0 ? (
          <p style={{ padding: '0 20px 16px', color: 'var(--color-muted)', fontSize: 12.5 }}>
            Aucun changement enregistré pour cet actif.
          </p>
        ) : (
          <ul className="journal-list" style={{ padding: '0 20px 16px' }}>
            {historiqueActif.map((a) => (
              <li key={a.id}>{a.date} — {a.action} ({a.auteur})</li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
