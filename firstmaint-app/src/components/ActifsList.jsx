import { useRef, useState } from 'react'
import { StatusBadge } from './StatusBadge.jsx'
import { EmplacementChain } from './EmplacementChain.jsx'
import { parseCsv } from '../utils/csvImport.js'

const STATUTS = ['En service', 'En panne', 'En maintenance', 'Retiré']
const CRITICITES = ['Critique', 'Haute', 'Moyenne', 'Basse']
const ETATS_CYCLE_VIE = ['Brouillon', 'En validation', 'Actif', 'En retrait', 'Retiré']

// Valide pour la criticité 1 (Critique) : Direction seule. Pour les autres,
// le Gestionnaire DMG suffit (US-01, section 1.2 — cycle de vie).
function peutValider(role) {
  return role === 'Gestionnaire DMG' || role === 'Direction'
}

export function ActifsList({
  actifs, emplacements, categoriesActif, role,
  onChangerStatut, onSelectionner, onCreer, onImporterCsv,
  onSoumettrePourValidation, onValider, onRejeter, onGenererCodeInventaire, onCreerEmplacement,
}) {
  const [recherche, setRecherche] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('')
  const [filtreCategorie, setFiltreCategorie] = useState('')
  const [filtreEmplacement, setFiltreEmplacement] = useState('')
  const [filtreCriticite, setFiltreCriticite] = useState('')
  const [filtreEtatCycleVie, setFiltreEtatCycleVie] = useState('')

  const [ouvert, setOuvert] = useState(false)
  const [form, setForm] = useState({
    nom: '', codeInventaire: '', numeroSerie: '',
    emplacementId: emplacements[0]?.id || '', categorieId: categoriesActif[0]?.id || '',
    criticite: 'Moyenne', statut: 'En service', dateAcquisition: '', dateFinGarantie: '', valeur: '',
  })
  const [nouveauLocalOuvert, setNouveauLocalOuvert] = useState(false)
  const [nouveauLocal, setNouveauLocal] = useState({ nom: '', type: 'Salle', parentId: emplacements[0]?.id || '' })

  const inputFichierRef = useRef(null)
  const [messageImport, setMessageImport] = useState('')
  const [rejetsImport, setRejetsImport] = useState([])
  const [rejetActifEnCours, setRejetActifEnCours] = useState(null)
  const [motifRejet, setMotifRejet] = useState('')

  const actifsFiltres = actifs.filter((actif) => {
    if (filtreStatut && actif.statut !== filtreStatut) return false
    if (filtreCategorie && actif.categorieId !== filtreCategorie) return false
    if (filtreEmplacement && actif.emplacementId !== filtreEmplacement) return false
    if (filtreCriticite && actif.criticite !== filtreCriticite) return false
    if (filtreEtatCycleVie && actif.etatCycleVie !== filtreEtatCycleVie) return false
    if (recherche.trim()) {
      const texte = `${actif.nom} ${actif.codeInventaire} ${actif.numeroSerie}`.toLowerCase()
      if (!texte.includes(recherche.trim().toLowerCase())) return false
    }
    return true
  })

  function soumettre(e) {
    e.preventDefault()
    if (!form.nom.trim() || !form.codeInventaire.trim()) return
    onCreer({ ...form, valeur: Number(form.valeur) || 0 })
    setForm({ ...form, nom: '', codeInventaire: '', numeroSerie: '', dateAcquisition: '', dateFinGarantie: '', valeur: '' })
    setOuvert(false)
  }

  async function genererCode() {
    const code = await onGenererCodeInventaire()
    setForm((f) => ({ ...f, codeInventaire: code }))
  }

  async function creerNouveauLocal() {
    if (!nouveauLocal.nom.trim()) return
    const cree = await onCreerEmplacement({ nom: nouveauLocal.nom, type: nouveauLocal.type, parentId: nouveauLocal.parentId || null })
    setForm((f) => ({ ...f, emplacementId: cree.id }))
    setNouveauLocal({ nom: '', type: 'Salle', parentId: emplacements[0]?.id || '' })
    setNouveauLocalOuvert(false)
  }

  function choisirFichier() {
    inputFichierRef.current?.click()
  }

  async function importerFichier(e) {
    const fichier = e.target.files[0]
    if (!fichier) return
    const texte = await fichier.text()
    const lignes = parseCsv(texte)
    if (lignes.length === 0) {
      setMessageImport('Aucune ligne exploitable dans ce fichier.')
      setRejetsImport([])
    } else {
      const { crees, rejetes } = await onImporterCsv(lignes)
      setMessageImport(`${crees.length} actif(s) importé(s), ${rejetes.length} rejeté(s).`)
      setRejetsImport(rejetes)
    }
    e.target.value = ''
  }

  function demanderRejet(id) {
    setRejetActifEnCours(id)
    setMotifRejet('')
  }

  function confirmerRejet(id) {
    onRejeter(id, motifRejet || 'Non motivé')
    setRejetActifEnCours(null)
  }

  return (
    <>
      <div className="page-header">
        <span className="page-eyebrow">Inventaire</span>
        <h1>Actifs</h1>
        <p>Équipements suivis à travers les sites (agences, siège, salles techniques).</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>{actifsFiltres.length} / {actifs.length} actif(s)</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="file" accept=".csv" ref={inputFichierRef} onChange={importerFichier} style={{ display: 'none' }} />
            <button className="btn secondary" onClick={choisirFichier}>Importer un CSV</button>
            <button className="btn" onClick={() => setOuvert(!ouvert)}>{ouvert ? 'Annuler' : '+ Nouvel actif'}</button>
          </div>
        </div>

        {messageImport && (
          <div style={{ padding: '0 20px 12px', fontSize: 12.5 }}>
            <p style={{ color: 'var(--color-muted)', margin: 0 }}>{messageImport}</p>
            {rejetsImport.length > 0 && (
              <ul className="journal-list" style={{ marginTop: 6 }}>
                {rejetsImport.map((r, i) => (
                  <li key={i} style={{ color: 'var(--status-urgent)' }}>Ligne {r.ligne} : {r.motif}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {ouvert && (
          <form className="form-panel" onSubmit={soumettre}>
            <div className="form-field">
              <label>Nom de l'actif</label>
              <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Code inventaire</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input value={form.codeInventaire} onChange={(e) => setForm({ ...form, codeInventaire: e.target.value })} required />
                <button type="button" className="btn secondary" style={{ padding: '5px 10px', fontSize: 12 }} onClick={genererCode}>Générer</button>
              </div>
            </div>
            <div className="form-field">
              <label>N° de série</label>
              <input value={form.numeroSerie} onChange={(e) => setForm({ ...form, numeroSerie: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Emplacement</label>
              <select
                value={form.emplacementId}
                onChange={(e) => {
                  if (e.target.value === '__nouveau__') setNouveauLocalOuvert(true)
                  else setForm({ ...form, emplacementId: e.target.value })
                }}
              >
                {emplacements.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
                <option value="__nouveau__">+ Nouveau local…</option>
              </select>
            </div>
            {nouveauLocalOuvert && (
              <div className="form-field" style={{ gridColumn: '1 / -1', border: '1px dashed var(--color-border)', padding: 10, borderRadius: 6 }}>
                <label>Nouveau local — rattaché à</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <select value={nouveauLocal.parentId} onChange={(e) => setNouveauLocal({ ...nouveauLocal, parentId: e.target.value })}>
                    {emplacements.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
                  </select>
                  <input placeholder="Nom du local" value={nouveauLocal.nom} onChange={(e) => setNouveauLocal({ ...nouveauLocal, nom: e.target.value })} />
                  <input placeholder="Type (ex. Salle)" value={nouveauLocal.type} onChange={(e) => setNouveauLocal({ ...nouveauLocal, type: e.target.value })} style={{ width: 110 }} />
                  <button type="button" className="btn secondary" style={{ padding: '5px 10px', fontSize: 12 }} onClick={creerNouveauLocal}>Créer</button>
                  <button type="button" className="btn secondary" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => setNouveauLocalOuvert(false)}>Annuler</button>
                </div>
              </div>
            )}
            <div className="form-field">
              <label>Catégorie</label>
              <select value={form.categorieId} onChange={(e) => setForm({ ...form, categorieId: e.target.value })}>
                {categoriesActif.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Criticité</label>
              <select value={form.criticite} onChange={(e) => setForm({ ...form, criticite: e.target.value })}>
                {CRITICITES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Date d'acquisition</label>
              <input type="date" value={form.dateAcquisition} onChange={(e) => setForm({ ...form, dateAcquisition: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Fin de garantie</label>
              <input type="date" value={form.dateFinGarantie} onChange={(e) => setForm({ ...form, dateFinGarantie: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Valeur (FCFA)</label>
              <input type="number" value={form.valeur} onChange={(e) => setForm({ ...form, valeur: e.target.value })} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn secondary" onClick={() => setOuvert(false)}>Annuler</button>
              <button type="submit" className="btn">Créer l'actif (Brouillon)</button>
            </div>
          </form>
        )}

        <div className="filters-bar">
          <input
            type="text"
            placeholder="Rechercher un actif, un code, un n° série…"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            style={{ minWidth: 220 }}
          />
          <select value={filtreEtatCycleVie} onChange={(e) => setFiltreEtatCycleVie(e.target.value)}>
            <option value="">Tous les états de cycle de vie</option>
            {ETATS_CYCLE_VIE.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <select value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)}>
            <option value="">Tous les statuts</option>
            {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filtreCriticite} onChange={(e) => setFiltreCriticite(e.target.value)}>
            <option value="">Toutes les criticités</option>
            {CRITICITES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filtreCategorie} onChange={(e) => setFiltreCategorie(e.target.value)}>
            <option value="">Toutes les catégories</option>
            {categoriesActif.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <select value={filtreEmplacement} onChange={(e) => setFiltreEmplacement(e.target.value)}>
            <option value="">Tous les emplacements</option>
            {emplacements.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
          </select>
        </div>

        <table>
          <thead>
            <tr>
              <th>Actif</th>
              <th>Catégorie</th>
              <th>Emplacement</th>
              <th>N° série</th>
              <th>Criticité</th>
              <th>Cycle de vie</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {actifsFiltres.length === 0 && (
              <tr><td colSpan={8} className="empty-state">Aucun actif ne correspond aux filtres.</td></tr>
            )}
            {actifsFiltres.map((actif) => {
              const categorie = categoriesActif.find((c) => c.id === actif.categorieId)
              return (
                <tr key={actif.id}>
                  <td>
                    <button
                      className="link-button"
                      onClick={() => onSelectionner(actif.id)}
                    >
                      {actif.nom}
                    </button>
                    <br />
                    <span style={{ color: 'var(--color-muted)', fontSize: 12 }}>{actif.codeInventaire}</span>
                  </td>
                  <td>{categorie?.nom || '—'}</td>
                  <td><EmplacementChain emplacementId={actif.emplacementId} emplacements={emplacements} /></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{actif.numeroSerie}</td>
                  <td>
                    <span className="badge" style={{
                      color: actif.criticite === 'Critique' ? 'var(--status-urgent)' : 'var(--status-neutre)',
                      background: actif.criticite === 'Critique' ? 'var(--status-urgent-bg)' : 'var(--status-neutre-bg)',
                    }}>
                      {actif.criticite || '—'}
                    </span>
                  </td>
                  <td><StatusBadge statut={actif.etatCycleVie} /></td>
                  <td>
                    <select
                      value={actif.statut}
                      onChange={(e) => onChangerStatut(actif.id, e.target.value)}
                      disabled={actif.etatCycleVie !== 'Actif'}
                      style={{ border: 'none', background: 'transparent', fontSize: 13, cursor: 'pointer' }}
                    >
                      {STATUTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {actif.etatCycleVie === 'Brouillon' && (
                      <button className="btn secondary" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => onSoumettrePourValidation(actif.id)}>
                        Soumettre
                      </button>
                    )}
                    {actif.etatCycleVie === 'En validation' && peutValider(role) && rejetActifEnCours !== actif.id && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => onValider(actif.id)}>Valider</button>
                        <button className="btn secondary" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => demanderRejet(actif.id)}>Rejeter</button>
                      </div>
                    )}
                    {rejetActifEnCours === actif.id && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          placeholder="Motif du rejet"
                          value={motifRejet}
                          onChange={(e) => setMotifRejet(e.target.value)}
                          style={{ fontSize: 12, width: 140 }}
                        />
                        <button className="btn secondary" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => confirmerRejet(actif.id)}>Confirmer</button>
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
