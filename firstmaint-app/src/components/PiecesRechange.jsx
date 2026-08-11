import { useState } from 'react'

const TYPES_MOUVEMENT = ['Entrée', 'Sortie']

export function PiecesRechange({ piecesRechange, mouvementsStock, categoriesActif, onCreerPiece, onCreerMouvement }) {
  const [ouvertPiece, setOuvertPiece] = useState(false)
  const [formPiece, setFormPiece] = useState({
    nom: '', reference: '', categorieId: categoriesActif[0]?.id || '', quantiteStock: '', seuilMinimum: '', unite: 'unité',
  })

  const [ouvertMouvement, setOuvertMouvement] = useState(false)
  const [formMouvement, setFormMouvement] = useState({
    pieceId: piecesRechange[0]?.id || '', type: 'Sortie', quantite: '', motif: '',
  })

  function soumettrePiece(e) {
    e.preventDefault()
    if (!formPiece.nom.trim()) return
    onCreerPiece({ ...formPiece, quantiteStock: Number(formPiece.quantiteStock) || 0, seuilMinimum: Number(formPiece.seuilMinimum) || 0 })
    setFormPiece({ ...formPiece, nom: '', reference: '', quantiteStock: '', seuilMinimum: '' })
    setOuvertPiece(false)
  }

  function soumettreMouvement(e) {
    e.preventDefault()
    const quantite = Number(formMouvement.quantite)
    if (!formMouvement.pieceId || !quantite) return
    onCreerMouvement({ ...formMouvement, quantite })
    setFormMouvement({ ...formMouvement, quantite: '', motif: '' })
    setOuvertMouvement(false)
  }

  return (
    <>
      <div className="page-header">
        <span className="page-eyebrow">Gestion de la logistique</span>
        <h1>Pièces de rechange</h1>
        <p>Stock de pièces détachées utilisées dans les interventions de maintenance.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>{piecesRechange.length} référence(s)</h2>
          <button className="btn" onClick={() => setOuvertPiece(!ouvertPiece)}>{ouvertPiece ? 'Annuler' : '+ Nouvelle pièce'}</button>
        </div>

        {ouvertPiece && (
          <form className="form-panel" onSubmit={soumettrePiece}>
            <div className="form-field">
              <label>Nom</label>
              <input value={formPiece.nom} onChange={(e) => setFormPiece({ ...formPiece, nom: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Référence</label>
              <input value={formPiece.reference} onChange={(e) => setFormPiece({ ...formPiece, reference: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Catégorie</label>
              <select value={formPiece.categorieId} onChange={(e) => setFormPiece({ ...formPiece, categorieId: e.target.value })}>
                {categoriesActif.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Stock initial</label>
              <input type="number" value={formPiece.quantiteStock} onChange={(e) => setFormPiece({ ...formPiece, quantiteStock: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Seuil minimum</label>
              <input type="number" value={formPiece.seuilMinimum} onChange={(e) => setFormPiece({ ...formPiece, seuilMinimum: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Unité</label>
              <input value={formPiece.unite} onChange={(e) => setFormPiece({ ...formPiece, unite: e.target.value })} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn secondary" onClick={() => setOuvertPiece(false)}>Annuler</button>
              <button type="submit" className="btn">Créer la pièce</button>
            </div>
          </form>
        )}

        <table>
          <thead>
            <tr>
              <th>Pièce</th>
              <th>Référence</th>
              <th>Catégorie</th>
              <th>Stock</th>
              <th>Seuil minimum</th>
            </tr>
          </thead>
          <tbody>
            {piecesRechange.length === 0 && (
              <tr><td colSpan={5} className="empty-state">Aucune pièce enregistrée.</td></tr>
            )}
            {piecesRechange.map((p) => {
              const categorie = categoriesActif.find((c) => c.id === p.categorieId)
              const stockBas = p.quantiteStock < p.seuilMinimum
              return (
                <tr key={p.id}>
                  <td><strong>{p.nom}</strong></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{p.reference}</td>
                  <td>{categorie?.nom || '—'}</td>
                  <td>
                    <span className="badge" style={{
                      color: stockBas ? 'var(--status-urgent)' : 'var(--status-succes)',
                      background: stockBas ? 'var(--status-urgent-bg)' : 'var(--status-succes-bg)',
                    }}>
                      {p.quantiteStock} {p.unite}
                    </span>
                  </td>
                  <td>{p.seuilMinimum} {p.unite}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>{mouvementsStock.length} mouvement(s) de stock</h2>
          <button className="btn" onClick={() => setOuvertMouvement(!ouvertMouvement)}>{ouvertMouvement ? 'Annuler' : '+ Nouveau mouvement'}</button>
        </div>

        {ouvertMouvement && (
          <form className="form-panel" onSubmit={soumettreMouvement}>
            <div className="form-field">
              <label>Pièce</label>
              <select value={formMouvement.pieceId} onChange={(e) => setFormMouvement({ ...formMouvement, pieceId: e.target.value })}>
                {piecesRechange.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Type</label>
              <select value={formMouvement.type} onChange={(e) => setFormMouvement({ ...formMouvement, type: e.target.value })}>
                {TYPES_MOUVEMENT.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Quantité</label>
              <input type="number" value={formMouvement.quantite} onChange={(e) => setFormMouvement({ ...formMouvement, quantite: e.target.value })} required />
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Motif</label>
              <input value={formMouvement.motif} onChange={(e) => setFormMouvement({ ...formMouvement, motif: e.target.value })} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn secondary" onClick={() => setOuvertMouvement(false)}>Annuler</button>
              <button type="submit" className="btn">Enregistrer le mouvement</button>
            </div>
          </form>
        )}

        <table>
          <thead>
            <tr>
              <th>Pièce</th>
              <th>Type</th>
              <th>Quantité</th>
              <th>Date</th>
              <th>Motif</th>
            </tr>
          </thead>
          <tbody>
            {mouvementsStock.length === 0 && (
              <tr><td colSpan={5} className="empty-state">Aucun mouvement enregistré.</td></tr>
            )}
            {[...mouvementsStock].sort((a, b) => new Date(b.date) - new Date(a.date)).map((m) => {
              const piece = piecesRechange.find((p) => p.id === m.pieceId)
              return (
                <tr key={m.id}>
                  <td>{piece?.nom || '—'}</td>
                  <td>{m.type}</td>
                  <td>{m.quantite} {piece?.unite}</td>
                  <td>{m.date}</td>
                  <td style={{ color: 'var(--color-muted)', fontSize: 12.5 }}>{m.motif || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
