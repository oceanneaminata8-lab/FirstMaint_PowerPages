import { useState } from 'react'

// Mock : on ne stocke que le nom du fichier choisi, pas son contenu.
// L'upload réel arrivera avec le branchement Dataverse/SharePoint.
// `typesDocuments` (optionnel) ajoute un select de catégorisation — utilisé
// pour les pièces jointes d'une fiche actif (facture, PV, garantie, manuel...).
export function PieceJointeUploader({ piecesJointes, onAjouter, typesDocuments }) {
  const [nomFichier, setNomFichier] = useState('')
  const [typeDocument, setTypeDocument] = useState(typesDocuments?.[0] || '')

  function ajouter(e) {
    e.preventDefault()
    if (!nomFichier.trim()) return
    if (typesDocuments) onAjouter(nomFichier.trim(), typeDocument)
    else onAjouter(nomFichier.trim())
    setNomFichier('')
  }

  return (
    <div className="pieces-jointes">
      <div className="pieces-jointes-liste">
        {piecesJointes.length === 0 ? (
          <span style={{ color: 'var(--color-muted)', fontSize: 12.5 }}>Aucune pièce jointe.</span>
        ) : (
          piecesJointes.map((pj) => (
            <span key={pj.id} className="piece-jointe-chip">
              📎 {pj.nomFichier}{pj.typeDocument ? ` (${pj.typeDocument})` : ''}
            </span>
          ))
        )}
      </div>
      <form className="pieces-jointes-form" onSubmit={ajouter}>
        {typesDocuments && (
          <select value={typeDocument} onChange={(e) => setTypeDocument(e.target.value)} style={{ fontSize: 12.5 }}>
            {typesDocuments.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
        <input
          type="file"
          onChange={(e) => setNomFichier(e.target.files[0]?.name || '')}
          style={{ fontSize: 12.5 }}
        />
        <button type="submit" className="btn secondary" style={{ padding: '5px 10px', fontSize: 12 }}>
          Joindre
        </button>
      </form>
    </div>
  )
}
