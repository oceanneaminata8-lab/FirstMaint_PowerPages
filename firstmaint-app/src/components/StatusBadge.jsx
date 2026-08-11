// Associe chaque statut métier (Actif, Ordre de travail, Ticket) à une couleur cohérente.
const STATUS_MAP = {
  // Actifs — statut opérationnel
  'En service': 'succes',
  'En panne': 'urgent',
  'En maintenance': 'attention',
  'Retiré': 'neutre',
  // Actifs — cycle de vie de la fiche (US-01)
  'Brouillon': 'neutre',
  'En validation': 'attention',
  'Actif': 'succes',
  'En retrait': 'attention',
  // Ordres de travail (US-02, machine à 9 états)
  'Nouveau': 'info',
  'En qualification': 'info',
  'Affecté': 'attention',
  'Assigné': 'attention',
  'En cours': 'attention',
  'En attente de pièce': 'attention',
  'En escalade': 'urgent',
  'Résolu': 'succes',
  'Clôturé': 'succes',
  'Terminé': 'succes',
  'Rejeté': 'neutre',
  'Annulé': 'neutre',
  // Tickets
  'Ouvert': 'info',
  'En traitement': 'attention',
  'Fermé': 'neutre',
}

const PRIORITY_MAP = {
  'Basse': 'neutre',
  'Moyenne': 'info',
  'Haute': 'attention',
  'Critique': 'urgent',
}

function badgeStyle(tone) {
  return {
    color: `var(--status-${tone})`,
    background: `var(--status-${tone}-bg)`,
  }
}

export function StatusBadge({ statut }) {
  const tone = STATUS_MAP[statut] || 'neutre'
  return <span className="badge" style={badgeStyle(tone)}>{statut}</span>
}

export function PriorityBadge({ priorite }) {
  const tone = PRIORITY_MAP[priorite] || 'neutre'
  return <span className="badge" style={badgeStyle(tone)}>{priorite}</span>
}
