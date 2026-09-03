// ============================================================================
// COUCHE DE SERVICE — point unique de contact avec les données.
//
// Les fonctions de LECTURE des 7 tables réellement présentes dans Dataverse
// (Actif, Emplacement, Categorie d'actif, Agence, Technicien, Ordre de
// travail, Ticket) sont maintenant branchées sur les vraies données, ainsi
// que la CRÉATION d'Actif/Emplacement/Categorie d'actif et le changement de
// statut d'un Actif (colonnes fmaint_statut / fmaint_type — voir
// STATUT_ACTIF_CODES / TYPE_EMPLACEMENT_CODES ci-dessous pour la correspondance
// avec les valeurs d'option Dataverse).
//
// Le cycle de vie détaillé de l'Actif (etatCycleVie, criticité, code
// inventaire, pièces jointes) et de l'Ordre de travail (statut métier au-delà
// du statecode Actif/Inactif générique, compte-rendu, checklist...) n'ont pas
// de colonnes Dataverse correspondantes — ils continuent d'opérer en mémoire
// et ne survivent pas à un rechargement. Idem pour tout le reste (SLA, clés,
// projets immobiliers, énergie, contrats...), qui reste sur mockData.js car
// ces tables n'existent pas du tout dans Dataverse — voir le document
// "Analyse d'écart" pour le détail de ce qui resterait à créer.
// ============================================================================

import { portalGet, portalPost, portalPatch, getFormatted } from './portalApi.js'
import {
  actifs as mockActifs,
  emplacements as mockEmplacements,
  categoriesActif as mockCategories,
  ordresTravail as mockOrdresTravail,
  tickets as mockTickets,
  historiqueOrdreTravail as mockHistoriqueOrdreTravail,
  plansPreventifs as mockPlansPreventifs,
  echeancesPlan as mockEcheancesPlan,
  demandesModificationActif as mockDemandesModificationActif,
  fichesAnalysePostIncident as mockFichesAnalysePostIncident,
  rapportsMensuels as mockRapportsMensuels,
  fournisseurs as mockFournisseurs,
  contrats as mockContrats,
  slaRules as mockSlaRules,
  slaMeasures as mockSlaMeasures,
  penalites as mockPenalites,
  validationsPaiement as mockValidationsPaiement,
  evaluationsPrestataires as mockEvaluationsPrestataires,
  cles as mockCles,
  mouvementsCles as mockMouvementsCles,
  projetsImmobiliers as mockProjetsImmobiliers,
  jalonsProjets as mockJalonsProjets,
  tachesWorkflow as mockTachesWorkflow,
  alertesAutomatiques as mockAlertesAutomatiques,
  journalAudit as mockJournalAudit,
  piecesRechange as mockPiecesRechange,
  mouvementsStock as mockMouvementsStock,
  consommationsEnergie as mockConsommationsEnergie,
  SEUIL_DOUBLE_VALIDATION,
} from '../data/mockData.js'
// Ré-exportés (références, pas des copies) pour que dataService.powerapps.js
// puisse pousser dans les mêmes tableaux mock que les fonctions ci-dessous —
// sinon les transitions de cycle de vie (qualifierOrdreTravail, etc.),
// ré-exportées via `export *`, ne retrouveraient pas les OT créés côté
// Power Apps.
export { mockActifs, mockOrdresTravail, mockEmplacements, mockCategories }
import { transitionAutorisee } from '../domain/ordreTravailWorkflow.js'
import { avancerEcheance, joursDeLaPeriode } from '../domain/echeances.js'

// Correspondance labels UI <-> valeurs d'option Dataverse (picklists
// fmaint_actif.fmaint_statut et fmaint_emplacement.fmaint_type), relevées sur
// la solution FirstMaint exportée — nécessaires pour écrire réellement ces
// champs (les lectures utilisent déjà les libellés formatés via getFormatted).
export const STATUT_ACTIF_CODES = {
  'En service': 607570000,
  'En panne': 607570001,
  'En maintenance': 607570002,
  'Retiré': 607570003,
}

export const TYPE_EMPLACEMENT_CODES = {
  'Agence': 607570000,
  'Siège': 607570001,
  'Étage': 607570002,
  'Salle': 607570003,
}

// Délai maximal d'intervention corrective (heures), différencié par criticité de
// l'actif concerné — cahier des charges US-02, section 2.4 (paliers d'escalade).
export const DELAI_MAX_PAR_CRITICITE = {
  Critique: 4,
  Haute: 24,
  Moyenne: 72,
  Basse: 168, // 7 jours
}

// Délai d'anticipation de génération de l'OT préventif avant échéance (US-03,
// étape 1) et fréquence préventive suggérée par criticité (US-01, grille).
export const DELAI_ANTICIPATION_PAR_CRITICITE = {
  Critique: 30,
  Haute: 30,
  Moyenne: 15,
  Basse: 15,
}

export function dateEcheanceParCriticite(criticite, depuis = new Date()) {
  const heures = DELAI_MAX_PAR_CRITICITE[criticite] ?? 72
  const d = new Date(depuis)
  d.setHours(d.getHours() + heures)
  return d.toISOString().slice(0, 10)
}

// Petite fonction utilitaire pour simuler la latence réseau d'une vraie API
const simulateDelay = (data, ms = 300) =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), ms))

// ---- Emplacements ----------------------------------------------------------
export async function getEmplacements() {
  const rows = await portalGet('fmaint_emplacements', '?$select=fmaint_emplacementid,fmaint_nom,fmaint_type,_fmaint_emplacementparent_value')
  return rows.map((r) => ({
    id: r.fmaint_emplacementid,
    nom: r.fmaint_nom,
    type: getFormatted(r, 'fmaint_type') || 'Agence',
    parentId: r._fmaint_emplacementparent_value || null,
  }))
}

export async function createEmplacement(nouvelEmplacement) {
  const payload = { fmaint_nom: nouvelEmplacement.nom }
  const typeCode = TYPE_EMPLACEMENT_CODES[nouvelEmplacement.type]
  if (typeCode !== undefined) payload.fmaint_type = typeCode
  if (nouvelEmplacement.parentId) {
    payload['fmaint_Emplacementparent@odata.bind'] = `/fmaint_emplacements(${nouvelEmplacement.parentId})`
  }
  const r = await portalPost('fmaint_emplacements', payload)

  const emplacement = { parentId: null, ...nouvelEmplacement, id: r.fmaint_emplacementid }
  mockEmplacements.push(emplacement)
  return simulateDelay(emplacement)
}

// ---- Catégories d'actif (Archives de base) -----------------------------------------
export async function getCategoriesActif() {
  const rows = await portalGet('fmaint_categoriedactifs', '?$select=fmaint_categoriedactifid,fmaint_nomdelacategorie,fmaint_description')
  return rows.map((r) => ({
    id: r.fmaint_categoriedactifid,
    nom: r.fmaint_nomdelacategorie,
    description: r.fmaint_description || '',
    criticiteParDefaut: 'Moyenne',
  }))
}

export async function createCategorieActif(nouvelleCategorie) {
  const payload = {
    fmaint_nomdelacategorie: nouvelleCategorie.nom,
    fmaint_description: nouvelleCategorie.description || '',
  }
  const r = await portalPost('fmaint_categoriedactifs', payload)

  const categorie = { ...nouvelleCategorie, id: r.fmaint_categoriedactifid }
  mockCategories.push(categorie)
  return simulateDelay(categorie)
}

// ---- Agences (nouveau — table Dataverse fmaint_agences) ----------------------
export async function getAgences() {
  const rows = await portalGet('fmaint_agences', '?$select=fmaint_agenceid,fmaint_nomagence,fmaint_telephone')
  return rows.map((r) => ({
    id: r.fmaint_agenceid,
    nom: r.fmaint_nomagence,
    telephone: r.fmaint_telephone || '',
  }))
}

// ---- Techniciens (nouveau — table Dataverse fmaint_techniciens) --------------
export async function getTechniciens() {
  const rows = await portalGet('fmaint_techniciens', '?$select=fmaint_technicienid,fmaint_nomtechnicien,fmaint_telephone')
  return rows.map((r) => ({
    id: r.fmaint_technicienid,
    nom: r.fmaint_nomtechnicien,
    telephone: r.fmaint_telephone || '',
  }))
}

// ---- Actifs -----------------------------------------------------------------
export async function getActifs() {
  const rows = await portalGet('fmaint_actifs', '?$select=fmaint_actifid,fmaint_nom,fmaint_numerodeserie,fmaint_statut,_fmaint_emplacementid_value,_fmaint_categoriedactifid_value,fmaint_datedacquisition,fmaint_datedefindegarantie,fmaint_valeur')
  return rows.map((r) => ({
    id: r.fmaint_actifid,
    nom: r.fmaint_nom,
    numeroSerie: r.fmaint_numerodeserie,
    statut: getFormatted(r, 'fmaint_statut') || 'En service',
    emplacementId: r._fmaint_emplacementid_value,
    categorieId: r._fmaint_categoriedactifid_value,
    dateAcquisition: r.fmaint_datedacquisition ? r.fmaint_datedacquisition.slice(0, 10) : null,
    dateFinGarantie: r.fmaint_datedefindegarantie ? r.fmaint_datedefindegarantie.slice(0, 10) : null,
    valeur: r.fmaint_valeur || 0,
    // Champs du cahier des charges V2 non encore présents dans Dataverse — valeurs par défaut :
    etatCycleVie: 'Actif',
    criticite: 'Moyenne',
    codeInventaire: null,
    piecesJointes: [],
  }))
}

// Nouvel actif : entre en "En saisie" (workflows v2.0, section 1.2 — cycle de
// vie à 4 états), et hérite par défaut de la criticité de sa famille tant que
// l'appelant n'en fournit pas une explicitement (surcharge possible côté UI).
// Le code inventaire est toujours généré par le système, jamais saisi à la main.
export async function createActif(nouvelActif) {
  const categorie = mockCategories.find((c) => c.id === nouvelActif.categorieId)
  const codeInventaire = await genererProchainCodeInventaire()

  const payload = {
    fmaint_nom: nouvelActif.nom,
    fmaint_numerodeserie: nouvelActif.numeroSerie || '',
    fmaint_statut: STATUT_ACTIF_CODES[nouvelActif.statut] ?? STATUT_ACTIF_CODES['En service'],
    fmaint_valeur: Number(nouvelActif.valeur) || 0,
  }
  if (nouvelActif.dateAcquisition) payload.fmaint_datedacquisition = nouvelActif.dateAcquisition
  if (nouvelActif.dateFinGarantie) payload.fmaint_datedefindegarantie = nouvelActif.dateFinGarantie
  if (nouvelActif.emplacementId) payload['fmaint_EmplacementID@odata.bind'] = `/fmaint_emplacements(${nouvelActif.emplacementId})`
  if (nouvelActif.categorieId) payload['fmaint_CategoriedactifID@odata.bind'] = `/fmaint_categoriedactifs(${nouvelActif.categorieId})`
  const r = await portalPost('fmaint_actifs', payload)

  const actif = {
    etatCycleVie: 'En saisie',
    piecesJointes: [],
    criticite: categorie?.criticiteParDefaut || 'Moyenne',
    ...nouvelActif,
    id: r.fmaint_actifid,
    codeInventaire,
  }
  mockActifs.push(actif)
  await ajouterAudit({
    action: 'Actif — créé (En saisie)',
    entite: 'actif', entiteId: actif.id, auteur: 'Système', details: actif.nom,
  })
  return simulateDelay(actif)
}

export async function updateActifStatut(id, statut) {
  const code = STATUT_ACTIF_CODES[statut]
  if (code !== undefined) {
    await portalPatch('fmaint_actifs', id, { fmaint_statut: code })
  }
  const actif = mockActifs.find((a) => a.id === id)
  if (actif) {
    actif.statut = statut
    await ajouterAudit({
      action: `Actif — statut changé en "${statut}"`,
      entite: 'actif',
      entiteId: id,
      auteur: 'Système',
      details: actif.nom,
    })
  }
  return simulateDelay(actif)
}

// Génère le prochain code inventaire disponible pour l'année en cours (US-01,
// point d'attention 1.6) — nomenclature simple INV-{année}-{numéro séquentiel},
// à ajuster si la DMG adopte une nomenclature AGENCE-TYPE-NUMÉRO.
export async function genererProchainCodeInventaire() {
  const annee = new Date().getFullYear()
  const prefixe = `INV-${annee}-`
  const numeros = mockActifs
    .map((a) => a.codeInventaire)
    .filter((c) => c && c.startsWith(prefixe))
    .map((c) => Number(c.slice(prefixe.length)) || 0)
  const prochain = (numeros.length ? Math.max(...numeros) : 0) + 1
  return simulateDelay(`${prefixe}${String(prochain).padStart(4, '0')}`)
}

// --- Cycle de vie de la fiche actif (workflows v2.0, section 1.3, étape 6) --
// Activation directe par le Gestionnaire DMG : plus de validation hiérarchique
// préalable à la création. Un actif de criticité Critique sans contrat ni plan
// préventif rattaché déclenche une alerte (recommandé, non bloquant).
export async function activerActif(id, auteur = 'Système') {
  const actif = mockActifs.find((a) => a.id === id)
  if (!actif || actif.etatCycleVie !== 'En saisie') return simulateDelay(actif)

  actif.etatCycleVie = 'Actif'
  await ajouterAudit({
    action: `Actif — activé par ${auteur}`,
    entite: 'actif', entiteId: id, auteur, details: actif.nom,
  })

  if (actif.criticite === 'Critique') {
    const aContrat = mockContrats.some((c) => c.actifsCouverts.includes(actif.id))
    const aPlan = mockPlansPreventifs.some((p) => p.actifId === actif.id)
      || (actif.categorieId && mockPlansPreventifs.some((p) => p.categorieId === actif.categorieId))
    if (!aContrat || !aPlan) {
      mockAlertesAutomatiques.push({
        id: `alr-${Date.now()}`,
        titre: `Actif critique sans contrat/plan préventif rattaché — ${actif.nom}`,
        niveau: 'Avertissement',
        source: 'Référentiel patrimoine',
        date: new Date().toISOString().slice(0, 10),
        lu: false,
        description: 'Un actif de criticité Critique devrait être rattaché à un contrat de maintenance et à un plan préventif (recommandé, non bloquant).',
        sourceId: `actif-critique-sans-rattachement-${actif.id}`,
      })
    }
  }

  return simulateDelay(actif)
}

// Retrait d'un actif (US-01, cycle de vie "En retrait" -> "Retiré") : clôture
// les OT ouverts et retire les échéances préventives associées.
export async function demanderRetraitActif(id, motif, auteur = 'Système') {
  const actif = mockActifs.find((a) => a.id === id)
  if (actif) {
    actif.etatCycleVie = 'En retrait'
    await ajouterAudit({
      action: 'Actif — retrait demandé', entite: 'actif', entiteId: id, auteur, details: motif,
    })
  }
  return simulateDelay(actif)
}

export async function confirmerRetraitActif(id, auteur = 'Système') {
  const actif = mockActifs.find((a) => a.id === id)
  if (!actif) return simulateDelay(null)

  actif.etatCycleVie = 'Retiré'
  for (const ot of mockOrdresTravail) {
    if (ot.actifId === id && !['Clôturé', 'Rejeté'].includes(ot.statut)) {
      await updateOrdreTravailStatut(ot.id, 'Rejeté', auteur)
    }
  }
  const echeancesSupprimees = mockEcheancesPlan.filter((e) => e.actifId === id)
  echeancesSupprimees.forEach((e) => { mockEcheancesPlan.splice(mockEcheancesPlan.indexOf(e), 1) })

  await ajouterAudit({
    action: 'Actif — retrait confirmé, OT ouverts clôturés et plans préventifs suspendus',
    entite: 'actif', entiteId: id, auteur, details: actif.nom,
  })
  return simulateDelay(actif)
}

export async function ajouterPieceJointeActif(id, nomFichier, typeDocument) {
  const actif = mockActifs.find((a) => a.id === id)
  if (actif) {
    actif.piecesJointes.push({
      id: `pj-${Date.now()}`,
      nomFichier,
      typeDocument: typeDocument || 'Autre',
      dateAjout: new Date().toISOString().slice(0, 10),
    })
  }
  return simulateDelay(actif)
}

// --- Modifications catégorisées sur une fiche actif (workflows v2.0, section
// 1.4) --- deux catégories : "courante" (site, contrat, plan, corrections
// diverses) -> auto-approuvée et tracée ; "critique" (criticité, statut de
// cycle de vie, valeur d'acquisition) -> validation du Responsable DMG requise
// (validateur unique).
export async function demanderModificationActif(id, champs, categorie, auteur) {
  const actif = mockActifs.find((a) => a.id === id)
  if (!actif) return simulateDelay(null)

  if (categorie === 'critique') {
    const demande = {
      id: `dma-${Date.now()}`,
      actifId: id,
      champs,
      statut: 'En attente',
      demandePar: auteur,
      dateDemande: new Date().toISOString().slice(0, 10),
      valideur: null,
    }
    mockDemandesModificationActif.push(demande)
    await ajouterAudit({
      action: 'Actif — demande de modification critique en attente de validation (Responsable DMG)',
      entite: 'actif', entiteId: id, auteur, details: JSON.stringify(champs),
    })
    return simulateDelay(demande)
  }

  Object.assign(actif, champs)
  await ajouterAudit({
    action: 'Actif — modification courante',
    entite: 'actif', entiteId: id, auteur, details: JSON.stringify(champs),
  })
  return simulateDelay(actif)
}

export async function validerDemandeModification(id, validateur) {
  const demande = mockDemandesModificationActif.find((d) => d.id === id)
  if (!demande || demande.statut === 'Validée') return simulateDelay(demande)

  demande.valideur = validateur
  demande.statut = 'Validée'
  const actif = mockActifs.find((a) => a.id === demande.actifId)
  if (actif) Object.assign(actif, demande.champs)
  await ajouterAudit({
    action: `Actif — modification critique validée par ${validateur}`,
    entite: 'actif', entiteId: demande.actifId, auteur: validateur, details: JSON.stringify(demande.champs),
  })
  return simulateDelay(demande)
}

export async function getDemandesModificationActif() {
  return simulateDelay(mockDemandesModificationActif)
}

// Import en masse, réutilisable à volonté — inventaire initial ou alimentations
// récurrentes ultérieures (workflows v2.0, section 1.5) : contrôle qualité par
// ligne avant création. Les codes inventaire sont générés par le système (plus
// de saisie manuelle), donc pas de contrôle d'unicité à faire ici. Retourne le
// détail des lignes créées et rejetées pour que l'écran d'import puisse
// afficher un journal de rejets exploitable.
export async function importActifsCsv(lignes) {
  const crees = []
  const rejetes = []

  for (const [index, ligne] of lignes.entries()) {
    const numeroLigne = index + 2 // +1 en-tête, +1 index 0-based
    if (!ligne.nom || !ligne.nom.trim()) {
      rejetes.push({ ligne: numeroLigne, motif: 'Nom manquant.' })
      continue
    }

    const champsActif = {
      nom: ligne.nom,
      numeroSerie: ligne.numeroSerie,
      statut: ligne.statut || 'En service',
      emplacementId: ligne.emplacementId || null,
      categorieId: ligne.categorieId || null,
      dateAcquisition: ligne.dateAcquisition || null,
      dateFinGarantie: ligne.dateFinGarantie || null,
      valeur: Number(ligne.valeur) || 0,
    }
    // Absente : repli sur la criticité par défaut de la famille (createActif).
    if (ligne.criticite) champsActif.criticite = ligne.criticite

    const actif = await createActif(champsActif)
    crees.push(actif)
  }

  await ajouterAudit({
    action: `Import de masse — ${crees.length} actif(s) créé(s), ${rejetes.length} rejeté(s)`,
    entite: 'actif', entiteId: null, auteur: 'Administrateur solution',
    details: rejetes.map((r) => `L${r.ligne}: ${r.motif}`).join(' | ') || '—',
  })

  return { crees, rejetes }
}

// ---- Ordres de travail -------------------------------------------------------
export async function getOrdresTravail() {
  const rows = await portalGet('fmaint_ordredetravails', '?$select=fmaint_ordredetravailid,fmaint_nomordre,statecode,fmaint_urgent,_fmaint_technicienid_value,_fmaint_actifid_value,fmaint_dateintervention,fmaint_dureeheures')
  return rows.map((r) => ({
    id: r.fmaint_ordredetravailid,
    numero: r.fmaint_nomordre,
    titre: r.fmaint_nomordre,
    statut: getFormatted(r, 'statecode') || 'Nouveau',
    priorite: r.fmaint_urgent ? 'Critique' : 'Moyenne',
    technicien: getFormatted(r, '_fmaint_technicienid_value') || null,
    dateEcheance: r.fmaint_dateintervention ? r.fmaint_dateintervention.slice(0, 10) : null,
    dureeHeures: r.fmaint_dureeheures || 0,
    actifId: r._fmaint_actifid_value || null,
    checklist: [],
    piecesJointes: [],
    origine: 'Corrective',
  }))
}

// Numérotation distincte préventif/correctif (US-03, étape 1 : préfixe PREV
// vs CORR).
export function prochainNumeroOt(origine) {
  const prefixe = origine === 'Préventif' ? 'PREV' : 'CORR'
  const numeros = mockOrdresTravail
    .map((o) => o.numero)
    .filter((n) => n && n.startsWith(`${prefixe}-`))
    .map((n) => Number(n.slice(prefixe.length + 1)) || 0)
  const prochain = (numeros.length ? Math.max(...numeros) : 0) + 1
  return `${prefixe}-${prochain}`
}

// Création réelle dans Dataverse (fmaint_ordredetravails) — seule la table
// Actif est liée à la création (fmaint_actifid, une vraie colonne lookup) ;
// le technicien n'est pas encore un vrai lookup ID à ce stade du formulaire,
// donc il reste informationnel côté mock comme avant. Le reste du cycle de
// vie (qualification, résolution, clôture...) continue d'opérer sur le
// tableau mock en mémoire — cf. plan : refaire tout le cycle de vie en
// Dataverse est hors scope (la table n'a pas les colonnes checklist/
// compteRendu/etc.). On pousse quand même l'enregistrement réel (avec son
// vrai id Dataverse) dans mockOrdresTravail pour que ces fonctions
// continuent à le retrouver par id.
export async function createOrdreTravail(nouvelOrdre) {
  const actif = mockActifs.find((a) => a.id === nouvelOrdre.actifId)
  const origine = nouvelOrdre.origine || 'Corrective'
  // Délai max auto-assigné selon la criticité de l'actif si non renseigné (US-02).
  const dateEcheance = nouvelOrdre.dateEcheance
    || (origine === 'Corrective' ? dateEcheanceParCriticite(actif?.criticite) : null)
  const numero = prochainNumeroOt(origine)

  const payload = {
    fmaint_nomordre: nouvelOrdre.titre || numero,
    fmaint_urgent: nouvelOrdre.priorite === 'Critique',
  }
  if (dateEcheance) payload.fmaint_dateintervention = dateEcheance
  if (nouvelOrdre.actifId) payload['fmaint_ActifID@odata.bind'] = `/fmaint_actifs(${nouvelOrdre.actifId})`
  const r = await portalPost('fmaint_ordredetravails', payload)

  const ordre = {
    dateOuverture: new Date().toISOString().slice(0, 10),
    dateAccuseReception: null,
    dateDebutIntervention: null,
    dateResolution: null,
    dateCloture: null,
    planPreventifId: null,
    otPreventifSourceId: null,
    checklist: [],
    compteRendu: null,
    piecesJointes: [],
    ...nouvelOrdre,
    origine,
    dateEcheance,
    id: r.fmaint_ordredetravailid,
    numero,
  }
  mockOrdresTravail.push(ordre)
  await ajouterAudit({
    action: `OT ${ordre.numero} créé (${origine})`,
    entite: 'ordreTravail', entiteId: ordre.id, auteur: 'Système', details: ordre.titre,
  })
  return simulateDelay(ordre)
}

// Trouve la règle SLA applicable à un actif : priorité au contrat qui le couvre,
// sinon repli sur la catégorie de l'actif (cahier des charges US-04).
function trouverSlaRuleApplicable(actif) {
  if (!actif) return null
  const contrat = mockContrats.find((c) => c.actifsCouverts.includes(actif.id))
  const parContrat = contrat && mockSlaRules.find((r) => r.contratId === contrat.id && r.actif)
  if (parContrat) return { regle: parContrat, contrat }
  const parCategorie = mockSlaRules.find((r) => r.categorieId === actif.categorieId && r.actif)
  const contratDeLaRegle = parCategorie && mockContrats.find((c) => c.id === parCategorie.contratId)
  return parCategorie ? { regle: parCategorie, contrat: contrat || contratDeLaRegle || null } : null
}

function ajouterHistoriqueOt(id, statut, auteur) {
  mockHistoriqueOrdreTravail.push({
    id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ordreTravailId: id,
    statut,
    date: new Date().toISOString().slice(0, 10),
    auteur,
  })
}

// Changement de statut générique — vérifie la transition par rapport à la
// machine à états (US-02, section 2.2) avant de l'appliquer. Les étapes avec
// une règle métier dédiée (qualification, accusé de réception, résolution,
// clôture...) ont leur propre fonction ci-dessous et appellent celle-ci en
// interne pour rester cohérentes avec l'historique et le contrôle de transition.
export async function updateOrdreTravailStatut(id, statut, auteur = 'Système') {
  const ordre = mockOrdresTravail.find((o) => o.id === id)
  if (!ordre) return simulateDelay(null)
  if (!transitionAutorisee(ordre.statut, statut)) {
    throw new Error(`Transition non autorisée : "${ordre.statut}" → "${statut}".`)
  }

  ordre.statut = statut
  if (statut === 'En cours' && !ordre.dateDebutIntervention) {
    ordre.dateDebutIntervention = new Date().toISOString().slice(0, 10)
  }
  if (statut === 'Clôturé') {
    ordre.dateCloture = new Date().toISOString().slice(0, 10)
    await genererMesureSlaEtPenalite(ordre)
    await genererFicheAnalysePostIncidentSiNecessaire(ordre)
    if (ordre.origine === 'Préventif') await avancerEcheancePreventive(ordre)
  }
  ajouterHistoriqueOt(id, statut, auteur)
  return simulateDelay(ordre)
}

// --- Étapes dédiées du workflow correctif (US-02, section 2.3) -------------

// Étape 2 — Qualification : ajuste la priorité et affecte un prestataire/technicien.
// Signale une anomalie référentiel si l'actif n'a pas de contrat/règle SLA rattaché.
export async function qualifierOrdreTravail(id, { priorite, technicien, justificatif } = {}, auteur = 'Système') {
  const ordre = mockOrdresTravail.find((o) => o.id === id)
  if (!ordre) return simulateDelay(null)

  await updateOrdreTravailStatut(id, 'En qualification', auteur)

  const actif = mockActifs.find((a) => a.id === ordre.actifId)
  if (!trouverSlaRuleApplicable(actif)) {
    mockAlertesAutomatiques.push({
      id: `alr-${Date.now()}`,
      titre: 'Anomalie référentiel — équipement sans contrat de maintenance',
      niveau: 'Avertissement',
      source: 'Qualification OT',
      date: new Date().toISOString().slice(0, 10),
      lu: false,
      description: `L'actif "${actif?.nom || ordre.actifId}" n'a ni contrat de maintenance ni règle SLA rattachée.`,
      sourceId: `sans-contrat-${ordre.actifId}`,
    })
  }

  // Attribution automatique par défaut (workflows v2.0, étape 2) : si aucun
  // prestataire n'est déjà affecté ni fourni explicitement, on propose celui
  // de la famille de l'actif ; le gestionnaire DMG reste libre de réaffecter.
  if (!technicien && !ordre.technicien) {
    const categorieActif = mockCategories.find((c) => c.id === actif?.categorieId)
    const prestataireParDefaut = mockFournisseurs.find((f) => f.id === categorieActif?.prestataireParDefautId)
    if (prestataireParDefaut) ordre.technicien = prestataireParDefaut.nom
  }

  if (priorite) ordre.priorite = priorite
  if (technicien) ordre.technicien = technicien
  if (justificatif) ordre.justificatifPriorite = justificatif

  return updateOrdreTravailStatut(id, 'Affecté', auteur)
}

// Étape 3 — Prise en charge par le prestataire : accusé de réception ou refus
// motivé (retour à Nouveau pour ré-affectation).
export async function accuserReception(id, accepte, motifRefus, auteur = 'Système') {
  const ordre = mockOrdresTravail.find((o) => o.id === id)
  if (!ordre) return simulateDelay(null)

  if (!accepte) {
    ordre.motifRefus = motifRefus || '—'
    return updateOrdreTravailStatut(id, 'Nouveau', auteur)
  }

  ordre.dateAccuseReception = new Date().toISOString().slice(0, 10)
  return updateOrdreTravailStatut(id, 'En cours', auteur)
}

// Étape 4 — Attente de pièce détachée.
export async function passerEnAttenteDePiece(id, delaiEstime, auteur = 'Système') {
  const ordre = mockOrdresTravail.find((o) => o.id === id)
  if (ordre) ordre.delaiEstimePiece = delaiEstime || null
  return updateOrdreTravailStatut(id, 'En attente de pièce', auteur)
}

export async function reprendreIntervention(id, auteur = 'Système') {
  return updateOrdreTravailStatut(id, 'En cours', auteur)
}

// Étape 5 — Résolution : compte-rendu structuré obligatoire (workflows v2.0,
// étape 5). Les photos avant/après restent recommandées pour les criticités
// Critique/Haute mais ne sont plus bloquantes en phase de démarrage.
export async function resoudreOrdreTravail(id, compteRendu, auteur = 'Système') {
  const ordre = mockOrdresTravail.find((o) => o.id === id)
  if (!ordre) return simulateDelay(null)

  if (!compteRendu?.actionsRealisees?.trim()) {
    throw new Error('Le compte-rendu doit préciser les actions réalisées.')
  }
  const checklistIncomplete = (ordre.checklist || []).some((item) => item.obligatoire && !item.coche)
  if (checklistIncomplete) {
    throw new Error('Tous les items obligatoires de la checklist doivent être cochés avant de résoudre cet OT.')
  }

  const dureeCalculee = ordre.dateDebutIntervention
    ? Math.max(0, Math.round((new Date() - new Date(ordre.dateDebutIntervention)) / (1000 * 60 * 60 * 24)) * 24)
    : 0
  ordre.compteRendu = { dureeHeures: dureeCalculee, coutReel: 0, mesures: [], preconisations: '', ...compteRendu }
  ordre.dateResolution = new Date().toISOString().slice(0, 10)
  return updateOrdreTravailStatut(id, 'Résolu', auteur)
}

// Étape 6 — Validation et clôture par le responsable de site. Un refus renvoie
// l'OT en cours ; la validation tacite après 48h est gérée par automationEngine.
export async function validerClotureOrdreTravail(id, valide, motifRefus, validateur = 'Système') {
  if (!valide) {
    const ordre = mockOrdresTravail.find((o) => o.id === id)
    if (ordre) ordre.motifRefusCloture = motifRefus || '—'
    return updateOrdreTravailStatut(id, 'En cours', validateur)
  }
  return updateOrdreTravailStatut(id, 'Clôturé', validateur)
}

export async function rejeterOrdreTravail(id, motif, auteur = 'Système') {
  const ordre = mockOrdresTravail.find((o) => o.id === id)
  if (ordre) ordre.motifRejet = motif
  return updateOrdreTravailStatut(id, 'Rejeté', auteur)
}

// Conservée pour les OT préventifs (pas d'étape de qualification/accusé de
// réception distincte — cf. resoudreOrdreTravail + validerClotureOrdreTravail).
export async function cloturerOrdreTravailAvecCompteRendu(id, compteRendu, auteur = 'Système') {
  await resoudreOrdreTravail(id, compteRendu, auteur)
  return validerClotureOrdreTravail(id, true, null, auteur)
}

// Fiche d'analyse post-incident automatique à la clôture d'un OT correctif sur
// un actif de criticité Critique (US-02, étape 6, dernier point).
async function genererFicheAnalysePostIncidentSiNecessaire(ordre) {
  if (ordre.origine !== 'Corrective') return
  const actif = mockActifs.find((a) => a.id === ordre.actifId)
  if (actif?.criticite !== 'Critique') return

  mockFichesAnalysePostIncident.push({
    id: `fapi-${Date.now()}`,
    ordreTravailId: ordre.id,
    actifId: ordre.actifId,
    dateCreation: new Date().toISOString().slice(0, 10),
    causeIdentifiee: ordre.compteRendu?.causeIdentifiee || '—',
    actionPreventiveEnvisagee: '',
  })
}

// Clôture d'un OT préventif (US-03, section 3.4, étape 4) : avance l'échéance
// du plan pour cet actif, et reporte les préconisations éventuelles comme item
// optionnel de la checklist pour le prochain cycle.
async function avancerEcheancePreventive(ordre) {
  const echeance = mockEcheancesPlan.find((e) => e.planPreventifId === ordre.planPreventifId && e.actifId === ordre.actifId)
  const plan = mockPlansPreventifs.find((p) => p.id === ordre.planPreventifId)
  if (echeance && plan) {
    echeance.prochaineEcheance = avancerEcheance(echeance.prochaineEcheance, plan.frequence)
  }
  const preconisations = ordre.compteRendu?.preconisations
  if (preconisations && preconisations.trim() && plan) {
    plan.checklist.push({
      id: `ck-${Date.now()}`,
      libelle: `À surveiller (préconisation OT ${ordre.numero}) : ${preconisations.trim()}`,
      obligatoire: false,
    })
  }
}

// Calcul automatique de la mesure SLA à la clôture d'un OT, et de la pénalité
// contractuelle si le délai réel dépasse le seuil de la règle (US-04, AC 3 et 4).
async function genererMesureSlaEtPenalite(ordre) {
  const actif = mockActifs.find((a) => a.id === ordre.actifId)
  const trouve = trouverSlaRuleApplicable(actif)
  if (!trouve || !ordre.dateOuverture || !ordre.dateCloture) return
  const { regle, contrat } = trouve

  const dejaMesure = mockSlaMeasures.some((m) => m.ordreTravailId === ordre.id)
  if (dejaMesure) return

  const heuresReelles = Math.max(0, Math.round(
    (new Date(ordre.dateCloture) - new Date(ordre.dateOuverture)) / (1000 * 60 * 60)
  ))
  const conforme = heuresReelles <= regle.delaiResolutionHeures
  const mesure = {
    id: `slam-${Date.now()}`,
    slaRuleId: regle.id,
    ordreTravailId: ordre.id,
    dateMesure: ordre.dateCloture,
    delaiReponseReelHeures: heuresReelles,
    delaiResolutionReelHeures: heuresReelles,
    conforme,
  }
  mockSlaMeasures.push(mesure)

  if (!conforme && contrat) {
    const montant = Math.round((contrat.valeur || 0) * (regle.penalitePourcentage / 100))
    const penalite = {
      id: `pen-${Date.now()}`,
      slaMeasureId: mesure.id,
      contratId: contrat.id,
      montant,
      motif: `Dépassement du délai de résolution (${heuresReelles}h au lieu de ${regle.delaiResolutionHeures}h prévues) — ${regle.nom}.`,
      statut: 'En attente',
      dateApplication: ordre.dateCloture,
    }
    mockPenalites.push(penalite)

    const validation = {
      id: `vp-${Date.now()}`,
      penaliteId: penalite.id,
      fournisseurId: contrat.fournisseurId,
      montant,
      statut: 'En attente',
      validateur1: null,
      validateur2: null,
      dateValidation: null,
    }
    mockValidationsPaiement.push(validation)

    mockTachesWorkflow.push({
      id: `twf-${Date.now()}`,
      titre: `Valider la pénalité SLA — ${regle.nom}`,
      type: 'Validation SLA',
      assigneA: 'Direction Financière',
      statut: 'À faire',
      dateEcheance: new Date().toISOString().slice(0, 10),
    })

    mockAlertesAutomatiques.push({
      id: `alr-${Date.now()}`,
      titre: 'Non-conformité SLA détectée à la clôture d\'un OT',
      niveau: 'Critique',
      source: 'Moteur SLA',
      date: ordre.dateCloture,
      lu: false,
      description: `L'OT "${ordre.titre}" a dépassé le délai de résolution contractuel (${regle.nom}).`,
      sourceId: `sla-non-conforme-${ordre.id}`,
    })
  }
}

export async function cocherItemChecklist(id, itemId, coche) {
  const ordre = mockOrdresTravail.find((o) => o.id === id)
  const item = ordre?.checklist.find((c) => c.id === itemId)
  if (item) item.coche = coche
  return simulateDelay(ordre)
}

export async function ajouterPieceJointeOrdreTravail(id, nomFichier) {
  const ordre = mockOrdresTravail.find((o) => o.id === id)
  if (ordre) {
    ordre.piecesJointes.push({
      id: `pj-${Date.now()}`,
      nomFichier,
      dateAjout: new Date().toISOString().slice(0, 10),
    })
  }
  return simulateDelay(ordre)
}

// ---- Historique des ordres de travail -----------------------------------------
export async function getHistoriqueOrdreTravail() {
  return simulateDelay(mockHistoriqueOrdreTravail)
}

// ---- Fiches d'analyse post-incident (US-02) et rapports mensuels (US-03) ------
export async function getFichesAnalysePostIncident() {
  return simulateDelay(mockFichesAnalysePostIncident)
}

export async function getRapportsMensuels() {
  return simulateDelay(mockRapportsMensuels)
}

// ---- Tickets ------------------------------------------------------------------
export async function getTickets() {
  const rows = await portalGet('fmaint_tickets', '?$select=fmaint_ticketid,fmaint_titre,fmaint_description,statecode,_fmaint_agenceid_value,fmaint_urgence,_fmaint_ordredetravailid_value')
  return rows.map((r) => ({
    id: r.fmaint_ticketid,
    titre: r.fmaint_titre,
    description: r.fmaint_description,
    statut: getFormatted(r, 'statecode') || 'Ouvert',
    emplacementId: r._fmaint_agenceid_value,
    urgence: getFormatted(r, 'fmaint_urgence') || 'Moyenne',
    ordreTravailId: r._fmaint_ordredetravailid_value || null,
    piecesJointes: [],
  }))
}
const URGENCE_CODES = { Faible: 607570000, Moyenne: 607570001, Haute: 607570002 }
const URGENCE_LABELS = { 607570000: 'Faible', 607570001: 'Moyenne', 607570002: 'Haute' }
export async function createTicket(nouveauTicket) {
  const payload = {
    fmaint_titre: nouveauTicket.titre,
    fmaint_description: nouveauTicket.description || '',
    fmaint_urgence: URGENCE_CODES[nouveauTicket.urgence] || URGENCE_CODES.Moyenne,
  }
  if (nouveauTicket.emplacementId) {
    payload['fmaint_AgenceID@odata.bind'] = `/fmaint_agences(${nouveauTicket.emplacementId})`
  }
  const r = await portalPost('fmaint_tickets', payload)
  return {
    id: r.fmaint_ticketid,
    titre: r.fmaint_titre,
    description: r.fmaint_description,
    statut: getFormatted(r, 'statecode') || 'Ouvert',
    emplacementId: r._fmaint_agenceid_value || nouveauTicket.emplacementId || null,
    urgence: URGENCE_LABELS[r.fmaint_urgence] || nouveauTicket.urgence || 'Moyenne',
    ordreTravailId: null,
    piecesJointes: [],
  }
}

export async function updateTicketStatut(id, statut) {
  const ticket = mockTickets.find((t) => t.id === id)
  if (ticket) ticket.statut = statut
  return simulateDelay(ticket)
}

// Rattache l'OT créé à partir d'un ticket (US-03, portail self-service -> OT correctif).
// Écrit réellement dans Dataverse (fmaint_ordredetravailid, colonne lookup) —
// avant, cette fonction ne mutait que mockTickets, un tableau jamais relu
// (getTickets relit toujours Dataverse), donc le lien ne persistait jamais.
export async function relierTicketAOrdre(id, ordreTravailId) {
  await portalPatch('fmaint_tickets', id, {
    'fmaint_OrdreDeTravailID@odata.bind': `/fmaint_ordredetravails(${ordreTravailId})`,
  })
  return { id, ordreTravailId }
}

export async function ajouterPieceJointeTicket(id, nomFichier) {
  const ticket = mockTickets.find((t) => t.id === id)
  if (ticket) {
    ticket.piecesJointes.push({
      id: `pj-${Date.now()}`,
      nomFichier,
      dateAjout: new Date().toISOString().slice(0, 10),
    })
  }
  return simulateDelay(ticket)
}

// ---- Discussion sur ticket (table Dataverse fmaint_commentaireticket, accès authentifié) --
export async function getCommentairesTicket(ticketId) {
  const rows = await portalGet(
    'fmaint_commentairetickets',
    `?$select=fmaint_commentaireticketid,fmaint_message,fmaint_auteur,fmaint_estreponsebanque,createdon&$filter=_fmaint_ticketid_value eq ${ticketId}&$orderby=createdon asc`,
  )
  return rows.map((r) => ({
    id: r.fmaint_commentaireticketid,
    message: r.fmaint_message,
    auteur: r.fmaint_auteur,
    estReponseBanque: !!r.fmaint_estreponsebanque,
    date: r.createdon,
  }))
}

export async function createCommentaireTicket(ticketId, message, auteur, estReponseBanque = false) {
  const r = await portalPost('fmaint_commentairetickets', {
    fmaint_message: message,
    fmaint_auteur: auteur,
    fmaint_estreponsebanque: estReponseBanque,
    'fmaint_TicketID@odata.bind': `/fmaint_tickets(${ticketId})`,
  })
  return {
    id: r.fmaint_commentaireticketid,
    message: r.fmaint_message,
    auteur: r.fmaint_auteur,
    estReponseBanque: !!r.fmaint_estreponsebanque,
    date: r.createdon,
  }
}

// ---- Maintenance préventive -----------------------------------------------------
// Un plan est un modèle (US-03, section 3.2) ; les échéances réelles par actif
// vivent dans echeancesPlan, créées à l'activation du plan (validerPlanPreventif).
export async function getPlansPreventifs() {
  return simulateDelay(mockPlansPreventifs)
}

export async function getEcheancesPlan() {
  return simulateDelay(mockEcheancesPlan)
}

export async function createPlanPreventif(nouveauPlan) {
  const plan = {
    id: `pm-${Date.now()}`,
    type: 'Calendaire',
    etatCycleVie: 'Brouillon',
    checklist: [],
    dureeEstimee: 0,
    coutEstime: 0,
    prestataireParDefautId: null,
    piecesJointes: [],
    ...nouveauPlan,
  }
  mockPlansPreventifs.push(plan)
  return simulateDelay(plan)
}

export async function updatePlanPreventif(id, changements) {
  const plan = mockPlansPreventifs.find((p) => p.id === id)
  if (plan) Object.assign(plan, changements)
  return simulateDelay(plan)
}

// Activation d'un plan (workflows v2.0, section 3.3, étape 6) : génère une
// échéance par actif couvert, étalée sur la période de fréquence quand le plan
// cible une famille entière (évite un pic d'OT à l'activation — point
// d'attention 3.6). Un plan de famille criticité Critique ou une surcharge sur
// un actif individuel nécessite un validateur "Responsable DMG" côté UI ; ici
// on trace simplement qui a validé.
export async function validerPlanPreventif(id, validateur, dateDebut) {
  const plan = mockPlansPreventifs.find((p) => p.id === id)
  if (!plan || plan.etatCycleVie === 'Actif') return simulateDelay(plan)

  const actifsCibles = plan.actifId
    ? mockActifs.filter((a) => a.id === plan.actifId)
    : mockActifs.filter((a) => a.categorieId === plan.categorieId)

  const periodeJours = joursDeLaPeriode(plan.frequence)
  const base = dateDebut ? new Date(dateDebut) : new Date()
  actifsCibles.forEach((actif, index) => {
    const offsetJours = actifsCibles.length > 1 ? Math.floor((index * periodeJours) / actifsCibles.length) : 0
    const echeance = new Date(base)
    echeance.setDate(echeance.getDate() + offsetJours)
    mockEcheancesPlan.push({
      id: `ech-${Date.now()}-${index}`,
      planPreventifId: plan.id,
      actifId: actif.id,
      prochaineEcheance: echeance.toISOString().slice(0, 10),
    })
  })

  plan.etatCycleVie = 'Actif'
  await ajouterAudit({
    action: `Plan préventif "${plan.nom}" activé par ${validateur} (${actifsCibles.length} actif(s) couvert(s))`,
    entite: 'planPreventif', entiteId: id, auteur: validateur, details: plan.nom,
  })
  return simulateDelay(plan)
}

// Fenêtre de planification ±30 % autour de l'échéance (US-03, section 3.4,
// étape 2). Hors fenêtre : ne bloque pas, mais déclenche une escalade.
export async function proposerDateIntervention(id, date, auteur = 'Système') {
  const ordre = mockOrdresTravail.find((o) => o.id === id)
  if (ordre) ordre.dateInterventionProposee = date
  return simulateDelay(ordre)
}

export async function validerDateIntervention(id, date, auteur = 'Système') {
  const ordre = mockOrdresTravail.find((o) => o.id === id)
  if (!ordre) return simulateDelay(null)
  const plan = mockPlansPreventifs.find((p) => p.id === ordre.planPreventifId)
  ordre.dateInterventionValidee = date

  if (plan) {
    const periodeJours = joursDeLaPeriode(plan.frequence)
    const toleranceJours = periodeJours * 0.3
    const ecartJours = Math.abs((new Date(date) - new Date(ordre.dateEcheance)) / 86400000)
    if (ecartJours > toleranceJours) {
      mockAlertesAutomatiques.push({
        id: `alr-${Date.now()}`,
        titre: `Date d'intervention hors fenêtre — ${ordre.numero}`,
        niveau: 'Avertissement',
        source: 'Planification préventive',
        date: new Date().toISOString().slice(0, 10),
        lu: false,
        description: `La date proposée (${date}) dépasse la fenêtre de tolérance ±30 % autour de l'échéance du ${ordre.dateEcheance}.`,
        sourceId: `hors-fenetre-${ordre.id}`,
      })
      mockTachesWorkflow.push({
        id: `twf-${Date.now()}`,
        titre: `Date hors fenêtre à arbitrer — ${ordre.numero}`,
        type: 'Escalade planification',
        assigneA: 'Gestionnaire DMG',
        statut: 'À faire',
        dateEcheance: new Date().toISOString().slice(0, 10),
      })
    }
  }
  return simulateDelay(ordre)
}

// Bascule vers un OT correctif quand une anomalie est détectée pendant une
// intervention préventive (US-03, étape 3, point d'attention 3.6).
export async function signalerAnomaliePreventif(otPreventifId, description) {
  const otSource = mockOrdresTravail.find((o) => o.id === otPreventifId)
  if (!otSource) return null

  return createOrdreTravail({
    titre: `Anomalie détectée pendant OT préventif ${otSource.numero} — ${description}`,
    description,
    priorite: 'Haute',
    origine: 'Corrective',
    otPreventifSourceId: otSource.id,
    actifId: otSource.actifId,
  })
}

// ---- Fournisseurs -----------------------------------------------------------------
export async function getFournisseurs() {
  return simulateDelay(mockFournisseurs)
}

export async function createFournisseur(nouveauFournisseur) {
  const fournisseur = { id: `frs-${Date.now()}`, ...nouveauFournisseur }
  mockFournisseurs.push(fournisseur)
  return simulateDelay(fournisseur)
}

// ---- Contrats -----------------------------------------------------------------
export async function getContrats() {
  return simulateDelay(mockContrats)
}

export async function createContrat(nouveauContrat) {
  const contrat = { id: `ctr-${Date.now()}`, actifsCouverts: [], ...nouveauContrat }
  mockContrats.push(contrat)
  return simulateDelay(contrat)
}

// ============================================================================
// MODULES AFRILAND
// ============================================================================

// ---- Règles SLA -----------------------------------------------------------------
export async function getSlaRules() {
  return simulateDelay(mockSlaRules)
}

export async function createSlaRule(nouvelleRegle) {
  const regle = { id: `slar-${Date.now()}`, actif: true, ...nouvelleRegle }
  mockSlaRules.push(regle)
  return simulateDelay(regle)
}

// ---- Mesures SLA ------------------------------------------------------------------
export async function getSlaMeasures() {
  return simulateDelay(mockSlaMeasures)
}

export async function createSlaMeasure(nouvelleMesure) {
  const conforme = nouvelleMesure.delaiResolutionReelHeures <= nouvelleMesure.delaiResolutionSeuilHeures
  const mesure = { id: `slam-${Date.now()}`, conforme, ...nouvelleMesure }
  delete mesure.delaiResolutionSeuilHeures
  mockSlaMeasures.push(mesure)
  return simulateDelay(mesure)
}

// ---- Pénalités SLA ------------------------------------------------------------------
export async function getPenalites() {
  return simulateDelay(mockPenalites)
}

export async function createPenalite(nouvellePenalite) {
  const penalite = { id: `pen-${Date.now()}`, statut: 'En attente', ...nouvellePenalite }
  mockPenalites.push(penalite)
  return simulateDelay(penalite)
}

export async function updatePenaliteStatut(id, statut) {
  const penalite = mockPenalites.find((p) => p.id === id)
  if (penalite) {
    penalite.statut = statut
    await ajouterAudit({
      action: `Pénalité — statut changé en "${statut}"`,
      entite: 'penalite',
      entiteId: id,
      auteur: 'Direction Financière',
      details: penalite.motif,
    })
  }
  return simulateDelay(penalite)
}

// ---- Validations de paiement --------------------------------------------------------
export async function getValidationsPaiement() {
  return simulateDelay(mockValidationsPaiement)
}

// Workflow d'approbation avec double validation au-delà d'un seuil de montant
// (US-04, dernier critère d'acceptation) : sous le seuil, un seul valideur suffit ;
// au-dessus, il faut deux valideurs distincts avant de passer le statut à 'Validé'.
export async function updateValidationPaiementStatut(id, statut, validateur) {
  const validation = mockValidationsPaiement.find((v) => v.id === id)
  if (validation) {
    if (statut === 'Validé' && validation.montant > SEUIL_DOUBLE_VALIDATION) {
      if (!validation.validateur1) {
        validation.validateur1 = validateur
      } else if (!validation.validateur2 && validateur !== validation.validateur1) {
        validation.validateur2 = validateur
        validation.statut = 'Validé'
        validation.dateValidation = new Date().toISOString().slice(0, 10)
      }
      // Si un seul valideur distinct a signé pour l'instant, le statut reste 'En attente'
      // (deuxième contrôle requis) — on ne le force donc pas ici.
    } else {
      validation.statut = statut
      validation.validateur1 = validateur || validation.validateur1
      if (statut === 'Validé') validation.dateValidation = new Date().toISOString().slice(0, 10)
    }
    await ajouterAudit({
      action: `Validation de paiement — ${validation.statut} (par ${validateur})`,
      entite: 'validationPaiement',
      entiteId: id,
      auteur: validateur,
      details: `Montant ${validation.montant.toLocaleString('fr-FR')} FCFA.`,
    })
  }
  return simulateDelay(validation)
}

// ---- Évaluations prestataires ------------------------------------------------------
export async function getEvaluationsPrestataires() {
  return simulateDelay(mockEvaluationsPrestataires)
}

export async function createEvaluationPrestataire(nouvelleEvaluation) {
  const evaluation = { id: `eval-${Date.now()}`, date: new Date().toISOString().slice(0, 10), ...nouvelleEvaluation }
  mockEvaluationsPrestataires.push(evaluation)
  return simulateDelay(evaluation)
}

// ---- Clés et accès -----------------------------------------------------------------
export async function getCles() {
  return simulateDelay(mockCles)
}

export async function createCle(nouvelleCle) {
  const cle = { id: `cle-${Date.now()}`, statut: 'Disponible', detenteurActuel: null, ...nouvelleCle }
  mockCles.push(cle)
  return simulateDelay(cle)
}

export async function getMouvementsCles() {
  return simulateDelay(mockMouvementsCles)
}

// Un retrait sur une clé de zone classifiée 'Élevée' exige deux valideurs distincts
// avant que le retrait soit effectif (US-05, critère d'acceptation 2).
export async function createMouvementCle(nouveauMouvement) {
  const cle = mockCles.find((c) => c.id === nouveauMouvement.cleId)
  const exigeDoubleValidation = cle?.classification === 'Élevée' && nouveauMouvement.action === 'Retrait'
  if (exigeDoubleValidation) {
    const { valideur1, valideur2 } = nouveauMouvement
    if (!valideur1 || !valideur2 || valideur1 === valideur2) {
      throw new Error('Deux valideurs distincts sont requis pour retirer une clé de zone classifiée Élevée.')
    }
  }

  const mouvement = { id: `mvc-${Date.now()}`, date: new Date().toISOString().slice(0, 10), ...nouveauMouvement }
  mockMouvementsCles.push(mouvement)

  if (cle) {
    if (nouveauMouvement.action === 'Retrait') {
      cle.statut = 'En possession'
      cle.detenteurActuel = nouveauMouvement.personne
    } else if (nouveauMouvement.action === 'Retour') {
      cle.statut = 'Disponible'
      cle.detenteurActuel = null
    } else if (nouveauMouvement.action === 'Perte signalée') {
      cle.statut = 'Perdue'
    }
  }

  await ajouterAudit({
    action: `Mouvement de clé — ${nouveauMouvement.action}${exigeDoubleValidation ? ' (zone classifiée, double validation)' : ''}`,
    entite: 'cle',
    entiteId: nouveauMouvement.cleId,
    auteur: nouveauMouvement.personne,
    details: exigeDoubleValidation
      ? `Double validation : ${nouveauMouvement.valideur1} / ${nouveauMouvement.valideur2}.`
      : (nouveauMouvement.commentaire || '—'),
  })

  return simulateDelay(mouvement)
}

// ---- Projets immobiliers ----------------------------------------------------------
export async function getProjetsImmobiliers() {
  return simulateDelay(mockProjetsImmobiliers)
}

export async function createProjetImmobilier(nouveauProjet) {
  const projet = { id: `proj-${Date.now()}`, statut: 'Planifié', ...nouveauProjet }
  mockProjetsImmobiliers.push(projet)
  return simulateDelay(projet)
}

export async function getJalonsProjets() {
  return simulateDelay(mockJalonsProjets)
}

export async function createJalonProjet(nouveauJalon) {
  const jalon = { id: `jal-${Date.now()}`, statut: 'À venir', ...nouveauJalon }
  mockJalonsProjets.push(jalon)
  return simulateDelay(jalon)
}

export async function updateJalonProjet(id, statut) {
  const jalon = mockJalonsProjets.find((j) => j.id === id)
  if (jalon) jalon.statut = statut
  return simulateDelay(jalon)
}

export async function updateProjetBudgetConsomme(id, montantDepense) {
  const projet = mockProjetsImmobiliers.find((p) => p.id === id)
  if (projet) projet.budgetConsomme = (projet.budgetConsomme || 0) + montantDepense
  return simulateDelay(projet)
}

// Bascule automatique en exploitation à la réception d'un projet (US-07, dernier
// critère d'acceptation) : crée le nouvel emplacement dans le référentiel patrimoine
// et active un plan de maintenance préventive générique pour ce nouveau site.
export async function receptionnerProjet(id) {
  const projet = mockProjetsImmobiliers.find((p) => p.id === id)
  if (!projet) return null

  projet.statut = 'Terminé'

  const emplacementParent = mockEmplacements.find((e) => e.id === projet.emplacementId)
  const nouvelEmplacement = {
    id: `emp-${Date.now()}`,
    nom: projet.nom,
    type: projet.typeProjet === 'Extension' ? 'Salle' : 'Agence',
    parentId: emplacementParent?.id || null,
  }
  mockEmplacements.push(nouvelEmplacement)

  const plan = {
    id: `pm-${Date.now()}`,
    nom: `Entretien général — ${projet.nom}`,
    description: 'Plan de maintenance préventive activé automatiquement à la réception du projet.',
    type: 'Calendaire',
    etatCycleVie: 'Actif',
    frequence: 'Trimestrielle',
    checklist: [],
    dureeEstimee: 0,
    coutEstime: 0,
    prestataireParDefautId: null,
    piecesJointes: [],
    actifId: null,
    categorieId: null,
  }
  mockPlansPreventifs.push(plan)

  mockAlertesAutomatiques.push({
    id: `alr-${Date.now()}`,
    titre: `Projet réceptionné — bascule en exploitation`,
    niveau: 'Info',
    source: 'Suivi de projets',
    date: new Date().toISOString().slice(0, 10),
    lu: false,
    description: `"${projet.nom}" a été réceptionné : le site "${nouvelEmplacement.nom}" est désormais au référentiel patrimoine et un plan de maintenance préventive a été activé.`,
    sourceId: `reception-${projet.id}`,
  })

  return simulateDelay({ projet, emplacement: nouvelEmplacement, plan })
}

// ---- Tâches workflow ----------------------------------------------------------------
export async function getTachesWorkflow() {
  return simulateDelay(mockTachesWorkflow)
}

export async function updateTacheWorkflowStatut(id, statut) {
  const tache = mockTachesWorkflow.find((t) => t.id === id)
  if (tache) tache.statut = statut
  return simulateDelay(tache)
}

// ---- Alertes automatiques ------------------------------------------------------------
export async function getAlertesAutomatiques() {
  return simulateDelay(mockAlertesAutomatiques)
}

export async function marquerAlerteLue(id) {
  const alerte = mockAlertesAutomatiques.find((a) => a.id === id)
  if (alerte) alerte.lu = true
  return simulateDelay(alerte)
}

// ---- Pièces de rechange (Gestion de la logistique) -----------------------------------
export async function getPiecesRechange() {
  return simulateDelay(mockPiecesRechange)
}

export async function createPieceRechange(nouvellePiece) {
  const piece = { id: `pr-${Date.now()}`, quantiteStock: 0, ...nouvellePiece }
  mockPiecesRechange.push(piece)
  return simulateDelay(piece)
}

export async function getMouvementsStock() {
  return simulateDelay(mockMouvementsStock)
}

export async function createMouvementStock(nouveauMouvement) {
  const mouvement = { id: `mvs-${Date.now()}`, date: new Date().toISOString().slice(0, 10), ...nouveauMouvement }
  mockMouvementsStock.push(mouvement)

  const piece = mockPiecesRechange.find((p) => p.id === nouveauMouvement.pieceId)
  if (piece) {
    if (nouveauMouvement.type === 'Entrée') piece.quantiteStock += nouveauMouvement.quantite
    else piece.quantiteStock = Math.max(0, piece.quantiteStock - nouveauMouvement.quantite)
  }
  return simulateDelay(mouvement)
}

// ---- Consommations d'énergie (Gestion de l'énergie) ----------------------------------
export async function getConsommationsEnergie() {
  return simulateDelay(mockConsommationsEnergie)
}

export async function createConsommationEnergie(nouvelleConso) {
  const conso = { id: `nrj-${Date.now()}`, ...nouvelleConso }
  mockConsommationsEnergie.push(conso)
  return simulateDelay(conso)
}

// ---- Utilisateurs & rôles (table Dataverse fmaint_utilisateur, accès authentifié) ------
function mapUtilisateur(r) {
  return {
    id: r.fmaint_utilisateurid,
    nom: r.fmaint_nom,
    email: r.fmaint_email,
    role: r.fmaint_role,
    statut: r.fmaint_statut,
    siteId: r._fmaint_siteid_value || null,
  }
}

const CHAMPS_UTILISATEUR = 'fmaint_utilisateurid,fmaint_nom,fmaint_email,fmaint_role,fmaint_statut,_fmaint_siteid_value'

export async function getUtilisateurs() {
  const rows = await portalGet('fmaint_utilisateurs', `?$select=${CHAMPS_UTILISATEUR}`)
  return rows.map(mapUtilisateur)
}

export async function createUtilisateur(nouvelUtilisateur) {
  const payload = {
    fmaint_nom: nouvelUtilisateur.nom,
    fmaint_email: nouvelUtilisateur.email,
    fmaint_role: nouvelUtilisateur.role,
    fmaint_statut: nouvelUtilisateur.statut || 'Actif',
  }
  if (nouvelUtilisateur.siteId) payload['fmaint_SiteID@odata.bind'] = `/fmaint_emplacements(${nouvelUtilisateur.siteId})`
  const r = await portalPost('fmaint_utilisateurs', payload)
  return mapUtilisateur(r)
}

export async function updateUtilisateurRole(id, role) {
  const r = await portalPatch('fmaint_utilisateurs', id, { fmaint_role: role })
  return mapUtilisateur(r)
}

export async function updateUtilisateurStatut(id, statut) {
  const r = await portalPatch('fmaint_utilisateurs', id, { fmaint_statut: statut })
  return mapUtilisateur(r)
}

// Retrouve l'utilisateur courant par email (identité fournie par Entra ID via
// getPortalUser()), ou le crée avec le rôle le moins privilégié par défaut —
// c'est cette fonction qui répond à "créer un utilisateur quand il se connecte".
export async function getOrCreateUtilisateurCourant(email, nomPropose) {
  const emailEchappe = email.replace(/'/g, "''")
  const rows = await portalGet('fmaint_utilisateurs', `?$select=${CHAMPS_UTILISATEUR}&$filter=fmaint_email eq '${emailEchappe}'`)
  if (rows.length) return mapUtilisateur(rows[0])
  return createUtilisateur({ nom: nomPropose || email, email, role: 'Opérateur DMG', statut: 'Actif' })
}

// ---- Journal d'audit (US-05) ---------------------------------------------------------
// Append-only : aucune fonction d'update/delete n'est exposée, seule l'ajout l'est.
export async function getJournalAudit() {
  return simulateDelay(mockJournalAudit)
}

export async function ajouterAudit(entree) {
  const ligne = {
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: new Date().toISOString().slice(0, 10),
    ...entree,
  }
  mockJournalAudit.push(ligne)
  return simulateDelay(ligne)
}