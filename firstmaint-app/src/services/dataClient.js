// Point d'entrée unique utilisé par App.jsx — réexporte dataService.js tel
// quel. Seul ce fichier est aliasé vers dataService.powerapps.js dans
// vite.config.powerapps.js ; dataService.js lui-même n'est jamais touché,
// donc le build Power Pages (vite.config.js par défaut) est strictement
// inchangé.
export * from './dataService.js'
