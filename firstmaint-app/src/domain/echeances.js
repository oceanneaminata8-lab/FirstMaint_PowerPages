// Helpers d'échéance partagés entre dataService.js (avance à la clôture d'un
// OT préventif) et automationEngine.js (scan des échéances à venir/dépassées).

export function avancerEcheance(dateStr, frequence) {
  const d = new Date(dateStr)
  switch (frequence) {
    case 'Hebdomadaire': d.setDate(d.getDate() + 7); break
    case 'Trimestrielle': d.setMonth(d.getMonth() + 3); break
    case 'Semestrielle': d.setMonth(d.getMonth() + 6); break
    case 'Annuelle': d.setFullYear(d.getFullYear() + 1); break
    case 'Mensuelle':
    default: d.setMonth(d.getMonth() + 1)
  }
  return d.toISOString().slice(0, 10)
}

// Nombre de jours couverts par une période de fréquence (utilisé pour la
// fenêtre de planification ±30 % — US-03, section 3.4, étape 2).
export function joursDeLaPeriode(frequence) {
  switch (frequence) {
    case 'Hebdomadaire': return 7
    case 'Trimestrielle': return 91
    case 'Semestrielle': return 182
    case 'Annuelle': return 365
    case 'Mensuelle':
    default: return 30
  }
}
