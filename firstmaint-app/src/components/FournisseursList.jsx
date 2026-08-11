import { useState } from 'react'

const TYPES_CONTRAT = ['Maintenance', 'Maintenance préventive', 'Garantie étendue', 'Support technique']
const STATUTS_PRESTATAIRE = ['Actif', 'Suspendu', 'Blacklisté']
const TONS_STATUT_PRESTATAIRE = { Actif: 'succes', Suspendu: 'attention', Blacklisté: 'urgent' }

function estExpire(dateFin) {
  return new Date(dateFin) < new Date(new Date().toDateString())
}

export function FournisseursList({ fournisseurs, contrats, actifs, onCreerFournisseur, onCreerContrat }) {
  const [ouvertFournisseur, setOuvertFournisseur] = useState(false)
  const [formFournisseur, setFormFournisseur] = useState({
    nom: '', contact: '', telephone: '', email: '', specialite: '', rccm: '', statutPrestataire: 'Actif',
  })

  const [ouvertContrat, setOuvertContrat] = useState(false)
  const [formContrat, setFormContrat] = useState({
    fournisseurId: fournisseurs[0]?.id || '',
    type: 'Maintenance',
    objet: '',
    valeur: '',
    dateDebut: '',
    dateFin: '',
    conditionsRenouvellement: '',
    actifsCouverts: [],
  })

  function soumettreFournisseur(e) {
    e.preventDefault()
    if (!formFournisseur.nom.trim()) return
    onCreerFournisseur(formFournisseur)
    setFormFournisseur({ nom: '', contact: '', telephone: '', email: '', specialite: '', rccm: '', statutPrestataire: 'Actif' })
    setOuvertFournisseur(false)
  }

  function soumettreContrat(e) {
    e.preventDefault()
    if (!formContrat.fournisseurId || !formContrat.dateDebut || !formContrat.dateFin) return
    onCreerContrat({ ...formContrat, valeur: Number(formContrat.valeur) || 0 })
    setFormContrat({ ...formContrat, objet: '', valeur: '', dateDebut: '', dateFin: '', conditionsRenouvellement: '', actifsCouverts: [] })
    setOuvertContrat(false)
  }

  function toggleActifCouvert(id) {
    setFormContrat((f) => ({
      ...f,
      actifsCouverts: f.actifsCouverts.includes(id)
        ? f.actifsCouverts.filter((a) => a !== id)
        : [...f.actifsCouverts, id],
    }))
  }

  return (
    <>
      <div className="page-header">
        <span className="page-eyebrow">Gestion financière</span>
        <h1>Fournisseurs & Contrats</h1>
        <p>Prestataires externes et contrats de maintenance ou de garantie associés aux actifs.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>{fournisseurs.length} fournisseur(s)</h2>
          <button className="btn" onClick={() => setOuvertFournisseur(!ouvertFournisseur)}>
            {ouvertFournisseur ? 'Annuler' : '+ Nouveau fournisseur'}
          </button>
        </div>

        {ouvertFournisseur && (
          <form className="form-panel" onSubmit={soumettreFournisseur}>
            <div className="form-field">
              <label>Nom</label>
              <input value={formFournisseur.nom} onChange={(e) => setFormFournisseur({ ...formFournisseur, nom: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Spécialité</label>
              <input value={formFournisseur.specialite} onChange={(e) => setFormFournisseur({ ...formFournisseur, specialite: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Contact</label>
              <input value={formFournisseur.contact} onChange={(e) => setFormFournisseur({ ...formFournisseur, contact: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Téléphone</label>
              <input value={formFournisseur.telephone} onChange={(e) => setFormFournisseur({ ...formFournisseur, telephone: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Email</label>
              <input type="email" value={formFournisseur.email} onChange={(e) => setFormFournisseur({ ...formFournisseur, email: e.target.value })} />
            </div>
            <div className="form-field">
              <label>RCCM</label>
              <input value={formFournisseur.rccm} onChange={(e) => setFormFournisseur({ ...formFournisseur, rccm: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Statut du prestataire</label>
              <select value={formFournisseur.statutPrestataire} onChange={(e) => setFormFournisseur({ ...formFournisseur, statutPrestataire: e.target.value })}>
                {STATUTS_PRESTATAIRE.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-actions">
              <button type="button" className="btn secondary" onClick={() => setOuvertFournisseur(false)}>Annuler</button>
              <button type="submit" className="btn">Créer le fournisseur</button>
            </div>
          </form>
        )}

        <table>
          <thead>
            <tr>
              <th>Fournisseur</th>
              <th>Spécialité</th>
              <th>Contact</th>
              <th>Téléphone</th>
              <th>Email</th>
              <th>RCCM</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {fournisseurs.length === 0 && (
              <tr><td colSpan={7} className="empty-state">Aucun fournisseur enregistré.</td></tr>
            )}
            {fournisseurs.map((f) => (
              <tr key={f.id}>
                <td><strong>{f.nom}</strong></td>
                <td>{f.specialite || '—'}</td>
                <td>{f.contact || '—'}</td>
                <td>{f.telephone || '—'}</td>
                <td>{f.email || '—'}</td>
                <td style={{ fontSize: 12 }}>{f.rccm || '—'}</td>
                <td>
                  <span className="badge" style={{
                    color: `var(--status-${TONS_STATUT_PRESTATAIRE[f.statutPrestataire] || 'neutre'})`,
                    background: `var(--status-${TONS_STATUT_PRESTATAIRE[f.statutPrestataire] || 'neutre'}-bg)`,
                  }}>
                    {f.statutPrestataire || '—'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>{contrats.length} contrat(s)</h2>
          <button className="btn" onClick={() => setOuvertContrat(!ouvertContrat)}>
            {ouvertContrat ? 'Annuler' : '+ Nouveau contrat'}
          </button>
        </div>

        {ouvertContrat && (
          <form className="form-panel" onSubmit={soumettreContrat}>
            <div className="form-field">
              <label>Fournisseur</label>
              <select value={formContrat.fournisseurId} onChange={(e) => setFormContrat({ ...formContrat, fournisseurId: e.target.value })}>
                {fournisseurs.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Type de contrat</label>
              <select value={formContrat.type} onChange={(e) => setFormContrat({ ...formContrat, type: e.target.value })}>
                {TYPES_CONTRAT.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Date de début</label>
              <input type="date" value={formContrat.dateDebut} onChange={(e) => setFormContrat({ ...formContrat, dateDebut: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Date de fin</label>
              <input type="date" value={formContrat.dateFin} onChange={(e) => setFormContrat({ ...formContrat, dateFin: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Valeur du contrat (FCFA)</label>
              <input type="number" value={formContrat.valeur} onChange={(e) => setFormContrat({ ...formContrat, valeur: e.target.value })} />
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Objet du contrat</label>
              <textarea rows={2} value={formContrat.objet} onChange={(e) => setFormContrat({ ...formContrat, objet: e.target.value })} />
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Conditions de renouvellement</label>
              <input value={formContrat.conditionsRenouvellement} onChange={(e) => setFormContrat({ ...formContrat, conditionsRenouvellement: e.target.value })} />
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Actifs couverts</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {actifs.map((a) => (
                  <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 400, textTransform: 'none' }}>
                    <input
                      type="checkbox"
                      checked={formContrat.actifsCouverts.includes(a.id)}
                      onChange={() => toggleActifCouvert(a.id)}
                    />
                    {a.nom}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn secondary" onClick={() => setOuvertContrat(false)}>Annuler</button>
              <button type="submit" className="btn">Créer le contrat</button>
            </div>
          </form>
        )}

        <table>
          <thead>
            <tr>
              <th>Fournisseur</th>
              <th>Type / Objet</th>
              <th>Valeur</th>
              <th>Validité</th>
              <th>Actifs couverts</th>
            </tr>
          </thead>
          <tbody>
            {contrats.length === 0 && (
              <tr><td colSpan={5} className="empty-state">Aucun contrat enregistré.</td></tr>
            )}
            {contrats.map((c) => {
              const fournisseur = fournisseurs.find((f) => f.id === c.fournisseurId)
              const expire = estExpire(c.dateFin)
              const actifsListe = c.actifsCouverts.map((id) => actifs.find((a) => a.id === id)?.nom).filter(Boolean)
              return (
                <tr key={c.id}>
                  <td>{fournisseur?.nom || '—'}</td>
                  <td>
                    {c.type}
                    <br />
                    <span style={{ color: 'var(--color-muted)', fontSize: 12 }}>{c.objet}</span>
                  </td>
                  <td>{c.valeur ? `${c.valeur.toLocaleString('fr-FR')} FCFA` : '—'}</td>
                  <td>
                    <span style={{ color: expire ? 'var(--status-urgent)' : 'inherit', fontWeight: expire ? 600 : 400 }}>
                      {c.dateDebut} → {c.dateFin}
                      {expire && ' (expiré)'}
                    </span>
                  </td>
                  <td>{actifsListe.length > 0 ? actifsListe.join(', ') : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
