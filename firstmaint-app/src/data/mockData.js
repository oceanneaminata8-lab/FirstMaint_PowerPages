// Données fictives (mock) — les noms de champs imitent volontairement
// les futures colonnes Dataverse pour faciliter le branchement plus tard.

// Profils utilisateur (cahier des charges, section IV — un profil = un jeu d'écrans visibles).
// "Opérateur DMG" (workflows v2.0, US-02/US-03) : saisie déportée des comptes-rendus
// prestataires sur poste fixe quand ce dernier n'a pas d'accès direct à l'application.
export const ROLES = ['Gestionnaire DMG', 'Responsable de site', 'Technicien / Prestataire', 'Responsable DMG', 'Opérateur DMG']

// Seuil au-delà duquel une validation de paiement exige deux valideurs distincts.
export const SEUIL_DOUBLE_VALIDATION = 500000

// Hiérarchie patrimoniale : Siège Social (Yaoundé) > Agences (une par grande
// ville, couvrant les 10 régions du Cameroun) > Étages > Salles. Les identifiants
// emp-1 à emp-8 sont conservés tels quels (référencés par actifs/tickets/clés/
// projets/énergie ci-dessous) ; seuls leurs libellés et rattachements ont été
// précisés pour refléter des sites réels.
export const emplacements = [
  // ---- Siège Social — Yaoundé (Centre) --------------------------------------
  { id: 'emp-1', nom: 'Siège Social Yaoundé — Boulevard de la Liberté', type: 'Siège', parentId: null },
  { id: 'emp-6', nom: 'Étage 1 — Direction Générale', type: 'Étage', parentId: 'emp-1' },
  { id: 'emp-7', nom: 'Salle informatique — Datacenter Siège', type: 'Salle', parentId: 'emp-6' },
  { id: 'emp-9', nom: 'Étage 2 — Direction des Systèmes d\'Information', type: 'Étage', parentId: 'emp-1' },
  { id: 'emp-10', nom: 'Rez-de-chaussée — Hall d\'accueil Siège', type: 'Étage', parentId: 'emp-1' },

  // ---- Agences — Littoral -----------------------------------------------------
  { id: 'emp-2', nom: 'Agence Douala Akwa', type: 'Agence', parentId: 'emp-1' },
  { id: 'emp-3', nom: 'Étage 2', type: 'Étage', parentId: 'emp-2' },
  { id: 'emp-4', nom: 'Salle serveur', type: 'Salle', parentId: 'emp-3' },
  { id: 'emp-11', nom: 'Agence Douala Bonanjo', type: 'Agence', parentId: 'emp-1' },
  { id: 'emp-12', nom: 'Étage 1', type: 'Étage', parentId: 'emp-11' },
  { id: 'emp-13', nom: 'Salle technique', type: 'Salle', parentId: 'emp-12' },

  // ---- Agences — Centre (hors siège) -------------------------------------------
  { id: 'emp-5', nom: 'Agence Yaoundé Centre', type: 'Agence', parentId: 'emp-1' },
  { id: 'emp-8', nom: 'Rez-de-chaussée', type: 'Étage', parentId: 'emp-5' },
  { id: 'emp-14', nom: 'Agence Yaoundé Bastos', type: 'Agence', parentId: 'emp-1' },
  { id: 'emp-15', nom: 'Étage 1', type: 'Étage', parentId: 'emp-14' },
  { id: 'emp-16', nom: 'Salle technique', type: 'Salle', parentId: 'emp-15' },

  // ---- Agences — Ouest ----------------------------------------------------------
  { id: 'emp-17', nom: 'Agence Bafoussam', type: 'Agence', parentId: 'emp-1' },
  { id: 'emp-18', nom: 'Étage 1', type: 'Étage', parentId: 'emp-17' },
  { id: 'emp-19', nom: 'Salle serveur', type: 'Salle', parentId: 'emp-18' },

  // ---- Agences — Nord-Ouest -------------------------------------------------------
  { id: 'emp-20', nom: 'Agence Bamenda', type: 'Agence', parentId: 'emp-1' },
  { id: 'emp-21', nom: 'Étage 1', type: 'Étage', parentId: 'emp-20' },
  { id: 'emp-22', nom: 'Salle technique', type: 'Salle', parentId: 'emp-21' },

  // ---- Agences — Sud-Ouest --------------------------------------------------------
  { id: 'emp-23', nom: 'Agence Buea', type: 'Agence', parentId: 'emp-1' },
  { id: 'emp-24', nom: 'Rez-de-chaussée', type: 'Étage', parentId: 'emp-23' },
  { id: 'emp-25', nom: 'Salle serveur', type: 'Salle', parentId: 'emp-24' },

  // ---- Agences — Extrême-Nord -------------------------------------------------------
  { id: 'emp-26', nom: 'Agence Maroua', type: 'Agence', parentId: 'emp-1' },
  { id: 'emp-27', nom: 'Étage 1', type: 'Étage', parentId: 'emp-26' },
  { id: 'emp-28', nom: 'Salle technique', type: 'Salle', parentId: 'emp-27' },

  // ---- Agences — Nord ----------------------------------------------------------------
  { id: 'emp-29', nom: 'Agence Garoua', type: 'Agence', parentId: 'emp-1' },
  { id: 'emp-30', nom: 'Étage 1', type: 'Étage', parentId: 'emp-29' },
  { id: 'emp-31', nom: 'Salle serveur', type: 'Salle', parentId: 'emp-30' },

  // ---- Agences — Adamaoua -----------------------------------------------------------
  { id: 'emp-32', nom: 'Agence Ngaoundéré', type: 'Agence', parentId: 'emp-1' },
  { id: 'emp-33', nom: 'Rez-de-chaussée', type: 'Étage', parentId: 'emp-32' },

  // ---- Agences — Sud ------------------------------------------------------------------
  { id: 'emp-34', nom: 'Agence Kribi', type: 'Agence', parentId: 'emp-1' },
  { id: 'emp-35', nom: 'Étage 1', type: 'Étage', parentId: 'emp-34' },

  // ---- Agences — Est -------------------------------------------------------------------
  { id: 'emp-36', nom: 'Agence Bertoua', type: 'Agence', parentId: 'emp-1' },
  { id: 'emp-37', nom: 'Étage 1', type: 'Étage', parentId: 'emp-36' },
]

// Familles d'équipement (workflows v2.0, principe directeur 2 — structuration par
// famille) : chaque famille porte des caractéristiques par défaut (criticité,
// fréquence préventive, prestataire habituel, mode opératoire). Une fiche actif
// hérite de ces valeurs à la création et peut les surcharger au cas par cas.
export const categoriesActif = [
  {
    id: 'cat-1', nom: 'Informatique', description: 'Serveurs, postes de travail, réseau',
    criticiteParDefaut: 'Moyenne', frequencePreventiveParDefaut: 'Trimestrielle',
    prestataireParDefautId: null, modeOperatoireParDefaut: 'Contrôle des sauvegardes et des journaux système.',
  },
  {
    id: 'cat-2', nom: 'Climatisation', description: 'Systèmes CVC',
    criticiteParDefaut: 'Critique', frequencePreventiveParDefaut: 'Trimestrielle',
    prestataireParDefautId: 'frs-1', modeOperatoireParDefaut: 'Nettoyage des filtres, contrôle du gaz réfrigérant.',
  },
  {
    id: 'cat-3', nom: 'Groupe électrogène', description: 'Alimentation de secours',
    criticiteParDefaut: 'Haute', frequencePreventiveParDefaut: 'Mensuelle',
    prestataireParDefautId: 'frs-2', modeOperatoireParDefaut: 'Vidange, contrôle des niveaux, test de démarrage à vide.',
  },
  {
    id: 'cat-4', nom: 'Sécurité', description: 'Caméras, contrôle d\'accès, alarmes',
    criticiteParDefaut: 'Moyenne', frequencePreventiveParDefaut: 'Semestrielle',
    prestataireParDefautId: 'frs-3', modeOperatoireParDefaut: 'Contrôle du fonctionnement et de l\'enregistrement.',
  },
]

// Cycle de vie d'une fiche actif (workflows v2.0, section 1.2) : En saisie ->
// Actif -> En retrait -> Retiré. Plus d'étape de validation hiérarchique à la
// création (activation directe par le Gestionnaire DMG). Les 4 actifs de
// démonstration ci-dessous démarrent tous "Actif" (déjà en exploitation).
export const actifs = [
  {
    id: 'act-1',
    nom: 'Serveur principal DB01',
    codeInventaire: 'INV-2024-0031',
    numeroSerie: 'SN-88213X',
    statut: 'En service',
    etatCycleVie: 'Actif',
    motifRejet: null,
    validePar: 'Sarah Ngo',
    dateValidation: '2022-03-10',
    emplacementId: 'emp-4',
    categorieId: 'cat-1',
    criticite: 'Critique',
    dateAcquisition: '2022-03-15',
    dateFinGarantie: '2026-03-15',
    valeur: 4200000,
    piecesJointes: [],
  },
  {
    id: 'act-2',
    nom: 'Climatiseur Salle serveur',
    codeInventaire: 'INV-2023-0117',
    numeroSerie: 'SN-77410C',
    statut: 'En panne',
    etatCycleVie: 'Actif',
    motifRejet: null,
    validePar: 'Sarah Ngo',
    dateValidation: '2021-10-28',
    emplacementId: 'emp-4',
    categorieId: 'cat-2',
    criticite: 'Critique',
    dateAcquisition: '2021-11-02',
    dateFinGarantie: '2024-11-02',
    valeur: 950000,
    piecesJointes: [],
  },
  {
    id: 'act-3',
    nom: 'Groupe électrogène 60kVA',
    codeInventaire: 'INV-2022-0004',
    numeroSerie: 'SN-30021G',
    statut: 'En maintenance',
    etatCycleVie: 'Actif',
    motifRejet: null,
    validePar: 'Sarah Ngo',
    dateValidation: '2020-06-15',
    emplacementId: 'emp-2',
    categorieId: 'cat-3',
    criticite: 'Haute',
    dateAcquisition: '2020-06-20',
    dateFinGarantie: '2025-06-20',
    valeur: 6800000,
    piecesJointes: [],
  },
  {
    id: 'act-4',
    nom: 'Caméra hall d\'accueil',
    codeInventaire: 'INV-2024-0088',
    numeroSerie: 'SN-19934K',
    statut: 'En service',
    etatCycleVie: 'Actif',
    motifRejet: null,
    validePar: 'Sarah Ngo',
    dateValidation: '2024-01-08',
    emplacementId: 'emp-5',
    categorieId: 'cat-4',
    criticite: 'Moyenne',
    dateAcquisition: '2024-01-10',
    dateFinGarantie: '2027-01-10',
    valeur: 210000,
    piecesJointes: [],
  },
]

// Demandes de modification "critique" sur une fiche actif (workflows v2.0,
// section 1.4) : criticité / statut de cycle de vie / valeur d'acquisition —
// nécessitent la validation du Responsable DMG (validateur unique) avant
// application. Les autres modifications ("courantes") sont auto-approuvées.
export const demandesModificationActif = []

// Statuts possibles d'un OT (US-02, section 2.2, machine à 9 états) :
// Nouveau -> En qualification -> Affecté -> En cours -> [En attente de pièce |
// En escalade] -> Résolu -> Clôturé, avec Rejeté en sortie précoce. Voir
// src/domain/ordreTravailWorkflow.js pour la table des transitions autorisées.
export const ordresTravail = [
  {
    id: 'ot-1',
    numero: 'CORR-1',
    titre: 'Remplacer le compresseur du climatiseur',
    description: 'Le climatiseur de la salle serveur ne refroidit plus correctement.',
    statut: 'En cours',
    priorite: 'Critique',
    origine: 'Corrective',
    planPreventifId: null,
    otPreventifSourceId: null,
    actifId: 'act-2',
    technicien: 'Jean Mballa',
    dateOuverture: '2026-07-28',
    dateEcheance: '2026-08-04',
    dateAccuseReception: '2026-07-28',
    dateDebutIntervention: '2026-07-29',
    dateResolution: null,
    dateCloture: null,
    checklist: [],
    compteRendu: null,
    piecesJointes: [],
  },
  {
    id: 'ot-2',
    numero: 'PREV-1',
    titre: 'Maintenance préventive groupe électrogène',
    description: 'Vidange et contrôle mensuel du groupe électrogène.',
    statut: 'Affecté',
    priorite: 'Moyenne',
    origine: 'Préventif',
    planPreventifId: 'pm-1',
    otPreventifSourceId: null,
    actifId: 'act-3',
    technicien: 'Paul Etoundi',
    dateOuverture: '2026-08-01',
    dateEcheance: '2026-08-06',
    dateInterventionProposee: null,
    dateInterventionValidee: null,
    dateAccuseReception: null,
    dateDebutIntervention: null,
    dateResolution: null,
    dateCloture: null,
    checklist: [
      { id: 'ck-1', libelle: 'Contrôle du niveau d\'huile', obligatoire: true, coche: false },
      { id: 'ck-2', libelle: 'Test de démarrage à vide', obligatoire: true, coche: false },
      { id: 'ck-3', libelle: 'Vérification des filtres à air', obligatoire: false, coche: false },
    ],
    compteRendu: null,
    piecesJointes: [],
  },
  {
    id: 'ot-3',
    numero: 'CORR-2',
    titre: 'Mise à jour firmware serveur DB01',
    description: 'Application du dernier correctif de sécurité.',
    statut: 'Clôturé',
    priorite: 'Basse',
    origine: 'Corrective',
    planPreventifId: null,
    otPreventifSourceId: null,
    actifId: 'act-1',
    technicien: 'Sarah Ngo',
    dateOuverture: '2026-07-15',
    dateEcheance: '2026-07-20',
    dateAccuseReception: '2026-07-15',
    dateDebutIntervention: '2026-07-16',
    dateResolution: '2026-07-17',
    dateCloture: '2026-07-18',
    checklist: [],
    compteRendu: {
      causeIdentifiee: 'Correctif de sécurité manquant.',
      actionsRealisees: 'Application du correctif KB-2026-118.',
      piecesUtilisees: '—',
      dureeHeures: 2,
      coutReel: 0,
      photoAvant: null,
      photoApres: null,
      mesures: [],
      preconisations: '',
    },
    piecesJointes: [
      { id: 'pj-1', nomFichier: 'rapport-firmware-db01.pdf', dateAjout: '2026-07-18' },
    ],
  },
]

// Journal des changements de statut des ordres de travail (historique d'audit).
export const historiqueOrdreTravail = [
  { id: 'hist-1', ordreTravailId: 'ot-1', statut: 'Nouveau', date: '2026-07-28', auteur: 'Système' },
  { id: 'hist-2', ordreTravailId: 'ot-1', statut: 'Affecté', date: '2026-07-28', auteur: 'Jean Mballa' },
  { id: 'hist-3', ordreTravailId: 'ot-1', statut: 'En cours', date: '2026-07-29', auteur: 'Jean Mballa' },
  { id: 'hist-4', ordreTravailId: 'ot-2', statut: 'Nouveau', date: '2026-08-01', auteur: 'Système' },
  { id: 'hist-5', ordreTravailId: 'ot-2', statut: 'Affecté', date: '2026-08-01', auteur: 'Paul Etoundi' },
  { id: 'hist-6', ordreTravailId: 'ot-3', statut: 'Nouveau', date: '2026-07-15', auteur: 'Système' },
  { id: 'hist-7', ordreTravailId: 'ot-3', statut: 'Affecté', date: '2026-07-15', auteur: 'Sarah Ngo' },
  { id: 'hist-8', ordreTravailId: 'ot-3', statut: 'En cours', date: '2026-07-16', auteur: 'Sarah Ngo' },
  { id: 'hist-8b', ordreTravailId: 'ot-3', statut: 'Résolu', date: '2026-07-17', auteur: 'Sarah Ngo' },
  { id: 'hist-9', ordreTravailId: 'ot-3', statut: 'Clôturé', date: '2026-07-18', auteur: 'Sarah Ngo' },
]

export const tickets = [
  {
    id: 'tk-1',
    titre: 'Bruit anormal sur le climatiseur',
    description: 'Un bruit métallique se fait entendre depuis ce matin.',
    statut: 'Résolu',
    emplacementId: 'emp-4',
    actifId: 'act-2',
    demandeur: 'Alice Fouda',
    ordreTravailId: 'ot-1',
    piecesJointes: [],
  },
  {
    id: 'tk-2',
    titre: 'Caméra hors ligne',
    description: 'La caméra du hall d\'accueil n\'apparaît plus sur le moniteur.',
    statut: 'Ouvert',
    emplacementId: 'emp-5',
    actifId: 'act-4',
    demandeur: 'Marc Owona',
    ordreTravailId: null,
    piecesJointes: [],
  },
  {
    id: 'tk-3',
    titre: 'Demande de vérification du groupe électrogène',
    description: 'Vérification demandée avant la saison des pluies.',
    statut: 'En traitement',
    emplacementId: 'emp-2',
    actifId: 'act-3',
    demandeur: 'Chef d\'agence Douala',
    ordreTravailId: 'ot-2',
    piecesJointes: [],
  },
]

// ---- Maintenance préventive --------------------------------------------------
// Un plan est un modèle (type, checklist, fréquence) — cahier des charges US-03,
// section 3.2. Les échéances réelles par actif vivent séparément dans
// `echeancesPlan` (une ligne par actif couvert), pour permettre l'étalement
// des dates quand un plan cible une catégorie entière (évite le pic d'OT).
export const plansPreventifs = [
  {
    id: 'pm-1',
    nom: 'Entretien mensuel groupe électrogène',
    description: 'Vidange, contrôle des niveaux, test de démarrage à vide.',
    type: 'Calendaire',
    frequence: 'Mensuelle',
    etatCycleVie: 'Actif',
    checklist: [
      { id: 'ck-1', libelle: 'Contrôle du niveau d\'huile', obligatoire: true },
      { id: 'ck-2', libelle: 'Test de démarrage à vide', obligatoire: true },
      { id: 'ck-3', libelle: 'Vérification des filtres à air', obligatoire: false },
    ],
    dureeEstimee: 2,
    coutEstime: 45000,
    prestataireParDefautId: 'frs-2',
    piecesJointes: [],
    actifId: 'act-3',
    categorieId: null,
  },
  {
    id: 'pm-2',
    nom: 'Contrôle trimestriel climatisation',
    description: 'Nettoyage des filtres, contrôle du gaz réfrigérant.',
    type: 'Calendaire',
    frequence: 'Trimestrielle',
    etatCycleVie: 'Actif',
    checklist: [
      { id: 'ck-4', libelle: 'Nettoyage des filtres', obligatoire: true },
      { id: 'ck-5', libelle: 'Contrôle du gaz réfrigérant', obligatoire: true },
    ],
    dureeEstimee: 1.5,
    coutEstime: 30000,
    prestataireParDefautId: 'frs-1',
    piecesJointes: [],
    actifId: null,
    categorieId: 'cat-2',
  },
  {
    id: 'pm-3',
    nom: 'Vérification sauvegardes serveur DB01',
    description: 'Contrôle de l\'intégrité des sauvegardes et des journaux système.',
    type: 'Calendaire',
    frequence: 'Hebdomadaire',
    etatCycleVie: 'Actif',
    checklist: [
      { id: 'ck-6', libelle: 'Vérification de l\'intégrité des sauvegardes', obligatoire: true },
      { id: 'ck-7', libelle: 'Contrôle des journaux système', obligatoire: true },
    ],
    dureeEstimee: 0.5,
    coutEstime: 0,
    prestataireParDefautId: null,
    piecesJointes: [],
    actifId: 'act-1',
    categorieId: null,
  },
]

// Échéance par actif couvert par un plan (US-03, point d'attention 3.6 : éviter
// le pic d'OT en étalant les dates quand un plan couvre plusieurs actifs).
export const echeancesPlan = [
  { id: 'ech-1', planPreventifId: 'pm-1', actifId: 'act-3', prochaineEcheance: '2026-09-01' },
  { id: 'ech-2', planPreventifId: 'pm-2', actifId: 'act-2', prochaineEcheance: '2026-10-15' },
  { id: 'ech-3', planPreventifId: 'pm-3', actifId: 'act-1', prochaineEcheance: '2026-08-10' },
]

// Fiches d'analyse post-incident, générées automatiquement à la clôture d'un OT
// correctif sur un actif de criticité Critique (US-02, étape 6).
export const fichesAnalysePostIncident = []

// Envois simulés du rapport mensuel préventif au Responsable DMG (workflows
// v2.0, section 3.6) — un seul enregistrement par mois pour rester idempotent.
export const rapportsMensuels = []

// ---- Fournisseurs et contrats -------------------------------------------------
export const fournisseurs = [
  {
    id: 'frs-1',
    nom: 'CoolTech Cameroun',
    contact: 'Serge Biya',
    telephone: '+237 677 12 34 56',
    email: 'contact@cooltech.cm',
    specialite: 'Climatisation',
    rccm: 'RC/DLA/2015/B/1234',
    statutPrestataire: 'Actif',
  },
  {
    id: 'frs-2',
    nom: 'PowerGen Services',
    contact: 'Nadège Ateba',
    telephone: '+237 699 88 77 66',
    email: 'support@powergen.cm',
    specialite: 'Groupes électrogènes',
    rccm: 'RC/YAO/2012/B/0587',
    statutPrestataire: 'Actif',
  },
  {
    id: 'frs-3',
    nom: 'SecuriCam Sarl',
    contact: 'Hervé Nkoulou',
    telephone: '+237 655 44 33 22',
    email: 'info@securicam.cm',
    specialite: 'Sécurité / Vidéosurveillance',
    rccm: 'RC/DLA/2018/B/2231',
    statutPrestataire: 'Actif',
  },
]

export const contrats = [
  {
    id: 'ctr-1',
    fournisseurId: 'frs-1',
    type: 'Maintenance',
    objet: 'Maintenance corrective et préventive des systèmes de climatisation.',
    valeur: 4200000,
    dateDebut: '2025-01-01',
    dateFin: '2026-12-31',
    statut: 'Actif',
    conditionsRenouvellement: 'Reconduction tacite annuelle sauf préavis de 3 mois.',
    actifsCouverts: ['act-2'],
  },
  {
    id: 'ctr-2',
    fournisseurId: 'frs-2',
    type: 'Maintenance préventive',
    objet: 'Entretien mensuel des groupes électrogènes de secours.',
    valeur: 8300000,
    dateDebut: '2024-06-01',
    dateFin: '2027-06-01',
    statut: 'Actif',
    conditionsRenouvellement: 'Renouvellement sur évaluation de performance.',
    actifsCouverts: ['act-3'],
  },
  {
    id: 'ctr-3',
    fournisseurId: 'frs-3',
    type: 'Garantie étendue',
    objet: 'Garantie étendue et support des équipements de vidéosurveillance.',
    valeur: 1500000,
    dateDebut: '2024-01-10',
    dateFin: '2027-01-10',
    statut: 'Actif',
    conditionsRenouvellement: 'Reconduction sur validation budgétaire DMG.',
    actifsCouverts: ['act-4'],
  },
]

// ============================================================================
// MODULES AFRILAND — extension métier propre à ce déploiement, au-dessus du
// socle GMAO standard (pas d'équivalent dans OpenMaint de base).
// ============================================================================

// ---- SLA bancaires -------------------------------------------------------------
export const slaRules = [
  {
    id: 'slar-1',
    nom: 'Panne climatisation salle serveur',
    description: 'Intervention prioritaire sur les salles techniques hébergeant des équipements informatiques critiques.',
    categorieId: 'cat-2',
    contratId: 'ctr-1',
    delaiReponseHeures: 2,
    delaiResolutionHeures: 8,
    penalitePourcentage: 2,
    actif: true,
  },
  {
    id: 'slar-2',
    nom: 'Panne groupe électrogène',
    description: 'Continuité d\'alimentation électrique de secours pour les agences.',
    categorieId: 'cat-3',
    contratId: 'ctr-2',
    delaiReponseHeures: 4,
    delaiResolutionHeures: 24,
    penalitePourcentage: 1.5,
    actif: true,
  },
  {
    id: 'slar-3',
    nom: 'Incident sécurité / vidéosurveillance',
    description: 'Rétablissement des systèmes de sécurité et de contrôle d\'accès.',
    categorieId: 'cat-4',
    contratId: 'ctr-3',
    delaiReponseHeures: 6,
    delaiResolutionHeures: 48,
    penalitePourcentage: 1,
    actif: true,
  },
]

export const slaMeasures = [
  {
    id: 'slam-1',
    slaRuleId: 'slar-1',
    ordreTravailId: 'ot-1',
    dateMesure: '2026-07-29',
    delaiReponseReelHeures: 3,
    delaiResolutionReelHeures: 12,
    conforme: false,
  },
  {
    id: 'slam-2',
    slaRuleId: 'slar-2',
    ordreTravailId: 'ot-2',
    dateMesure: '2026-08-02',
    delaiReponseReelHeures: 2,
    delaiResolutionReelHeures: 18,
    conforme: true,
  },
  {
    id: 'slam-3',
    slaRuleId: 'slar-1',
    ordreTravailId: 'ot-3',
    dateMesure: '2026-07-16',
    delaiReponseReelHeures: 1,
    delaiResolutionReelHeures: 6,
    conforme: true,
  },
]

export const penalites = [
  {
    id: 'pen-1',
    slaMeasureId: 'slam-1',
    contratId: 'ctr-1',
    montant: 84000,
    motif: 'Dépassement du délai de résolution (12h au lieu de 8h prévues).',
    statut: 'En attente',
    dateApplication: '2026-07-30',
  },
]

export const validationsPaiement = [
  {
    id: 'vp-1',
    penaliteId: 'pen-1',
    fournisseurId: 'frs-1',
    montant: 84000,
    statut: 'En attente',
    validateur1: null,
    validateur2: null,
    dateValidation: null,
  },
  {
    id: 'vp-2',
    penaliteId: null,
    fournisseurId: 'frs-2',
    montant: 1250000,
    statut: 'Validé',
    validateur1: 'Direction Financière',
    validateur2: 'Direction Générale',
    dateValidation: '2026-07-20',
  },
]

// ---- Évaluations prestataires -------------------------------------------------
export const evaluationsPrestataires = [
  {
    id: 'eval-1',
    fournisseurId: 'frs-1',
    periode: '2026-T2',
    noteQualite: 3,
    noteDelai: 2,
    noteCout: 4,
    commentaire: 'Intervention correcte mais délai de résolution dépassé sur l\'incident climatisation.',
    evaluateur: 'Jean Mballa',
    date: '2026-07-31',
  },
  {
    id: 'eval-2',
    fournisseurId: 'frs-2',
    periode: '2026-T2',
    noteQualite: 5,
    noteDelai: 5,
    noteCout: 4,
    commentaire: 'Excellente réactivité sur la maintenance préventive du groupe électrogène.',
    evaluateur: 'Paul Etoundi',
    date: '2026-08-02',
  },
]

// ---- Clés et accès --------------------------------------------------------------
export const cles = [
  {
    id: 'cle-1',
    libelle: 'Salle serveur — Agence Douala Akwa',
    emplacementId: 'emp-4',
    type: 'Physique',
    classification: 'Élevée',
    detenteurActuel: 'Jean Mballa',
    statut: 'En possession',
  },
  {
    id: 'cle-2',
    libelle: 'Local technique — Siège Social',
    emplacementId: 'emp-7',
    type: 'Badge',
    classification: 'Standard',
    detenteurActuel: null,
    statut: 'Disponible',
  },
  {
    id: 'cle-3',
    libelle: 'Armoire électrique — Agence Yaoundé Centre',
    emplacementId: 'emp-5',
    type: 'Physique',
    classification: 'Élevée',
    detenteurActuel: null,
    statut: 'Disponible',
  },
]

export const mouvementsCles = [
  { id: 'mvc-1', cleId: 'cle-1', action: 'Retrait', personne: 'Jean Mballa', date: '2026-07-28', dateRestitutionPrevue: '2026-07-28', valideur1: 'Paul Etoundi', valideur2: 'Direction Sécurité', commentaire: 'Intervention climatiseur.' },
  { id: 'mvc-2', cleId: 'cle-2', action: 'Retour', personne: 'Paul Etoundi', date: '2026-08-01', dateRestitutionPrevue: null, valideur1: null, valideur2: null, commentaire: 'Fin de contrôle mensuel.' },
]

// ---- Projets immobiliers ---------------------------------------------------------
export const projetsImmobiliers = [
  {
    id: 'proj-1',
    nom: 'Extension salle serveur — Douala Akwa',
    emplacementId: 'emp-4',
    typeProjet: 'Extension',
    budget: 45000000,
    budgetConsomme: 2500000,
    dateDebut: '2026-09-01',
    dateFinPrevue: '2027-02-28',
    statut: 'Planifié',
    chefProjet: 'Direction Immobilière',
  },
  {
    id: 'proj-2',
    nom: 'Rénovation agence Yaoundé Centre',
    emplacementId: 'emp-5',
    typeProjet: 'Rénovation',
    budget: 28000000,
    budgetConsomme: 24500000,
    dateDebut: '2026-05-01',
    dateFinPrevue: '2026-10-31',
    statut: 'En cours',
    chefProjet: 'Direction Immobilière',
  },
]

export const jalonsProjets = [
  { id: 'jal-1', projetId: 'proj-1', nom: 'Validation du permis de construire', dateEcheance: '2026-09-15', statut: 'À venir' },
  { id: 'jal-2', projetId: 'proj-2', nom: 'Réception des travaux électriques', dateEcheance: '2026-08-10', statut: 'En cours' },
  { id: 'jal-3', projetId: 'proj-2', nom: 'Livraison mobilier', dateEcheance: '2026-07-15', statut: 'Atteint' },
]

// ---- Tâches workflow et alertes automatiques -------------------------------------
export const tachesWorkflow = [
  { id: 'twf-1', titre: 'Valider la pénalité SLA CoolTech Cameroun', type: 'Validation SLA', assigneA: 'Direction Financière', statut: 'À faire', dateEcheance: '2026-08-06' },
  { id: 'twf-2', titre: 'Approuver le paiement PowerGen Services', type: 'Approbation paiement', assigneA: 'Direction Financière', statut: 'Terminé', dateEcheance: '2026-07-22' },
  { id: 'twf-3', titre: 'Revoir l\'évaluation trimestrielle SecuriCam', type: 'Revue évaluation', assigneA: 'Jean Mballa', statut: 'En cours', dateEcheance: '2026-08-10' },
]

export const alertesAutomatiques = [
  { id: 'alr-1', titre: 'Dépassement de délai SLA détecté', niveau: 'Critique', source: 'Moteur SLA', date: '2026-07-30', lu: false, description: 'Le délai de résolution de l\'incident climatisation (ot-1) dépasse le seuil contractuel.', sourceId: null },
  { id: 'alr-2', titre: 'Clé non retournée depuis 5 jours', niveau: 'Avertissement', source: 'Suivi des accès', date: '2026-08-02', lu: false, description: 'La clé de la salle serveur de Douala Akwa est toujours en possession de Jean Mballa.', sourceId: null },
  { id: 'alr-3', titre: 'Jalon projet atteint', niveau: 'Info', source: 'Suivi de projets', date: '2026-07-15', lu: true, description: 'Livraison mobilier — Rénovation agence Yaoundé Centre.', sourceId: null },
]

// ============================================================================
// ARCHIVES DE BASE, LOGISTIQUE, ÉNERGIE, CONFIGURATIONS — groupes de menu
// calqués sur la structure OpenMaint qui n'affichaient jusqu'ici qu'un
// placeholder « Bientôt disponible » ; les 4 blocs ci-dessous leur donnent un
// contenu réel.
// ============================================================================

// ---- Pièces de rechange (Gestion de la logistique) ----------------------------------
export const piecesRechange = [
  { id: 'pr-1', nom: 'Filtre à air groupe électrogène', reference: 'REF-GE-FA01', categorieId: 'cat-3', quantiteStock: 12, seuilMinimum: 5, unite: 'unité' },
  { id: 'pr-2', nom: 'Gaz réfrigérant R410A', reference: 'REF-CLIM-R410', categorieId: 'cat-2', quantiteStock: 3, seuilMinimum: 4, unite: 'bouteille' },
  { id: 'pr-3', nom: 'Disque dur serveur 2To', reference: 'REF-INFO-HDD2T', categorieId: 'cat-1', quantiteStock: 6, seuilMinimum: 2, unite: 'unité' },
]

export const mouvementsStock = [
  { id: 'mvs-1', pieceId: 'pr-2', type: 'Sortie', quantite: 2, date: '2026-07-29', motif: 'Intervention climatiseur salle serveur (OT-1).' },
]

// ---- Consommations d'énergie (Gestion de l'énergie) ----------------------------------
export const consommationsEnergie = [
  { id: 'nrj-1', emplacementId: 'emp-2', typeEnergie: 'Électricité', date: '2026-07-01', valeur: 4200, unite: 'kWh', cout: 630000 },
  { id: 'nrj-2', emplacementId: 'emp-2', typeEnergie: 'Carburant (groupe électrogène)', date: '2026-07-01', valeur: 180, unite: 'litres', cout: 162000 },
  { id: 'nrj-3', emplacementId: 'emp-5', typeEnergie: 'Électricité', date: '2026-07-01', valeur: 3100, unite: 'kWh', cout: 465000 },
]

// ---- Utilisateurs & rôles (Configurations) --------------------------------------------
export const utilisateurs = [
  { id: 'usr-1', nom: 'Jean Mballa', email: 'jean.mballa@afrilandfirstbank.com', role: 'Technicien / Prestataire', statut: 'Actif' },
  { id: 'usr-2', nom: 'Paul Etoundi', email: 'paul.etoundi@afrilandfirstbank.com', role: 'Responsable de site', statut: 'Actif' },
  { id: 'usr-3', nom: 'Sarah Ngo', email: 'sarah.ngo@afrilandfirstbank.com', role: 'Gestionnaire DMG', statut: 'Actif' },
]

// ---- Journal d'audit ---------------------------------------------------------------
// Piste d'audit horodatée et append-only pour les opérations sensibles (US-05) :
// mouvements de clés en zone classifiée, validations de paiement, pénalités.
// Ce tableau n'est jamais modifié ni purgé par la couche service, seulement complété.
export const journalAudit = [
  {
    id: 'aud-1',
    date: '2026-07-28',
    action: 'Retrait de clé (zone classifiée Élevée)',
    entite: 'cle',
    entiteId: 'cle-1',
    auteur: 'Jean Mballa',
    details: 'Double validation : Paul Etoundi / Direction Sécurité.',
  },
]
