import { useState, Fragment } from 'react'
import { StatusBadge, PriorityBadge } from './StatusBadge.jsx'
import { EmplacementChain } from './EmplacementChain.jsx'
import { PieceJointeUploader } from './PieceJointeUploader.jsx'
import { Icon } from './Icons.jsx'
import { STATUTS_ORDRE_TRAVAIL } from '../domain/ordreTravailWorkflow.js'

const PRIORITES = ['Basse', 'Moyenne', 'Haute', 'Critique']

const COMPTE_RENDU_VIDE = {
  causeIdentifiee: '', actionsRealisees: '', piecesUtilisees: '', dureeHeures: '',
  coutReel: '', photoAvant: '', photoApres: '', preconisations: '',
}

export function OrdresTravailList({
  ordresTravail, actifs, fournisseurs = [], emplacements, historiqueOrdreTravail,
  onCreer, onChangerStatut, onQualifier, onAccuserReception, onPasserEnAttenteDePiece,
  onReprendreIntervention, onResoudre, onValiderCloture, onRejeter, onCloturerAvecCompteRendu,
  onCocherItemChecklist, onProposerDateIntervention, onValiderDateIntervention,
  onSignalerAnomalie, onAjouterPieceJointe,
}) {
  const [ouvert, setOuvert] = useState(false)
  const [form, setForm] = useState({
    titre: '', description: '', priorite: 'Moyenne', actifId: actifs[0]?.id || '', technicien: '',
  })
  const [ligneEtendue, setLigneEtendue] = useState(null)

  const [qualifForm, setQualifForm] = useState({ priorite: '', technicien: '', justificatif: '' })
  const [compteRendu, setCompteRendu] = useState(COMPTE_RENDU_VIDE)
  const [motifAttentePiece, setMotifAttentePiece] = useState('')
  const [motifRefusAccuse, setMotifRefusAccuse] = useState('')
  const [motifRefusCloture, setMotifRefusCloture] = useState('')
  const [dateIntervention, setDateIntervention] = useState('')
  const [descriptionAnomalie, setDescriptionAnomalie] = useState('')
  const [erreur, setErreur] = useState('')

  const [filtreStatut, setFiltreStatut] = useState('')
  const [filtrePriorite, setFiltrePriorite] = useState('')
  const [filtreTechnicien, setFiltreTechnicien] = useState('')

  const techniciens = [...new Set(ordresTravail.map((o) => o.technicien).filter(Boolean))]

  const ordresFiltres = ordresTravail.filter((o) => {
    if (filtreStatut && o.statut !== filtreStatut) return false
    if (filtrePriorite && o.priorite !== filtrePriorite) return false
    if (filtreTechnicien && o.technicien !== filtreTechnicien) return false
    return true
  })

  function soumettre(e) {
    e.preventDefault()
    if (!form.titre.trim()) return
    onCreer({ ...form, statut: 'Nouveau' })
    setForm({ titre: '', description: '', priorite: 'Moyenne', actifId: actifs[0]?.id || '', technicien: '' })
    setOuvert(false)
  }

  function ouvrirDetail(id) {
    setLigneEtendue(ligneEtendue === id ? null : id)
    setErreur('')
    setCompteRendu(COMPTE_RENDU_VIDE)
    setQualifForm({ priorite: '', technicien: '', justificatif: '' })
  }

  async function executer(action) {
    try {
      setErreur('')
      await action()
    } catch (err) {
      setErreur(err.message || 'Une erreur est survenue.')
    }
  }

  function soumettreQualification(id) {
    executer(() => onQualifier(id, {
      priorite: qualifForm.priorite || undefined,
      technicien: qualifForm.technicien || undefined,
      justificatif: qualifForm.justificatif || undefined,
    }))
  }

  function soumettreResolution(id) {
    executer(() => onResoudre(id, {
      ...compteRendu,
      dureeHeures: Number(compteRendu.dureeHeures) || undefined,
      coutReel: Number(compteRendu.coutReel) || 0,
    }))
  }

  return (
    <>
      <div className="page-header">
        <span className="page-eyebrow">Interventions</span>
        <h1>Ordres de travail</h1>
        <p>Interventions planifiées ou en cours sur les actifs — cycle de vie à 9 états (US-02).</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>{ordresFiltres.length} / {ordresTravail.length} ordre(s) de travail</h2>
          <button className="btn" onClick={() => setOuvert(!ouvert)}>
            {ouvert ? 'Annuler' : <><Icon type="plus" /> Nouvel ordre</>}
          </button>
        </div>

        <div className="filters-bar">
          <select value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)}>
            <option value="">Tous les statuts</option>
            {STATUTS_ORDRE_TRAVAIL.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filtrePriorite} onChange={(e) => setFiltrePriorite(e.target.value)}>
            <option value="">Toutes les priorités</option>
            {PRIORITES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filtreTechnicien} onChange={(e) => setFiltreTechnicien(e.target.value)}>
            <option value="">Tous les techniciens</option>
            {techniciens.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {ouvert && (
          <form className="form-panel" onSubmit={soumettre}>
            <div className="form-field">
              <label>Titre</label>
              <input value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Actif concerné</label>
              <select value={form.actifId} onChange={(e) => setForm({ ...form, actifId: e.target.value })}>
                {actifs.map((a) => <option key={a.id} value={a.id}>{a.nom} ({a.codeInventaire})</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Priorité</label>
              <select value={form.priorite} onChange={(e) => setForm({ ...form, priorite: e.target.value })}>
                {PRIORITES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Technicien assigné</label>
              <input value={form.technicien} onChange={(e) => setForm({ ...form, technicien: e.target.value })} />
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Description</label>
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn secondary" onClick={() => setOuvert(false)}>Annuler</button>
              <button type="submit" className="btn">Créer l'ordre</button>
            </div>
          </form>
        )}

        <table>
          <thead>
            <tr>
              <th>N°</th>
              <th>Titre</th>
              <th>Actif / Emplacement</th>
              <th>Priorité</th>
              <th>Technicien</th>
              <th>Échéance</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ordresFiltres.length === 0 && (
              <tr><td colSpan={8} className="empty-state">Aucun ordre de travail ne correspond aux filtres.</td></tr>
            )}
            {ordresFiltres.map((o) => {
              const actif = actifs.find((a) => a.id === o.actifId)
              const estEtendue = ligneEtendue === o.id
              const journal = (historiqueOrdreTravail || [])
                .filter((h) => h.ordreTravailId === o.id)
                .sort((a, b) => new Date(a.date) - new Date(b.date))
              const checklist = o.checklist || []
              const checklistIncomplete = checklist.some((c) => c.obligatoire && !c.coche)
              const finalise = ['Clôturé', 'Rejeté'].includes(o.statut)

              return (
                <Fragment key={o.id}>
                  <tr>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{o.numero || '—'}</td>
                    <td>{o.titre}</td>
                    <td>
                      {actif?.nom || '—'}
                      <br />
                      <EmplacementChain emplacementId={actif?.emplacementId} emplacements={emplacements} />
                    </td>
                    <td><PriorityBadge priorite={o.priorite} /></td>
                    <td>{o.technicien || '—'}</td>
                    <td>{o.dateEcheance || '—'}</td>
                    <td><StatusBadge statut={o.statut} /></td>
                    <td>
                      <button
                        className="btn secondary"
                        style={{ padding: '5px 10px', fontSize: 12 }}
                        onClick={() => ouvrirDetail(o.id)}
                      >
                        {estEtendue ? 'Fermer' : 'Détails'}
                      </button>
                    </td>
                  </tr>
                  {estEtendue && (
                    <tr key={`${o.id}-details`}>
                      <td colSpan={8} className="row-detail">
                        <div className="row-detail-grid">
                          <div>
                            <h3>Journal des statuts</h3>
                            {journal.length === 0 ? (
                              <span style={{ color: 'var(--color-muted)', fontSize: 12.5 }}>Aucun historique.</span>
                            ) : (
                              <ul className="journal-list">
                                {journal.map((h) => (
                                  <li key={h.id}>
                                    <StatusBadge statut={h.statut} /> — {h.date} par {h.auteur}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div>
                            <h3>Pièces jointes</h3>
                            <PieceJointeUploader
                              piecesJointes={o.piecesJointes || []}
                              onAjouter={(nomFichier) => onAjouterPieceJointe(o.id, nomFichier)}
                            />
                          </div>

                          {checklist.length > 0 && (
                            <div style={{ gridColumn: '1 / -1' }}>
                              <h3>Checklist{o.origine === 'Préventif' ? ' (plan préventif)' : ''}</h3>
                              <ul className="journal-list">
                                {checklist.map((item) => (
                                  <li key={item.id}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <input
                                        type="checkbox"
                                        checked={!!item.coche}
                                        disabled={finalise}
                                        onChange={(e) => onCocherItemChecklist(o.id, item.id, e.target.checked)}
                                      />
                                      {item.libelle} {item.obligatoire && <span style={{ color: 'var(--status-urgent)' }}>*</span>}
                                    </label>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {erreur && (
                            <p style={{ gridColumn: '1 / -1', color: 'var(--status-urgent)', fontSize: 12.5 }}>{erreur}</p>
                          )}

                          {o.statut === 'Nouveau' && (
                            <div style={{ gridColumn: '1 / -1' }}>
                              <h3>Qualification (US-02, étape 2)</h3>
                              <div className="form-panel" style={{ padding: 0, border: 'none' }}>
                                <div className="form-field">
                                  <label>Priorité (ajustable avec justification)</label>
                                  <select value={qualifForm.priorite} onChange={(e) => setQualifForm({ ...qualifForm, priorite: e.target.value })}>
                                    <option value="">Conserver "{o.priorite}"</option>
                                    {PRIORITES.map((p) => <option key={p} value={p}>{p}</option>)}
                                  </select>
                                </div>
                                <div className="form-field">
                                  <label>Prestataire / technicien {o.technicien && '(proposé automatiquement, modifiable)'}</label>
                                  <input value={qualifForm.technicien} onChange={(e) => setQualifForm({ ...qualifForm, technicien: e.target.value })} placeholder={o.technicien || '—'} />
                                </div>
                                <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                                  <label>Justificatif (si priorité ajustée)</label>
                                  <input value={qualifForm.justificatif} onChange={(e) => setQualifForm({ ...qualifForm, justificatif: e.target.value })} />
                                </div>
                                <div className="form-actions">
                                  <button type="button" className="btn secondary" onClick={() => executer(() => onRejeter(o.id, 'Hors périmètre DMG ou doublon'))}>Rejeter</button>
                                  <button type="button" className="btn" onClick={() => soumettreQualification(o.id)}>Qualifier et affecter</button>
                                </div>
                              </div>
                            </div>
                          )}

                          {o.statut === 'Affecté' && o.origine === 'Corrective' && (
                            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
                              <button className="btn" onClick={() => executer(() => onAccuserReception(o.id, true))}>Accuser réception</button>
                              <input placeholder="Motif de refus" value={motifRefusAccuse} onChange={(e) => setMotifRefusAccuse(e.target.value)} style={{ fontSize: 12.5 }} />
                              <button className="btn secondary" onClick={() => executer(() => onAccuserReception(o.id, false, motifRefusAccuse))}>Refuser</button>
                            </div>
                          )}

                          {o.statut === 'Affecté' && o.origine === 'Préventif' && (
                            <div style={{ gridColumn: '1 / -1' }}>
                              <h3>Planification (fenêtre ±30 % — US-03, étape 2)</h3>
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <input type="date" value={dateIntervention} onChange={(e) => setDateIntervention(e.target.value)} />
                                <button className="btn secondary" onClick={() => executer(() => onProposerDateIntervention(o.id, dateIntervention))}>Proposer (prestataire)</button>
                                <button className="btn" onClick={() => executer(() => onValiderDateIntervention(o.id, dateIntervention))}>Valider (responsable de site)</button>
                                <button className="btn secondary" onClick={() => executer(() => onAccuserReception(o.id, true))}>Démarrer l'intervention</button>
                              </div>
                              {(o.dateInterventionProposee || o.dateInterventionValidee) && (
                                <p style={{ fontSize: 12.5, color: 'var(--color-muted)' }}>
                                  Proposée : {o.dateInterventionProposee || '—'} — Validée : {o.dateInterventionValidee || '—'}
                                </p>
                              )}
                            </div>
                          )}

                          {['En cours', 'En escalade'].includes(o.statut) && (
                            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              <input placeholder="Délai estimé pièce" value={motifAttentePiece} onChange={(e) => setMotifAttentePiece(e.target.value)} style={{ fontSize: 12.5, width: 160 }} />
                              <button className="btn secondary" onClick={() => executer(() => onPasserEnAttenteDePiece(o.id, motifAttentePiece))}>Mettre en attente de pièce</button>
                              {o.origine === 'Préventif' && (
                                <>
                                  <input placeholder="Description de l'anomalie" value={descriptionAnomalie} onChange={(e) => setDescriptionAnomalie(e.target.value)} style={{ fontSize: 12.5, width: 200 }} />
                                  <button className="btn secondary" onClick={() => executer(() => onSignalerAnomalie(o.id, descriptionAnomalie))}>Signaler une anomalie → OT correctif</button>
                                </>
                              )}
                            </div>
                          )}

                          {o.statut === 'En attente de pièce' && (
                            <div style={{ gridColumn: '1 / -1' }}>
                              <button className="btn" onClick={() => executer(() => onReprendreIntervention(o.id))}>Reprendre l'intervention</button>
                            </div>
                          )}

                          {['En cours', 'En attente de pièce', 'En escalade'].includes(o.statut) && (
                            <div style={{ gridColumn: '1 / -1' }}>
                              <h3>Compte-rendu de résolution (US-02, étape 5)</h3>
                              {checklistIncomplete && (
                                <p style={{ fontSize: 12, color: 'var(--status-urgent)' }}>Tous les items obligatoires de la checklist doivent être cochés.</p>
                              )}
                              <div className="form-panel" style={{ padding: 0, border: 'none' }}>
                                <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                                  <label>Cause identifiée</label>
                                  <input value={compteRendu.causeIdentifiee} onChange={(e) => setCompteRendu({ ...compteRendu, causeIdentifiee: e.target.value })} />
                                </div>
                                <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                                  <label>Actions réalisées</label>
                                  <textarea rows={2} value={compteRendu.actionsRealisees} onChange={(e) => setCompteRendu({ ...compteRendu, actionsRealisees: e.target.value })} />
                                </div>
                                <div className="form-field">
                                  <label>Pièces utilisées</label>
                                  <input value={compteRendu.piecesUtilisees} onChange={(e) => setCompteRendu({ ...compteRendu, piecesUtilisees: e.target.value })} />
                                </div>
                                <div className="form-field">
                                  <label>Coût réel (FCFA)</label>
                                  <input type="number" value={compteRendu.coutReel} onChange={(e) => setCompteRendu({ ...compteRendu, coutReel: e.target.value })} />
                                </div>
                                <div className="form-field">
                                  <label>Photo avant {['Critique', 'Haute'].includes(actif?.criticite) && '(recommandé)'}</label>
                                  <input type="file" onChange={(e) => setCompteRendu({ ...compteRendu, photoAvant: e.target.files[0]?.name || '' })} />
                                </div>
                                <div className="form-field">
                                  <label>Photo après {['Critique', 'Haute'].includes(actif?.criticite) && '(recommandé)'}</label>
                                  <input type="file" onChange={(e) => setCompteRendu({ ...compteRendu, photoApres: e.target.files[0]?.name || '' })} />
                                </div>
                                <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                                  <label>Préconisations (ajoutées à la checklist du prochain cycle si préventif)</label>
                                  <input value={compteRendu.preconisations} onChange={(e) => setCompteRendu({ ...compteRendu, preconisations: e.target.value })} />
                                </div>
                                <div className="form-actions">
                                  <button type="button" className="btn" onClick={() => soumettreResolution(o.id)}>Marquer résolu</button>
                                </div>
                              </div>
                            </div>
                          )}

                          {o.statut === 'Résolu' && (
                            <div style={{ gridColumn: '1 / -1' }}>
                              <h3>Validation de la clôture (responsable de site — US-02, étape 6)</h3>
                              <p style={{ fontSize: 12, color: 'var(--color-muted)' }}>Validation explicite requise — aucune clôture automatique. Un rappel est envoyé chaque jour tant qu'aucune réponse n'est donnée.</p>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn" onClick={() => executer(() => onValiderCloture(o.id, true))}>Valider la clôture</button>
                                <input placeholder="Motif de refus" value={motifRefusCloture} onChange={(e) => setMotifRefusCloture(e.target.value)} style={{ fontSize: 12.5 }} />
                                <button className="btn secondary" onClick={() => executer(() => onValiderCloture(o.id, false, motifRefusCloture))}>Refuser</button>
                              </div>
                            </div>
                          )}

                          {o.compteRendu && (
                            <div style={{ gridColumn: '1 / -1' }}>
                              <h3>Compte-rendu enregistré</h3>
                              <p style={{ fontSize: 12.5, color: 'var(--color-muted)' }}>
                                {o.compteRendu.actionsRealisees} — Pièces : {o.compteRendu.piecesUtilisees || '—'} — Durée : {o.compteRendu.dureeHeures || 0}h — Coût : {(o.compteRendu.coutReel || 0).toLocaleString('fr-FR')} FCFA
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
