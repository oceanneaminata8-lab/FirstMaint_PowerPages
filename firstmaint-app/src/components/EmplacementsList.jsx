import { useState } from 'react'

// Regroupe les emplacements par parentId pour construire l'arbre à partir
// de la liste plate (les emplacements racine sont rangés sous la clé 'racine').
function construireArbre(emplacements) {
  const enfantsParParent = {}
  emplacements.forEach((e) => {
    const cle = e.parentId || 'racine'
    if (!enfantsParParent[cle]) enfantsParParent[cle] = []
    enfantsParParent[cle].push(e)
  })
  return enfantsParParent
}

function NoeudEmplacement({ emplacement, enfantsParParent, actifsParEmplacement, niveau }) {
  const [ouvert, setOuvert] = useState(niveau < 1)
  const enfants = enfantsParParent[emplacement.id] || []
  const actifsIci = actifsParEmplacement[emplacement.id] || []
  const aDuContenu = enfants.length > 0 || actifsIci.length > 0

  return (
    <div className="tree-node">
      <div
        className={`tree-node-row ${aDuContenu ? '' : 'tree-node-row-vide'}`}
        onClick={() => aDuContenu && setOuvert((v) => !v)}
        style={{ paddingLeft: 12 + niveau * 22 }}
      >
        <span className="tree-toggle">{aDuContenu ? (ouvert ? '▾' : '▸') : '·'}</span>
        <span className="tree-label">{emplacement.nom}</span>
        <span className="tree-type">{emplacement.type}</span>
        {actifsIci.length > 0 && (
          <span className="tree-count">{actifsIci.length} actif(s)</span>
        )}
      </div>

      {ouvert && (
        <div className="tree-children">
          {enfants.map((enfant) => (
            <NoeudEmplacement
              key={enfant.id}
              emplacement={enfant}
              enfantsParParent={enfantsParParent}
              actifsParEmplacement={actifsParEmplacement}
              niveau={niveau + 1}
            />
          ))}
          {actifsIci.map((actif) => (
            <div key={actif.id} className="tree-actif" style={{ paddingLeft: 12 + (niveau + 1) * 22 }}>
              <span className="tree-actif-dot" />
              {actif.nom}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const TYPES_EMPLACEMENT = ['Siège', 'Agence', 'Bâtiment', 'Étage', 'Salle', 'Local']

export function EmplacementsList({ emplacements, actifs, onCreer }) {
  const enfantsParParent = construireArbre(emplacements)
  const racines = enfantsParParent['racine'] || []

  const actifsParEmplacement = {}
  actifs.forEach((a) => {
    if (!actifsParEmplacement[a.emplacementId]) actifsParEmplacement[a.emplacementId] = []
    actifsParEmplacement[a.emplacementId].push(a)
  })

  const [ouvert, setOuvert] = useState(false)
  const [form, setForm] = useState({ nom: '', type: 'Salle', parentId: '' })

  function soumettre(e) {
    e.preventDefault()
    if (!form.nom.trim()) return
    onCreer({ nom: form.nom, type: form.type, parentId: form.parentId || null })
    setForm({ ...form, nom: '' })
    setOuvert(false)
  }

  return (
    <>
      <div className="page-header">
        <span className="page-eyebrow">Patrimoine</span>
        <h1>Emplacements</h1>
        <p>Hiérarchie des sites : siège, agences, bâtiments, étages et salles.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>{emplacements.length} emplacement(s)</h2>
          <button className="btn" onClick={() => setOuvert(!ouvert)}>{ouvert ? 'Annuler' : '+ Nouvel emplacement'}</button>
        </div>

        {ouvert && (
          <form className="form-panel" onSubmit={soumettre}>
            <div className="form-field">
              <label>Nom</label>
              <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPES_EMPLACEMENT.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Rattaché à</label>
              <select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
                <option value="">Aucun (racine)</option>
                {emplacements.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
              </select>
            </div>
            <div className="form-actions">
              <button type="button" className="btn secondary" onClick={() => setOuvert(false)}>Annuler</button>
              <button type="submit" className="btn">Créer l'emplacement</button>
            </div>
          </form>
        )}

        <div className="tree">
          {racines.length === 0 ? (
            <div className="empty-state">Aucun emplacement enregistré.</div>
          ) : (
            racines.map((racine) => (
              <NoeudEmplacement
                key={racine.id}
                emplacement={racine}
                enfantsParParent={enfantsParParent}
                actifsParEmplacement={actifsParEmplacement}
                niveau={0}
              />
            ))
          )}
        </div>
      </div>
    </>
  )
}
