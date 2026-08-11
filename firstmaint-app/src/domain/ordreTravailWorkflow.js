// ============================================================================
// Machine à états d'un ordre de travail correctif — cahier des charges US-02,
// section 2.2. Neuf statuts, transitions explicitement autorisées ci-dessous.
// Les OT préventifs réutilisent le même cycle à partir de "Affecté" (pas de
// qualification, l'affectation vient du plan de maintenance — US-03, 3.4).
// ============================================================================

export const STATUTS_ORDRE_TRAVAIL = [
  'Nouveau',
  'En qualification',
  'Affecté',
  'En cours',
  'En attente de pièce',
  'En escalade',
  'Résolu',
  'Clôturé',
  'Rejeté',
]

const TRANSITIONS_AUTORISEES = {
  Nouveau: ['En qualification', 'Rejeté'],
  'En qualification': ['Affecté', 'Rejeté', 'Nouveau'], // 'Nouveau' = retour "en attente d'information"
  Affecté: ['En cours', 'Nouveau'], // refus du prestataire -> retour à Nouveau pour ré-affectation
  'En cours': ['En attente de pièce', 'Résolu', 'En escalade'],
  'En attente de pièce': ['En cours', 'Résolu'],
  'En escalade': ['En cours', 'Résolu'],
  Résolu: ['Clôturé', 'En cours'], // refus de clôture par le responsable de site -> retour En cours
  Clôturé: [],
  Rejeté: [],
}

export function transitionAutorisee(de, vers) {
  if (de === vers) return true
  return (TRANSITIONS_AUTORISEES[de] || []).includes(vers)
}
