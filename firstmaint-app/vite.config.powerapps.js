// Config Vite dédiée au déploiement Power Apps Code App (pac code push).
// Séparée de vite.config.js (Power Pages, inchangé) pour que les deux cibles
// coexistent sans interférence : sortie distincte (dist-powerapps/), plugin
// Power Apps additionnel, et un alias qui redirige uniquement les imports de
// dataService.js vers la variante Power Apps (Web API Dataverse générée),
// sans toucher un seul fichier de composant existant.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { powerApps } from '@microsoft/power-apps-vite/plugin'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), powerApps()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: [
      {
        // Ancré sur toute la chaîne (pas seulement le suffixe) : l'alias Vite
        // fait un regex.replace() sur le spécificateur complet, donc une
        // regex non ancrée au début ne remplacerait que le sous-texte
        // correspondant et laisserait le préfixe relatif ("./services")
        // concaténé devant le chemin absolu de remplacement.
        find: /^.*\/dataClient(\.js)?$/,
        replacement: path.resolve(__dirname, 'src/services/dataService.powerapps.js'),
      },
    ],
  },
  build: {
    outDir: 'dist-powerapps',
    assetsInlineLimit: 0,
  },
})
