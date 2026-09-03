// Variante Power Apps Code App de dataService.js, branchée sur le connecteur
// Dataverse généré (@microsoft/power-apps/data).
//
// Sélectionné au build via l'alias Vite dans vite.config.powerapps.js — le
// build Power Pages (vite.config.js par défaut) ne référence jamais ce fichier.

export * from './dataService.js'

import { MicrosoftDataverseService } from '../generated/services/MicrosoftDataverseService'
import { getFormatted } from './portalApi.js'
import {
  dateEcheanceParCriticite,
  STATUT_ACTIF_CODES,
  TYPE_EMPLACEMENT_CODES,
} from './dataService.js'

const PREFER_FORMATTED_VALUES = 'odata.include-annotations="OData.Community.Display.V1.FormattedValue"'
const ORGANIZATION_URL = 'https://org19425b12.crm12.dynamics.com'

// Store organization URL - obtained at initialization time
let organizationUrl = null
let isInitializing = false
let initPromise = null

// Try to extract organization URL from various sources
function extractOrgUrlFromError(error) {
  if (!error) return null

  // Try to extract from error message
  if (error.message) {
    const match = error.message.match(/https:\/\/[a-zA-Z0-9\-]+\.crm\d*\.dynamics\.com/i)
    if (match) return match[0]
  }

  // Try to extract from error data
  if (error.error?.message) {
    const match = error.error.message.match(/https:\/\/[a-zA-Z0-9\-]+\.crm\d*\.dynamics\.com/i)
    if (match) return match[0]
  }

  return null
}

// Initialize organization context
export async function initializeOrganizationContext() {
  // Return cached result if already initialized
  if (organizationUrl) {
    console.log('Using cached organization URL:', organizationUrl)
    return organizationUrl
  }

  // If initialization is in progress, wait for it
  if (isInitializing) {
    return await initPromise
  }

  isInitializing = true

  initPromise = (async () => {
    try {
      console.log('Initializing Dataverse connection...')
      
      // Strategy 1: Try GetOrganizations
      try {
        console.log('Strategy 1: Fetching organizations via GetOrganizations()...')
        const orgsResult = await MicrosoftDataverseService.GetOrganizations()
        
        if (orgsResult?.success && orgsResult?.data?.value?.length > 0) {
          const firstOrg = orgsResult.data.value[0]
          organizationUrl = firstOrg.OrganizationUrl || firstOrg.organizationUrl
          console.log('✓ Strategy 1 SUCCESS - Organization URL:', organizationUrl)
          return organizationUrl
        }
        console.log('Strategy 1 returned no data:', orgsResult)
      } catch (err) {
        console.log('Strategy 1 failed:', err?.message)
      }

      // Strategy 2: Try GetOrganizationsTest
      try {
        console.log('Strategy 2: Fetching organizations via GetOrganizationsTest()...')
        const orgsTestResult = await MicrosoftDataverseService.GetOrganizationsTest()
        
        if (orgsTestResult?.success && orgsTestResult?.data?.value?.length > 0) {
          const firstOrg = orgsTestResult.data.value[0]
          organizationUrl = firstOrg.OrganizationUrl || firstOrg.organizationUrl
          console.log('✓ Strategy 2 SUCCESS - Organization URL:', organizationUrl)
          return organizationUrl
        }
        console.log('Strategy 2 returned no data:', orgsTestResult)
      } catch (err) {
        console.log('Strategy 2 failed:', err?.message)
      }

      // Strategy 3: Try calling GetMetadataForGetEntity to trigger an error that might contain the URL
      try {
        console.log('Strategy 3: Attempting metadata call to extract organization URL from error...')
        const metaResult = await MicrosoftDataverseService.GetMetadataForGetEntity('fmaint_utilisateurs')
        if (metaResult?.success) {
          console.log('Strategy 3: Metadata call succeeded')
        }
      } catch (err) {
        const extractedUrl = extractOrgUrlFromError(err)
        if (extractedUrl) {
          organizationUrl = extractedUrl
          console.log('✓ Strategy 3 SUCCESS - Organization URL extracted from error:', organizationUrl)
          return organizationUrl
        }
        console.log('Strategy 3 failed to extract URL:', err?.message)
      }

      throw new Error('Impossible d\'initialiser la connexion Dataverse.')
    } finally {
      isInitializing = false
    }
  })()

  return await initPromise
}

// Le connecteur générique "Microsoft Dataverse" peut renvoyer chaque ligne
// soit à plat, soit enveloppée dans `dynamicProperties` selon la version —
// on gère les deux formes plutôt que de supposer laquelle s'applique ici.
function unwrap(row) {
  return row?.dynamicProperties || row
}

async function listRecords(entityName, select, filter, orderby) {
  try {
    console.log(`📡 Fetching real data from Dataverse for ${entityName}...`)
    
    const result = await MicrosoftDataverseService.ListRecordsWithOrganization(
      ORGANIZATION_URL,
      entityName,
      PREFER_FORMATTED_VALUES,
      'application/json',
      undefined,
      undefined,
      select,
      filter,
      orderby
    )

    if (result.success) {
      console.log(`✓ Got ${result.data.value.length} records from Dataverse for ${entityName}`)
      return result.data.value.map(unwrap)
    }

    throw new Error(result.error?.message || `Échec de lecture Dataverse pour ${entityName}.`)

  } catch (error) {
    console.error(`❌ Exception reading ${entityName}:`, error.message)
    throw error
  }
}

async function createRecord(entityName, item) {
  try {
    console.log(`💾 Creating record in Dataverse for ${entityName}...`)
    
    const result = await MicrosoftDataverseService.CreateRecordWithOrganization(
      `return=representation, ${PREFER_FORMATTED_VALUES}`,
      'application/json',
      ORGANIZATION_URL,
      entityName,
      item
    )

    if (result.success) {
      console.log(`✓ Record created successfully in ${entityName}`)
      return unwrap(result.data)
    }

    throw new Error(result.error?.message || `Échec de création Dataverse pour ${entityName}.`)
    
  } catch (error) {
    console.error(`❌ Exception creating ${entityName}:`, error.message)
    throw error
  }
}

async function updateRecord(entityName, recordId, item) {
  try {
    console.log(`✏️ Updating record in Dataverse for ${entityName}...`)
    
    const result = await MicrosoftDataverseService.UpdateRecordWithOrganization(
      `return=representation, ${PREFER_FORMATTED_VALUES}`,
      'application/json',
      ORGANIZATION_URL,
      entityName,
      recordId,
      item
    )

    if (result.success) {
      console.log(`✓ Record updated successfully in ${entityName}`)
      return unwrap(result.data)
    }

    throw new Error(result.error?.message || `Échec de mise à jour Dataverse pour ${entityName}.`)
    
  } catch (error) {
    console.error(`❌ Exception updating ${entityName}:`, error.message)
    throw error
  }
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

  return { parentId: null, ...nouvelEmplacement, id: r.fmaint_emplacementid }
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

  return { ...nouvelleCategorie, id: r.fmaint_categoriedactifid }
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
  const codeInventaire = nouvelActif.codeInventaire || `FA-${Date.now()}`

  const payload = {
    fmaint_nom: nouvelActif.nom,
    fmaint_numerodeserie: nouvelActif.numeroSerie || '',
    fmaint_statut: STATUT_ACTIF_CODES[nouvelActif.statut] ?? STATUT_ACTIF_CODES['En service'],
    fmaint_valeur: Number(nouvelActif.valeur) || 0,
    fmaint_codeinventaire: codeInventaire,
  }
  if (nouvelActif.dateAcquisition) payload.fmaint_datedacquisition = nouvelActif.dateAcquisition
  if (nouvelActif.dateFinGarantie) payload.fmaint_datedefindegarantie = nouvelActif.dateFinGarantie
  if (nouvelActif.emplacementId) payload['fmaint_EmplacementID@odata.bind'] = `/fmaint_emplacements(${nouvelActif.emplacementId})`
  if (nouvelActif.categorieId) payload['fmaint_CategoriedactifID@odata.bind'] = `/fmaint_categoriedactifs(${nouvelActif.categorieId})`
  const r = await createRecord('fmaint_actifs', payload)

  const actif = {
    etatCycleVie: 'En saisie',
    piecesJointes: [],
    criticite: nouvelActif.criticite || 'Moyenne',
    ...nouvelActif,
    id: r.fmaint_actifid,
    codeInventaire,
  }
  return actif
}

export async function updateActifStatut(id, statut) {
  const code = STATUT_ACTIF_CODES[statut]
  if (code !== undefined) {
    await updateRecord('fmaint_actifs', id, { fmaint_statut: code })
  }
  return { id, statut }
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

export async function createOrdreTravail(nouvelOrdre) {
  const origine = nouvelOrdre.origine || 'Corrective'
  const dateEcheance = nouvelOrdre.dateEcheance
    || (origine === 'Corrective' ? dateEcheanceParCriticite(nouvelOrdre.criticite) : null)
  const numero = nouvelOrdre.numero || `OT-${Date.now()}`

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
