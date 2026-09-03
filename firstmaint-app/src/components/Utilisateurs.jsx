import { useState } from 'react'
import { ROLES } from '../data/appConfig.js'

const STATUTS_UTILISATEUR = ['Actif', 'Suspendu']
const TONS_STATUT = { Actif: 'succes', Suspendu: 'urgent' }

export function Utilisateurs({ utilisateurs, onCreer, onChangerRole, onChangerStatut }) {
  const [ouvert, setOuvert] = useState(false)
  const [form, setForm] = useState({ nom: '', email: '', role: ROLES[0] })

  function soumettre(e) {
    e.preventDefault()
    if (!form.nom.trim() || !form.email.trim()) return
    onCreer(form)
    setForm({ nom: '', email: '', role: ROLES[0] })
    setOuvert(false)
  }

  return (
    <>
      <div className="page-header">
        <span className="page-eyebrow">Configurations</span>
        <h1>Utilisateurs & rôles</h1>
        <p>Comptes ayant accès à FirstMaint et profil associé (détermine les écrans visibles).</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>{utilisateurs.length} utilisateur(s)</h2>
          <button className="btn" onClick={() => setOuvert(!ouvert)}>{ouvert ? 'Annuler' : '+ Nouvel utilisateur'}</button>
        </div>

        {ouvert && (
          <form className="form-panel" onSubmit={soumettre}>
            <div className="form-field">
              <label>Nom</label>
              <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Profil</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-actions">
              <button type="button" className="btn secondary" onClick={() => setOuvert(false)}>Annuler</button>
              <button type="submit" className="btn">Créer l'utilisateur</button>
            </div>
          </form>
        )}

        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Profil</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {utilisateurs.length === 0 && (
              <tr><td colSpan={4} className="empty-state">Aucun utilisateur enregistré.</td></tr>
            )}
            {utilisateurs.map((u) => (
              <tr key={u.id}>
                <td><strong>{u.nom}</strong></td>
                <td>{u.email}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => onChangerRole(u.id, e.target.value)}
                    style={{ border: 'none', background: 'transparent', fontSize: 13, cursor: 'pointer' }}
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td>
                  <select
                    value={u.statut}
                    onChange={(e) => onChangerStatut(u.id, e.target.value)}
                    style={{ border: 'none', background: 'transparent', fontSize: 13, cursor: 'pointer' }}
                  >
                    {STATUTS_UTILISATEUR.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div style={{ marginTop: 4 }}>
                    <span className="badge" style={{
                      color: `var(--status-${TONS_STATUT[u.statut] || 'neutre'})`,
                      background: `var(--status-${TONS_STATUT[u.statut] || 'neutre'}-bg)`,
                    }}>
                      {u.statut}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
