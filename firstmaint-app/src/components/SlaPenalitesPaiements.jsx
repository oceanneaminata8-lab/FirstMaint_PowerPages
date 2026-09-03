import { useState } from 'react'
import { SEUIL_DOUBLE_VALIDATION } from '../data/appConfig.js'

const STATUTS_PENALITE = ['En attente', 'Appliquée', 'Contestée', 'Annulée']

function formatMontant(montant) {
  return `${montant.toLocaleString('fr-FR')} FCFA`
}

// Deux valideurs différents doivent chacun renseigner leur nom pour les montants
// au-dessus du seuil — le composant collecte simplement le nom du valideur courant
// avant d'appeler onChangerStatutValidation, qui applique la logique de double
// contrôle côté service (dataService.updateValidationPaiementStatut).
function ValidationActions({ validation, penalites, onChangerStatutValidation }) {
  const [nomValideur, setNomValideur] = useState('')
  const exigeDouble = validation.montant > SEUIL_DOUBLE_VALIDATION
  const penaliteLiee = validation.penaliteId && penalites.find((p) => p.id === validation.penaliteId)
  const penaliteEnAttente = penaliteLiee && penaliteLiee.statut === 'En attente'

  if (validation.statut === 'Validé' || validation.statut === 'Rejeté') {
    return <span className="badge" style={{ color: 'var(--status-succes)', background: 'var(--status-succes-bg)' }}>{validation.statut}</span>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {exigeDouble && (
        <span style={{ fontSize: 11.5, color: 'var(--color-muted)' }}>
          Double validation requise (&gt; {formatMontant(SEUIL_DOUBLE_VALIDATION)}).
          {validation.validateur1 && ` 1er contrôle : ${validation.validateur1}.`}
        </span>
      )}
      {penaliteEnAttente && (
        <span style={{ fontSize: 11.5, color: 'var(--status-attention)' }}>
          Pénalité SLA liée encore en attente — vérifier avant validation.
        </span>
      )}
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          placeholder="Nom du valideur"
          value={nomValideur}
          onChange={(e) => setNomValideur(e.target.value)}
          style={{ fontSize: 12, padding: '4px 6px', width: 140 }}
        />
        <button
          className="btn secondary"
          style={{ padding: '4px 8px', fontSize: 12 }}
          disabled={!nomValideur.trim()}
          onClick={() => { onChangerStatutValidation(validation.id, 'Validé', nomValideur.trim()); setNomValideur('') }}
        >
          {exigeDouble && !validation.validateur1 ? 'Valider (1er contrôle)' : exigeDouble ? 'Valider (2e contrôle)' : 'Valider'}
        </button>
        <button
          className="btn secondary"
          style={{ padding: '4px 8px', fontSize: 12 }}
          onClick={() => onChangerStatutValidation(validation.id, 'Rejeté', nomValideur.trim() || 'Direction Financière')}
        >
          Rejeter
        </button>
      </div>
    </div>
  )
}

export function SlaPenalitesPaiements({
  penalites, validationsPaiement, slaMeasures, contrats, fournisseurs, journalAudit,
  onChangerStatutPenalite, onChangerStatutValidation,
}) {
  return (
    <>
      <div className="page-header">
        <span className="page-eyebrow">Modules Afriland</span>
        <h1>Pénalités & Validations de paiement</h1>
        <p>Suivi des pénalités appliquées aux prestataires et de leur validation financière.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>{penalites.length} pénalité(s)</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Motif</th>
              <th>Contrat</th>
              <th>Montant</th>
              <th>Date d'application</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {penalites.length === 0 && (
              <tr><td colSpan={5} className="empty-state">Aucune pénalité enregistrée.</td></tr>
            )}
            {penalites.map((p) => {
              const contrat = contrats.find((c) => c.id === p.contratId)
              const fournisseur = fournisseurs.find((f) => f.id === contrat?.fournisseurId)
              return (
                <tr key={p.id}>
                  <td>{p.motif}</td>
                  <td>{fournisseur?.nom || '—'} — {contrat?.type || '—'}</td>
                  <td>{formatMontant(p.montant)}</td>
                  <td>{p.dateApplication}</td>
                  <td>
                    <select
                      value={p.statut}
                      onChange={(e) => onChangerStatutPenalite(p.id, e.target.value)}
                      style={{ border: 'none', background: 'transparent', fontSize: 13, cursor: 'pointer' }}
                    >
                      {STATUTS_PENALITE.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>{validationsPaiement.length} validation(s) de paiement</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Fournisseur</th>
              <th>Montant</th>
              <th>Valideurs</th>
              <th>Date de validation</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {validationsPaiement.length === 0 && (
              <tr><td colSpan={5} className="empty-state">Aucune validation en cours.</td></tr>
            )}
            {validationsPaiement.map((v) => {
              const fournisseur = fournisseurs.find((f) => f.id === v.fournisseurId)
              return (
                <tr key={v.id}>
                  <td>{fournisseur?.nom || '—'}</td>
                  <td>{formatMontant(v.montant)}</td>
                  <td style={{ fontSize: 12 }}>{[v.validateur1, v.validateur2].filter(Boolean).join(' / ') || '—'}</td>
                  <td>{v.dateValidation || '—'}</td>
                  <td>
                    <ValidationActions validation={v} penalites={penalites} onChangerStatutValidation={onChangerStatutValidation} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Journal d'audit</h2>
        </div>
        {(journalAudit || []).filter((a) => a.entite === 'penalite' || a.entite === 'validationPaiement').length === 0 ? (
          <p style={{ padding: '0 20px 16px', color: 'var(--color-muted)', fontSize: 12.5 }}>Aucune opération enregistrée.</p>
        ) : (
          <ul className="journal-list" style={{ padding: '0 20px 16px' }}>
            {[...journalAudit]
              .filter((a) => a.entite === 'penalite' || a.entite === 'validationPaiement')
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((a) => (
                <li key={a.id}>{a.date} — {a.action} — {a.details} (par {a.auteur})</li>
              ))}
          </ul>
        )}
      </div>
    </>
  )
}
