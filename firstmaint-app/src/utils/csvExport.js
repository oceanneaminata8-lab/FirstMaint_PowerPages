// Export CSV générique (ouvrable dans Excel) — pas de dépendance externe.
// US-06 : "export des rapports et tableaux de bord (PDF, Excel)".
export function exportToCsv(nomFichier, lignes) {
  if (!lignes || lignes.length === 0) return

  const entetes = Object.keys(lignes[0])
  const echapper = (valeur) => {
    const texte = valeur === null || valeur === undefined ? '' : String(valeur)
    return /[",;\n]/.test(texte) ? `"${texte.replace(/"/g, '""')}"` : texte
  }

  const contenu = [
    entetes.join(';'),
    ...lignes.map((ligne) => entetes.map((cle) => echapper(ligne[cle])).join(';')),
  ].join('\n')

  const blob = new Blob(['﻿' + contenu], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const lien = document.createElement('a')
  lien.href = url
  lien.download = nomFichier.endsWith('.csv') ? nomFichier : `${nomFichier}.csv`
  document.body.appendChild(lien)
  lien.click()
  document.body.removeChild(lien)
  URL.revokeObjectURL(url)
}
