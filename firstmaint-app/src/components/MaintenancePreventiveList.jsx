import { useState } from 'react'
import { StatusBadge } from './StatusBadge.jsx'

const FREQUENCES = ['Hebdomadaire', 'Mensuelle', 'Trimestrielle', 'Semestrielle', 'Annuelle']
const TYPES_PLAN = ['Calendaire', 'Basé sur l\'usage', 'Réglementaire', 'Conditionnel']

// Fréquence suggérée selon la criticité de l'actif (US-01, grille de criticité) :
// mensuelle pour la criticité Critique, plus espacée ensuite.
const FREQUENCE_SUGGEREE_PAR_CRITICITE = {
  Critique: 'Mensuelle',
  Haute: 'Trimestrielle',
  Moyenne: 'Semestrielle',
  Basse: 'Annuelle',
}

function estEnRetard(dateEcheance) {
  return new Date(dateEcheance) < new Date(new Date().toDateString())
}

export function MaintenancePreventiveList({
  plansPreventifs, echeancesPlan = [], actifs, categoriesActif, fournisseurs = [], ordresTravail, role, onCreer, onValider,
}) {
  const [ouvert, setOuvert] = useState(false)
  const [cible, setCible] = useState('actif') // 'actif' ou 'categorie'
  const [form, setForm] = useState({
    nom: '',
    description: '',
    type: 'Calendaire',
    frequence: 'Mensuelle',
    prochaineEcheance: '',
    actifId: actifs[0]?.id || '',
    categorieId: categoriesActif[0]?.id || '',
    prestataireParDefautId: '',
    dureeEstimee: '',
    coutEstime: '',
  })
  const [checklist, setChecklist] = useState([])
  const [nouvelItem, setNouvelItem] = useState('')
  const [nouvelItemObligatoire, setNouvelItemObligatoire] = useState(true)
  const [dateActivation, setDateActivation] = useState({})

  function choisirActif(actifId) {
    const actif = actifs.find((a) => a.id === actifId)
    const suggestion = FREQUENCE_SUGGEREE_PAR_CRITICITE[actif?.criticite]
    setForm((f) => ({ ...f, actifId, frequence: suggestion || f.frequence }))
  }

  function ajouterItemChecklist() {
    if (!nouvelItem.trim()) return
    setChecklist((c) => [...c, { id: `ck-${Date.now()}`, libelle: nouvelItem.trim(), obligatoire: nouvelItemObligatoire }])
    setNouvelItem('')
  }

  function retirerItemChecklist(id) {
    setChecklist((c) => c.filter((i) => i.id !== id))
  }

  function soumettre(e) {
    e.preventDefault()
    if (!form.nom.trim() || !form.prochaineEcheance) return
    onCreer({
      nom: form.nom,
      description: form.description,
      type: form.type,
      frequence: form.frequence,
      prochaineEcheance: form.prochaineEcheance,
      actifId: cible === 'actif' ? form.actifId : null,
      categorieId: cible === 'categorie' ? form.categorieId : null,
      prestataireParDefautId: form.prestataireParDefautId || null,
      dureeEstimee: Number(form.dureeEstimee) || 0,
      coutEstime: Number(form.coutEstime) || 0,
      checklist,
    })
    setForm({ ...form, nom: '', description: '', prochaineEcheance: '' })
    setChecklist([])
    setOuvert(false)
  }

  return (
    <>
      <div className="page-header">
        <span className="page-eyebrow">Planification</span>
        <h1>Maintenance préventive</h1>
        <p>Plans typés avec checklist, rattachés à un actif ou à une catégorie d'actif (US-03).</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>{plansPreventifs.length} plan(s) préventif(s)</h2>
          <button className="btn" onClick={() => setOuvert(!ouvert)}>
            {ouvert ? 'Annuler' : '+ Nouveau plan'}
          </button>
        </div>

        {ouvert && (
          <form className="form-panel" onSubmit={soumettre}>
            <div className="form-field">
              <label>Nom du plan</label>
              <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPES_PLAN.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Fréquence</label>
              <select value={form.frequence} onChange={(e) => setForm({ ...form, frequence: e.target.value })}>
                {FREQUENCES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Première échéance</label>
              <input type="date" value={form.prochaineEcheance} onChange={(e) => setForm({ ...form, prochaineEcheance: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Rattaché à</label>
              <select value={cible} onChange={(e) => setCible(e.target.value)}>
                <option value="actif">Un actif précis</option>
                <option value="categorie">Une catégorie d'actif</option>
              </select>
            </div>
            {cible === 'actif' ? (
              <div className="form-field">
                <label>Actif</label>
                <select value={form.actifId} onChange={(e) => choisirActif(e.target.value)}>
                  {actifs.map((a) => <option key={a.id} value={a.id}>{a.nom} ({a.criticite || '—'})</option>)}
                </select>
              </div>
            ) : (
              <div className="form-field">
                <label>Catégorie</label>
                <select value={form.categorieId} onChange={(e) => setForm({ ...form, categorieId: e.target.value })}>
                  {categoriesActif.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
            )}
            <div className="form-field">
              <label>Prestataire par défaut</label>
              <select value={form.prestataireParDefautId} onChange={(e) => setForm({ ...form, prestataireParDefautId: e.target.value })}>
                <option value="">—</option>
                {fournisseurs.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Durée estimée (h)</label>
              <input type="number" step="0.5" value={form.dureeEstimee} onChange={(e) => setForm({ ...form, dureeEstimee: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Coût estimé (FCFA)</label>
              <input type="number" value={form.coutEstime} onChange={(e) => setForm({ ...form, coutEstime: e.target.value })} />
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Description</label>
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Checklist d'opérations</label>
              <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                <input value={nouvelItem} onChange={(e) => setNouvelItem(e.target.value)} placeholder="Libellé de l'item" style={{ flex: 1 }} />
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5 }}>
                  <input type="checkbox" checked={nouvelItemObligatoire} onChange={(e) => setNouvelItemObligatoire(e.target.checked)} />
                  Obligatoire
                </label>
                <button type="button" className="btn secondary" style={{ padding: '5px 10px', fontSize: 12 }} onClick={ajouterItemChecklist}>Ajouter</button>
              </div>
              {checklist.length > 0 && (
                <ul className="journal-list">
                  {checklist.map((item) => (
                    <li key={item.id}>
                      {item.libelle} {item.obligatoire && <span style={{ color: 'var(--status-urgent)' }}>*</span>}
                      <button type="button" className="link-button" style={{ marginLeft: 8 }} onClick={() => retirerItemChecklist(item.id)}>Retirer</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="form-actions">
              <button type="button" className="btn secondary" onClick={() => setOuvert(false)}>Annuler</button>
              <button type="submit" className="btn">Créer le plan (Brouillon)</button>
            </div>
          </form>
        )}

        <table>
          <thead>
            <tr>
              <th>Plan</th>
              <th>Type</th>
              <th>Rattachement</th>
              <th>Fréquence</th>
              <th>État</th>
              <th>Échéances</th>
              <th>OT générés</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {plansPreventifs.length === 0 && (
              <tr><td colSpan={8} className="empty-state">Aucun plan préventif enregistré.</td></tr>
            )}
            {plansPreventifs.map((plan) => {
              const actif = actifs.find((a) => a.id === plan.actifId)
              const categorie = categoriesActif.find((c) => c.id === plan.categorieId)
              const echeances = echeancesPlan.filter((e) => e.planPreventifId === plan.id)
              const otGeneres = (ordresTravail || []).filter((o) => o.planPreventifId === plan.id).length
              return (
                <tr key={plan.id}>
                  <td>
                    <strong>{plan.nom}</strong>
                    <br />
                    <span style={{ color: 'var(--color-muted)', fontSize: 12 }}>{plan.description}</span>
                  </td>
                  <td>{plan.type || '—'}</td>
                  <td>{actif ? actif.nom : (categorie ? `Catégorie : ${categorie.nom}` : '—')}</td>
                  <td>{plan.frequence}</td>
                  <td><StatusBadge statut={plan.etatCycleVie || 'Actif'} /></td>
                  <td>
                    {echeances.length === 0 ? (
                      plan.etatCycleVie === 'Brouillon' ? '—' : `${plan.prochaineEcheance || '—'}`
                    ) : (
                      echeances.slice(0, 3).map((e) => {
                        const enRetard = estEnRetard(e.prochaineEcheance)
                        return (
                          <div key={e.id} style={{ color: enRetard ? 'var(--status-urgent)' : 'inherit', fontWeight: enRetard ? 600 : 400 }}>
                            {e.prochaineEcheance}{enRetard && ' (en retard)'}
                          </div>
                        )
                      })
                    )}
                    {echeances.length > 3 && <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>+{echeances.length - 3} autre(s)</div>}
                  </td>
                  <td>{otGeneres}</td>
                  <td>
                    {plan.etatCycleVie === 'Brouillon' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          type="date"
                          value={dateActivation[plan.id] || ''}
                          onChange={(e) => setDateActivation({ ...dateActivation, [plan.id]: e.target.value })}
                          style={{ fontSize: 11, width: 120 }}
                        />
                        <button className="btn secondary" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => onValider(plan.id, dateActivation[plan.id])}>
                          Activer
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
