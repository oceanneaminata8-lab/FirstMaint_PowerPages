// Reconstruit la hiérarchie d'un emplacement (ex: Agence Douala > Étage 2 > Salle serveur)
// à partir de la liste plate des emplacements et de leur parentId.
export function EmplacementChain({ emplacementId, emplacements }) {
  if (!emplacementId) return <span className="chain">—</span>

  const chain = []
  let current = emplacements.find((e) => e.id === emplacementId)
  while (current) {
    chain.unshift(current)
    current = emplacements.find((e) => e.id === current.parentId)
  }

  return (
    <span className="chain">
      {chain.map((e, i) => (
        <span key={e.id}>
          {i > 0 && <span className="sep">›</span>}
          <span className="link">{e.nom}</span>
        </span>
      ))}
    </span>
  )
}
