import { Fragment, useMemo, useState } from 'react'
import { Icon } from './Icons.jsx'

const QUICK_ITEMS = [
  { key: 'dashboard', label: 'Tableau de bord', icone: 'dashboard' },
]

// Arborescence calquée sur la structure OpenMaint (Facilities and assets, Basic
// archives, Maintenance management, etc.) : les groupes sans page encore
// construite s'affichent en placeholder « à venir » plutôt que de disparaître,
// pour que la structure cible reste visible pendant qu'on la construit.
const NAV_GROUPS = [
  {
    key: 'installations',
    label: 'Installations et actifs',
    items: [
      { key: 'actifs', label: 'Actifs', icone: 'actifs' },
      { key: 'emplacements', label: 'Emplacements', icone: 'emplacements' },
    ],
  },
  {
    key: 'archives',
    label: 'Archives de base',
    items: [
      { key: 'categoriesActifs', label: 'Catégories d\'actifs', icone: 'actifs' },
    ],
  },
  {
    key: 'maintenance',
    label: 'Gestion de la maintenance',
    items: [
      { key: 'ordresTravail', label: 'Ordres de travail', icone: 'ordres' },
      { key: 'tickets', label: 'Tickets', icone: 'tickets' },
      { key: 'maintenancePreventive', label: 'Maintenance préventive', icone: 'preventive' },
    ],
  },
  {
    key: 'financier',
    label: 'Direction financière',
    items: [
      { key: 'fournisseurs', label: 'Fournisseurs & Contrats', icone: 'fournisseurs' },
    ],
  },
  {
    key: 'logistique',
    label: 'Gestion de la logistique',
    items: [
      { key: 'piecesRechange', label: 'Pièces de rechange', icone: 'stock' },
    ],
  },
  {
    key: 'energie',
    label: 'Gestion de l\'énergie',
    items: [
      { key: 'consommationEnergie', label: 'Relevés de consommation', icone: 'energie' },
    ],
  },
  {
    key: 'configurations',
    label: 'Configurations',
    items: [
      { key: 'utilisateurs', label: 'Utilisateurs & rôles', icone: 'utilisateurs' },
    ],
  },
  {
    key: 'afriland',
    label: 'Modules Afriland',
    items: [
      { key: 'afrilandDashboard', label: 'Tableau de bord Afriland', icone: 'dashboard' },
      { key: 'slaReglesMesures', label: 'Règles & Mesures SLA', icone: 'preventive' },
      { key: 'slaPenalites', label: 'Pénalités & Paiements', icone: 'alerte' },
      { key: 'evaluationsPrestataires', label: 'Évaluations prestataires', icone: 'fournisseurs' },
      { key: 'clesAcces', label: 'Clés & Accès', icone: 'emplacements' },
      { key: 'projetsImmobiliers', label: 'Projets immobiliers', icone: 'ordres' },
      { key: 'tachesAlertes', label: 'Tâches & Alertes', icone: 'tickets' },
    ],
  },
]

function groupeDeLActif(active) {
  return NAV_GROUPS.find((g) => g.items.some((i) => i.key === active))?.key || null
}

// Affichage différencié par profil (cahier des charges, US-06 + section IV) :
// chaque rôle ne voit que les écrans pertinents à sa mission. Une valeur absente
// de cette table (ex. Gestionnaire DMG) garde l'accès complet par défaut.
const CLES_PAR_ROLE = {
  'Technicien': ['dashboard', 'ordresTravail', 'tickets', 'piecesRechange'],
  'Prestataire': ['dashboard', 'ordresTravail', 'tickets', 'piecesRechange'],
  'Technicien / Prestataire': ['dashboard', 'ordresTravail', 'tickets', 'piecesRechange'],
  'Responsable de site': ['dashboard', 'actifs', 'emplacements', 'ordresTravail', 'tickets', 'maintenancePreventive', 'clesAcces', 'piecesRechange', 'consommationEnergie'],
  'Responsable DMG': ['dashboard', 'afrilandDashboard', 'actifs', 'emplacements', 'fournisseurs', 'evaluationsPrestataires', 'projetsImmobiliers', 'tachesAlertes', 'consommationEnergie'],
  // Opérateur DMG (workflows v2.0) : saisie déportée des comptes-rendus prestataires.
  'Opérateur DMG': ['dashboard', 'ordresTravail', 'maintenancePreventive', 'tickets'],
}

function filtrerParRole(groups, role) {
  const clesAutorisees = CLES_PAR_ROLE[role]
  if (!clesAutorisees) return groups
  return groups
    .map((g) => ({ ...g, items: g.items.filter((i) => clesAutorisees.includes(i.key)) }))
    .filter((g) => g.items.length > 0)
}

export function Sidebar({ active, onChange, role }) {
  const [recherche, setRecherche] = useState('')
  const [ouverteMobile, setOuverteMobile] = useState(false)
  const [groupesOuverts, setGroupesOuverts] = useState(() => {
    const initial = groupeDeLActif(active)
    return new Set(initial ? [initial] : [])
  })

  const groupesDuRole = useMemo(() => filtrerParRole(NAV_GROUPS, role), [role])

  function toggleGroupe(cle) {
    setGroupesOuverts((prev) => {
      const suivant = new Set(prev)
      if (suivant.has(cle)) suivant.delete(cle)
      else suivant.add(cle)
      return suivant
    })
  }

  function naviguerVers(cle) {
    onChange(cle)
    setOuverteMobile(false)
  }

  const rechercheActive = recherche.trim().length > 0

  const groupesAffiches = useMemo(() => {
    if (!rechercheActive) return groupesDuRole
    const q = recherche.trim().toLowerCase()
    return groupesDuRole
      .map((g) => ({ ...g, items: g.items.filter((i) => i.label.toLowerCase().includes(q)) }))
      .filter((g) => g.items.length > 0)
  }, [recherche, rechercheActive, groupesDuRole])

  return (
    <Fragment>
      <button
        className="sidebar-toggle"
        onClick={() => setOuverteMobile((v) => !v)}
        aria-label={ouverteMobile ? 'Fermer le menu' : 'Ouvrir le menu'}
      >
        <Icon type={ouverteMobile ? 'close' : 'menu'} />
      </button>

      {ouverteMobile && <div className="sidebar-overlay" onClick={() => setOuverteMobile(false)} />}

      <aside className={`sidebar ${ouverteMobile ? 'open' : ''}`}>
        <div className="sidebar-search">
          <Icon type="search" />
          <input
            type="text"
            placeholder="Chercher…"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
          {rechercheActive && (
            <button className="sidebar-search-clear" onClick={() => setRecherche('')} aria-label="Effacer la recherche">✕</button>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-group">
            {QUICK_ITEMS.map((item) => (
              <button
                key={item.key}
                className={active === item.key ? 'active' : ''}
                onClick={() => naviguerVers(item.key)}
              >
                <span className="nav-icon"><Icon type={item.icone} /></span>
                {item.label}
              </button>
            ))}
          </div>

          {groupesAffiches.map((group) => {
            const ouvert = rechercheActive || groupesOuverts.has(group.key) || group.items.some((i) => i.key === active)
            return (
              <div className="sidebar-nav-group" key={group.key}>
                <button className={`sidebar-group-toggle ${ouvert ? 'open' : ''}`} onClick={() => toggleGroupe(group.key)}>
                  <span className="nav-icon"><Icon type="chevron" /></span>
                  <span className="nav-icon"><Icon type="folder" /></span>
                  {group.label}
                </button>
                {ouvert && (
                  group.items.length === 0 ? (
                    <div className="sidebar-group-empty">Bientôt disponible</div>
                  ) : (
                    group.items.map((item) => (
                      <button
                        key={item.key}
                        className={`sidebar-subitem ${active === item.key ? 'active' : ''}`}
                        onClick={() => naviguerVers(item.key)}
                      >
                        <span className="nav-icon"><Icon type={item.icone} /></span>
                        {item.label}
                      </button>
                    ))
                  )
                )}
              </div>
            )
          })}
        </nav>
      </aside>
    </Fragment>
  )
}
