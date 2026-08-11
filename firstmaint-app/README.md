# FirstMaint

Application de gestion de maintenance (inspirée d'OpenMaint) pour Afriland First Bank.
Suivi des actifs, ordres de travail et tickets à travers les sites (agences, siège, salles techniques).

## Démarrer le projet

`power.config.json` (identifiants d'environnement Power Platform réels) n'est pas versionné —
copier `power.config.example.json` vers `power.config.json` et renseigner `appId` /
`environmentId` avant de lancer le projet si besoin d'un rebranchement Power Platform.

```bash
npm install
npm run dev
```

L'application démarre sur http://localhost:3000

## État actuel : mode démonstration

Le projet fonctionne actuellement **sans backend réel** : toutes les données,
y compris Actifs / Emplacements / Catégories d'actif / Ordres de travail /
Tickets (qui avaient un début de câblage Dataverse), viennent de
`src/data/mockData.js` et sont manipulées via `src/services/dataService.js`.

Cela permet de développer et tester toute l'interface dès maintenant, même sans
accès à Microsoft Entra ID / Dataverse. Les clients générés dans `src/generated/`
restent en place pour un rebranchement Dataverse ultérieur, mais ne sont plus
appelés par `dataService.js` pour l'instant — lecture et écriture doivent
opérer sur la même source de vérité tant que ce rebranchement n'est pas fait
en bloc pour toutes les entités (le schéma Dataverse actuel ne porte d'ailleurs
pas encore certains champs utilisés ici, ex. `criticite` sur Actif).

## Structure du projet

```
src/
  data/
    mockData.js         → données fictives (imitent les futures tables Dataverse)
  services/
    dataService.js       → SEUL fichier à modifier pour brancher Dataverse plus tard
  components/
    Sidebar.jsx           → navigation latérale
    Dashboard.jsx         → tableau de bord (indicateurs clés)
    ActifsList.jsx        → liste des actifs
    OrdresTravailList.jsx → liste + création des ordres de travail
    TicketsList.jsx       → liste + création des tickets
    StatusBadge.jsx        → badges de statut/priorité colorés
    EmplacementChain.jsx   → fil d'ariane hiérarchique (Agence > Étage > Salle)
  App.jsx                 → assemble tout, charge les données au démarrage
  App.css                  → tokens de design (couleurs, typographie, layout)
```

## Prochaine étape : brancher Dataverse

Quand tu auras accès à Microsoft Entra ID :

1. Installer MSAL : `npm install @azure/msal-browser @azure/msal-react axios`
2. Enregistrer l'application dans Entra ID et récupérer le Client ID / Tenant ID
3. Configurer MSAL (fichier `authConfig.js` à créer) et englober `<App />` dans `<MsalProvider>`
4. Dans `src/services/dataService.js`, remplacer l'intérieur de chaque fonction
   (ex: `getActifs`) par un appel `axios.get(...)` vers l'API Web de Dataverse,
   avec le token MSAL en en-tête `Authorization`.

Aucun composant de l'interface n'aura besoin d'être modifié — seule la couche
de service change.

## Correspondance avec les tables Dataverse prévues

| Fichier mock         | Table Dataverse (à créer) |
|-----------------------|----------------------------|
| `emplacements`        | Emplacement                |
| `categoriesActif`     | Categorie d'actif           |
| `actifs`              | Actif                       |
| `ordresTravail`       | Ordre de travail             |
| `tickets`             | Ticket                       |
