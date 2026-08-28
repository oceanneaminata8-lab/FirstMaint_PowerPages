import { useState, Fragment } from 'react'
import { StatusBadge } from './StatusBadge.jsx'
import { EmplacementChain } from './EmplacementChain.jsx'
import { PieceJointeUploader } from './PieceJointeUploader.jsx'
import { DiscussionTicket } from './DiscussionTicket.jsx'
import { Icon } from './Icons.jsx'

const STATUTS = ['Ouvert', 'En traitement', 'Résolu', 'Fermé']
const URGENCES = ['Faible', 'Moyenne', 'Haute']
const SECTIONS_ETENDUES = { PIECES: 'pieces', DISCUSSION: 'discussion' }

export function TicketsList({
  tickets, emplacements, actifs, onCreer, onChangerStatut, onAjouterPieceJointe, onTransformerEnOrdre,
  onChargerCommentaires, onEnvoyerCommentaire,
}) {
  const [ouvert, setOuvert] = useState(false)
  const [form, setForm] = useState({
    titre: '', description: '', emplacementId: emplacements[0]?.id || '', actifId: '', demandeur: '', urgence: 'Moyenne',
  })
  const [codeScanne, setCodeScanne] = useState('')
  const [ligneEtendue, setLigneEtendue] = useState(null)
  const [sectionEtendue, setSectionEtendue] = useState(SECTIONS_ETENDUES.PIECES)
  const [commentaires, setCommentaires] = useState({})
  const [chargementCommentaires, setChargementCommentaires] = useState(false)

  async function ouvrirLigne(ticketId, section) {
    if (ligneEtendue === ticketId && sectionEtendue === section) {
      setLigneEtendue(null)
      return
    }
    setLigneEtendue(ticketId)
    setSectionEtendue(section)
    if (section === SECTIONS_ETENDUES.DISCUSSION && !commentaires[ticketId]) {
      setChargementCommentaires(true)
      try {
        const liste = await onChargerCommentaires(ticketId)
        setCommentaires((prev) => ({ ...prev, [ticketId]: liste }))
      } finally {
        setChargementCommentaires(false)
      }
    }
  }

  async function envoyerCommentaire(ticketId, message) {
    const cree = await onEnvoyerCommentaire(ticketId, message)
    setCommentaires((prev) => ({ ...prev, [ticketId]: [...(prev[ticketId] || []), cree] }))
  }

  function soumettre(e) {
    e.preventDefault()
    if (!form.titre.trim()) return
    onCreer({ ...form, actifId: form.actifId || null, statut: 'Ouvert' })
    setForm({ titre: '', description: '', emplacementId: emplacements[0]?.id || '', actifId: '', demandeur: '', urgence: 'Moyenne' })
    setCodeScanne('')
    setOuvert(false)
  }

  // Simule le scan du QR code de l'actif (US-02, étape 1) : recherche par code
  // inventaire et présélectionne l'actif dans la liste déroulante.
  function rechercherParCode() {
    const trouve = actifs.find((a) => a.codeInventaire?.toLowerCase() === codeScanne.trim().toLowerCase())
    if (trouve) setForm((f) => ({ ...f, actifId: trouve.id, emplacementId: trouve.emplacementId || f.emplacementId }))
  }

  return (
    <>
      <div className="page-header">
        <span className="page-eyebrow">Support</span>
        <h1>Tickets</h1>
        <p>Demandes remontées par les agences avant transformation en ordre de travail.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>{tickets.length} ticket(s)</h2>
          <button className="btn" onClick={() => setOuvert(!ouvert)}>
            {ouvert ? 'Annuler' : <><Icon type="plus" /> Nouveau ticket</>}
          </button>
        </div>

        {ouvert && (
          <form className="form-panel" onSubmit={soumettre}>
            <div className="form-field">
              <label>Titre</label>
              <input value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Emplacement</label>
              <select value={form.emplacementId} onChange={(e) => setForm({ ...form, emplacementId: e.target.value })}>
                {emplacements.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Code de l'actif (scan simulé)</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input value={codeScanne} onChange={(e) => setCodeScanne(e.target.value)} placeholder="INV-2024-0031" />
                <button type="button" className="btn secondary" style={{ padding: '5px 10px', fontSize: 12 }} onClick={rechercherParCode}>Identifier</button>
              </div>
            </div>
            <div className="form-field">
              <label>Actif concerné (optionnel)</label>
              <select value={form.actifId} onChange={(e) => setForm({ ...form, actifId: e.target.value })}>
                <option value="">—</option>
                {(actifs || []).map((a) => <option key={a.id} value={a.id}>{a.nom} ({a.codeInventaire})</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Urgence perçue (facultative — la criticité définitive est calculée automatiquement)</label>
              <select value={form.urgence} onChange={(e) => setForm({ ...form, urgence: e.target.value })}>
                {URGENCES.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Demandeur</label>
              <input value={form.demandeur} onChange={(e) => setForm({ ...form, demandeur: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Description</label>
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn secondary" onClick={() => setOuvert(false)}>Annuler</button>
              <button type="submit" className="btn">Créer le ticket</button>
            </div>
          </form>
        )}

        <table>
          <thead>
            <tr>
              <th>Titre</th>
              <th>Emplacement</th>
              <th>Demandeur</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => {
              const estEtendue = ligneEtendue === t.id
              return (
                <Fragment key={t.id}>
                  <tr>
                    <td>
                      {t.titre}
                      <br />
                      <span style={{ color: 'var(--color-muted)', fontSize: 12 }}>{t.description}</span>
                    </td>
                    <td><EmplacementChain emplacementId={t.emplacementId} emplacements={emplacements} /></td>
                    <td>{t.demandeur || '—'}</td>
                    <td>
                      <select
                        value={t.statut}
                        onChange={(e) => onChangerStatut(t.id, e.target.value)}
                        style={{ border: 'none', background: 'transparent', fontSize: 13, cursor: 'pointer' }}
                      >
                        {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <div style={{ marginTop: 4 }}><StatusBadge statut={t.statut} /></div>
                    </td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn secondary"
                        style={{ padding: '5px 10px', fontSize: 12 }}
                        onClick={() => ouvrirLigne(t.id, SECTIONS_ETENDUES.PIECES)}
                      >
                        {estEtendue && sectionEtendue === SECTIONS_ETENDUES.PIECES ? 'Fermer' : 'Pièces jointes'}
                      </button>
                      <button
                        className="btn secondary"
                        style={{ padding: '5px 10px', fontSize: 12 }}
                        onClick={() => ouvrirLigne(t.id, SECTIONS_ETENDUES.DISCUSSION)}
                      >
                        {estEtendue && sectionEtendue === SECTIONS_ETENDUES.DISCUSSION ? 'Fermer' : 'Discussion'}
                      </button>
                      {!t.ordreTravailId && (
                        <button
                          className="btn"
                          style={{ padding: '5px 10px', fontSize: 12 }}
                          onClick={() => onTransformerEnOrdre(t.id)}
                        >
                          Créer un OT
                        </button>
                      )}
                    </td>
                  </tr>
                  {estEtendue && sectionEtendue === SECTIONS_ETENDUES.PIECES && (
                    <tr>
                      <td colSpan={5} className="row-detail">
                        <h3>Pièces jointes</h3>
                        <PieceJointeUploader
                          piecesJointes={t.piecesJointes || []}
                          onAjouter={(nomFichier) => onAjouterPieceJointe(t.id, nomFichier)}
                        />
                      </td>
                    </tr>
                  )}
                  {estEtendue && sectionEtendue === SECTIONS_ETENDUES.DISCUSSION && (
                    <tr>
                      <td colSpan={5} className="row-detail">
                        <h3>Discussion avec la DMG</h3>
                        <DiscussionTicket
                          commentaires={commentaires[t.id] || []}
                          chargement={chargementCommentaires}
                          onEnvoyer={(message) => envoyerCommentaire(t.id, message)}
                        />
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
