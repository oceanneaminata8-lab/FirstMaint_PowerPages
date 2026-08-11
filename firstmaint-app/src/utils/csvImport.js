// Parseur CSV minimal (sans dépendance) pour l'import initial en masse des actifs
// (US-01, critère d'acceptation 4). Gère les séparateurs ';' ou ',' et une première
// ligne d'en-têtes ; ne gère pas les champs contenant des retours à la ligne.
export function parseCsv(texte) {
  const lignes = texte.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (lignes.length < 2) return []

  const separateur = lignes[0].includes(';') ? ';' : ','
  const entetes = lignes[0].split(separateur).map((h) => h.trim())

  return lignes.slice(1).map((ligne) => {
    const valeurs = ligne.split(separateur).map((v) => v.trim())
    const objet = {}
    entetes.forEach((entete, i) => {
      objet[entete] = valeurs[i] ?? ''
    })
    return objet
  })
}
