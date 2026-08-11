import { useState } from 'react'

export function CategoriesActifs({ categoriesActif, actifs, onCreer }) {
  const [ouvert, setOuvert] = useState(false)
  const [form, setForm] = useState({ nom: '', description: '' })

  function soumettre(e) {
    e.preventDefault()
    if (!form.nom.trim()) return
    onCreer(form)
    setForm({ nom: '', description: '' })
    setOuvert(false)
  }

  return (
    <>
      <div className="page-header">
        <span className="page-eyebrow">Archives de base</span>
        <h1>Catégories d'actifs</h1>
        <p>Référentiel des typologies d'équipements utilisées à travers le patrimoine.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>{categoriesActif.length} catégorie(s)</h2>
          <button className="btn" onClick={() => setOuvert(!ouvert)}>{ouvert ? 'Annuler' : '+ Nouvelle catégorie'}</button>
        </div>

        {ouvert && (
          <form className="form-panel" onSubmit={soumettre}>
            <div className="form-field">
              <label>Nom</label>
              <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn secondary" onClick={() => setOuvert(false)}>Annuler</button>
              <button type="submit" className="btn">Créer la catégorie</button>
            </div>
          </form>
        )}

        <table>
          <thead>
            <tr>
              <th>Catégorie</th>
              <th>Description</th>
              <th>Actifs rattachés</th>
            </tr>
          </thead>
          <tbody>
            {categoriesActif.length === 0 && (
              <tr><td colSpan={3} className="empty-state">Aucune catégorie enregistrée.</td></tr>
            )}
            {categoriesActif.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.nom}</strong></td>
                <td style={{ color: 'var(--color-muted)', fontSize: 12.5 }}>{c.description || '—'}</td>
                <td>{actifs.filter((a) => a.categorieId === c.id).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
