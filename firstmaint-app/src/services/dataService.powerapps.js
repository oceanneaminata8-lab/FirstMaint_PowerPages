// Variante Power Apps Code App de dataService.js : mêmes 7 fonctions de
// lecture/écriture réelles, mais branchées sur le connecteur Dataverse généré
// (@microsoft/power-apps/data) au lieu du Web API Power Pages (portalApi.js).
// Tout le reste (mockData.js) est ré-exporté tel quel depuis dataService.js.
//
// Sélectionné au build via l'alias Vite dans vite.config.powerapps.js — le
// build Power Pages (vite.config.js par défaut) ne référence jamais ce fichier.

export * from './dataService.js'

import { MicrosoftDataverseService } from '../generated/services/MicrosoftDataverseService'
import { getFormatted } from './portalApi.js'
import {
  mockActifs,
  mockOrdresTravail,
  mockEmplacements,
  mockCategories,
  dateEcheanceParCriticite,
  prochainNumeroOt,
  ajouterAudit,
  genererProchainCodeInventaire,
  STATUT_ACTIF_CODES,
  TYPE_EMPLACEMENT_CODES,
} from './dataService.js'

const PREFER_FORMATTED_VALUES = 'odata.include-annotations="OData.Community.Display.V1.FormattedValue"'

// Le connecteur générique "Microsoft Dataverse" peut renvoyer chaque ligne
// soit à plat, soit enveloppée dans `dynamicProperties` selon la version —
// on gère les deux formes plutôt que de supposer laquelle s'applique ici.
function unwrap(row) {
  return row?.dynamicProperties || row
}

async function listRecords(entityName, select, filter, orderby) {
  const result = await MicrosoftDataverseService.ListRecords(entityName, PREFER_FORMATTED_VALUES, 'application/json', undefined, select, filter, orderby)
  if (!result.success) {
    throw new Error(result.error?.message || `Dataverse — échec de lecture "${entityName}".`)
  }
  return (result.data?.value || []).map(unwrap)
}

async function createRecord(entityName, item) {
  const result = await MicrosoftDataverseService.CreateRecord(
    `return=representation, ${PREFER_FORMATTED_VALUES}`,
    'application/json',
    entityName,
    item,
  )
  if (!result.success) {
    throw new Error(result.error?.message || `Dataverse — échec de création dans "${entityName}".`)
  }
  return unwrap(result.data)
}

async function updateRecord(entityName, recordId, item) {
  const result = await MicrosoftDataverseService.UpdateRecord(
    `return=representation, ${PREFER_FORMATTED_VALUES}`,
    'application/json',
    entityName,
    recordId,
    item,
  )
  if (!result.success) {
    throw new Error(result.error?.message || `Dataverse — échec de mise à jour dans "${entityName}".`)
  }
  return unwrap(result.data)
}

// ---- Emplacements ----------------------------------------------------------
export async function getEmplacements() {
  const rows = await listRecords('fmaint_emplacements', 'fmaint_emplacementid,fmaint_nom,fmaint_type,_fmaint_emplacementparent_value')
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
  const r = await createRecord('fmaint_emplacements', payload)

  const emplacement = { parentId: null, ...nouvelEmplacement, id: r.fmaint_emplacementid }
  mockEmplacements.push(emplacement)
  return emplacement
}

// ---- Catégories d'actif -----------------------------------------------------
export async function getCategoriesActif() {
  const rows = await listRecords('fmaint_categoriedactifs', 'fmaint_categoriedactifid,fmaint_nomdelacategorie,fmaint_description')
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
  const r = await createRecord('fmaint_categoriedactifs', payload)

  const categorie = { ...nouvelleCategorie, id: r.fmaint_categoriedactifid }
  mockCategories.push(categorie)
  return categorie
}

// ---- Agences -----------------------------------------------------------------
export async function getAgences() {
  const rows = await listRecords('fmaint_agences', 'fmaint_agenceid,fmaint_nomagence,fmaint_telephone')
  return rows.map((r) => ({
    id: r.fmaint_agenceid,
    nom: r.fmaint_nomagence,
    telephone: r.fmaint_telephone || '',
  }))
}

// ---- Techniciens --------------------------------------------------------------
export async function getTechniciens() {
  const rows = await listRecords('fmaint_techniciens', 'fmaint_technicienid,fmaint_nomtechnicien,fmaint_telephone')
  return rows.map((r) => ({
    id: r.fmaint_technicienid,
    nom: r.fmaint_nomtechnicien,
    telephone: r.fmaint_telephone || '',
  }))
}

// ---- Actifs -----------------------------------------------------------------
export async function getActifs() {
  const rows = await listRecords('fmaint_actifs', 'fmaint_actifid,fmaint_nom,fmaint_numerodeserie,fmaint_statut,_fmaint_emplacementid_value,_fmaint_categoriedactifid_value,fmaint_datedacquisition,fmaint_datedefindegarantie,fmaint_valeur')
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
    etatCycleVie: 'Actif',
    criticite: 'Moyenne',
    codeInventaire: null,
    piecesJointes: [],
  }))
}

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
  const r = await createRecord('fmaint_actifs', payload)

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
  return actif
}

export async function updateActifStatut(id, statut) {
  const code = STATUT_ACTIF_CODES[statut]
  if (code !== undefined) {
    await updateRecord('fmaint_actifs', id, { fmaint_statut: code })
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
  return actif
}

// ---- Ordres de travail -------------------------------------------------------
export async function getOrdresTravail() {
  const rows = await listRecords('fmaint_ordredetravails', 'fmaint_ordredetravailid,fmaint_nomordre,statecode,fmaint_urgent,_fmaint_technicienid_value,_fmaint_actifid_value,fmaint_dateintervention,fmaint_dureeheures')
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

// Création réelle dans Dataverse — même compromis que dataService.js : seul
// le lien vers Actif est persisté à la création, le reste du cycle de vie
// continue d'opérer sur mockOrdresTravail (partagé avec dataService.js via
// l'export de référence, cf. import ci-dessus).
export async function createOrdreTravail(nouvelOrdre) {
  const actif = mockActifs.find((a) => a.id === nouvelOrdre.actifId)
  const origine = nouvelOrdre.origine || 'Corrective'
  const dateEcheance = nouvelOrdre.dateEcheance
    || (origine === 'Corrective' ? dateEcheanceParCriticite(actif?.criticite) : null)
  const numero = prochainNumeroOt(origine)

  const payload = {
    fmaint_nomordre: nouvelOrdre.titre || numero,
    fmaint_urgent: nouvelOrdre.priorite === 'Critique',
  }
  if (dateEcheance) payload.fmaint_dateintervention = dateEcheance
  if (nouvelOrdre.actifId) payload['fmaint_ActifID@odata.bind'] = `/fmaint_actifs(${nouvelOrdre.actifId})`
  const r = await createRecord('fmaint_ordredetravails', payload)

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
  return ordre
}

// ---- Tickets ------------------------------------------------------------------
export async function getTickets() {
  const rows = await listRecords('fmaint_tickets', 'fmaint_ticketid,fmaint_titre,fmaint_description,statecode,_fmaint_agenceid_value,fmaint_urgence,_fmaint_ordredetravailid_value')
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

// Écrit réellement le lien Ticket → OrdreDeTravail (même correction que
// dataService.js : l'ancienne version ne mutait qu'un tableau mock jamais relu).
export async function relierTicketAOrdre(id, ordreTravailId) {
  await updateRecord('fmaint_tickets', id, {
    'fmaint_OrdreDeTravailID@odata.bind': `/fmaint_ordredetravails(${ordreTravailId})`,
  })
  return { id, ordreTravailId }
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
  const r = await createRecord('fmaint_tickets', payload)
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
  const rows = await listRecords('fmaint_utilisateurs', CHAMPS_UTILISATEUR)
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
  const r = await createRecord('fmaint_utilisateurs', payload)
  return mapUtilisateur(r)
}

export async function updateUtilisateurRole(id, role) {
  const r = await updateRecord('fmaint_utilisateurs', id, { fmaint_role: role })
  return mapUtilisateur(r)
}

export async function updateUtilisateurStatut(id, statut) {
  const r = await updateRecord('fmaint_utilisateurs', id, { fmaint_statut: statut })
  return mapUtilisateur(r)
}

// Retrouve l'utilisateur courant par email, ou le crée avec le rôle le moins
// privilégié par défaut — répond à "créer un utilisateur quand il se connecte".
export async function getOrCreateUtilisateurCourant(email, nomPropose) {
  const emailEchappe = email.replace(/'/g, "''")
  const rows = await listRecords('fmaint_utilisateurs', CHAMPS_UTILISATEUR, `fmaint_email eq '${emailEchappe}'`)
  if (rows.length) return mapUtilisateur(rows[0])
  return createUtilisateur({ nom: nomPropose || email, email, role: 'Opérateur DMG', statut: 'Actif' })
}

// ---- Discussion sur ticket (table Dataverse fmaint_commentaireticket, accès authentifié) --
export async function getCommentairesTicket(ticketId) {
  const rows = await listRecords(
    'fmaint_commentairetickets',
    'fmaint_commentaireticketid,fmaint_message,fmaint_auteur,fmaint_estreponsebanque,createdon',
    `_fmaint_ticketid_value eq ${ticketId}`,
    'createdon asc',
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
  const r = await createRecord('fmaint_commentairetickets', {
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
