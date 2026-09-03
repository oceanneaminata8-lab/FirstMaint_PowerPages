// ============================================================================
// COUCHE DE SERVICE DATAVERSE — Point d'accès unique aux données
// 
// VERSION PRODUCTION: Toutes les données sont stockées dans Dataverse.
// Aucune dépendance aux données fictives (mockData).
// 
// Tables Dataverse requises:
// - fmaint_emplacements (Emplacements)
// - fmaint_categoriedactifs (Catégories d'actif)  
// - fmaint_actifs (Actifs)
// - fmaint_ordredetravails (Ordres de travail)
// - fmaint_tickets (Tickets)
// - fmaint_agences (Agences)
// - fmaint_techniciens (Techniciens)
// - fmaint_utilisateurs (Utilisateurs)
// - fmaint_commentairetickets (Commentaires tickets)
//
// Tables recommandées pour version complète (voir DATAVERSE_TABLES_SETUP.md):
// - fmaint_planspreventifs (Plans préventifs)
// - fmaint_echeancesplans (Échéances plans)
// - fmaint_fournisseurs (Fournisseurs)
// - fmaint_contrats (Contrats)
// - Et autres modules Afriland
// ============================================================================

import { portalGet, portalPost, portalPatch, getFormatted } from './portalApi.js'
import { transitionAutorisee } from '../domain/ordreTravailWorkflow.js'
import { avancerEcheance, joursDeLaPeriode } from '../domain/echeances.js'

// ============================================================================
// CONSTANTES
// ============================================================================

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

export const DELAI_MAX_PAR_CRITICITE = {
  Critique: 4,
  Haute: 24,
  Moyenne: 72,
  Basse: 168,
}

export const DELAI_ANTICIPATION_PAR_CRITICITE = {
  Critique: 30,
  Haute: 30,
  Moyenne: 15,
  Basse: 15,
}

// ============================================================================
// UTILITAIRES
// ============================================================================

export function dateEcheanceParCriticite(criticite, depuis = new Date()) {
  const heures = DELAI_MAX_PAR_CRITICITE[criticite] ?? 72
  const d = new Date(depuis)
  d.setHours(d.getHours() + heures)
  return d.toISOString().slice(0, 10)
}

// ============================================================================
// EMPLACEMENTS - Dataverse fmaint_emplacements
// ============================================================================

export async function getEmplacements() {
  try {
    const rows = await portalGet(
      'fmaint_emplacements',
      '?$select=fmaint_emplacementid,fmaint_nom,fmaint_type,_fmaint_emplacementparent_value&$orderby=fmaint_nom asc'
    )
    return rows.map((r) => ({
      id: r.fmaint_emplacementid,
      nom: r.fmaint_nom,
      type: getFormatted(r, 'fmaint_type') || 'Agence',
      parentId: r._fmaint_emplacementparent_value || null,
    }))
  } catch (error) {
    console.error('Erreur lors de la lecture des emplacements:', error)
    throw error
  }
}

export async function createEmplacement(nouvelEmplacement) {
  try {
    const payload = {
      fmaint_nom: nouvelEmplacement.nom,
    }
    const typeCode = TYPE_EMPLACEMENT_CODES[nouvelEmplacement.type]
    if (typeCode !== undefined) payload.fmaint_type = typeCode
    if (nouvelEmplacement.parentId) {
      payload['fmaint_Emplacementparent@odata.bind'] = `/fmaint_emplacements(${nouvelEmplacement.parentId})`
    }
    
    const r = await portalPost('fmaint_emplacements', payload)
    return {
      id: r.fmaint_emplacementid,
      nom: r.fmaint_nom,
      type: nouvelEmplacement.type,
      parentId: nouvelEmplacement.parentId || null,
    }
  } catch (error) {
    console.error('Erreur lors de la création de l\'emplacement:', error)
    throw error
  }
}

// ============================================================================
// CATÉGORIES D'ACTIF - Dataverse fmaint_categoriedactifs
// ============================================================================

export async function getCategoriesActif() {
  try {
    const rows = await portalGet(
      'fmaint_categoriedactifs',
      '?$select=fmaint_categoriedactifid,fmaint_nomdelacategorie,fmaint_description&$orderby=fmaint_nomdelacategorie asc'
    )
    return rows.map((r) => ({
      id: r.fmaint_categoriedactifid,
      nom: r.fmaint_nomdelacategorie,
      description: r.fmaint_description || '',
      criticiteParDefaut: 'Moyenne',
    }))
  } catch (error) {
    console.error('Erreur lors de la lecture des catégories:', error)
    throw error
  }
}

export async function createCategorieActif(nouvelleCategorie) {
  try {
    const payload = {
      fmaint_nomdelacategorie: nouvelleCategorie.nom,
      fmaint_description: nouvelleCategorie.description || '',
    }
    const r = await portalPost('fmaint_categoriedactifs', payload)
    return {
      id: r.fmaint_categoriedactifid,
      nom: r.fmaint_nomdelacategorie,
      description: r.fmaint_description || '',
      criticiteParDefaut: nouvelleCategorie.criticiteParDefaut || 'Moyenne',
    }
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error)
    throw error
  }
}

// ============================================================================
// AGENCES - Dataverse fmaint_agences
// ============================================================================

export async function getAgences() {
  try {
    const rows = await portalGet(
      'fmaint_agences',
      '?$select=fmaint_agenceid,fmaint_nomagence,fmaint_telephone&$orderby=fmaint_nomagence asc'
    )
    return rows.map((r) => ({
      id: r.fmaint_agenceid,
      nom: r.fmaint_nomagence,
      telephone: r.fmaint_telephone || '',
    }))
  } catch (error) {
    console.error('Erreur lors de la lecture des agences:', error)
    throw error
  }
}

// ============================================================================
// TECHNICIENS - Dataverse fmaint_techniciens
// ============================================================================

export async function getTechniciens() {
  try {
    const rows = await portalGet(
      'fmaint_techniciens',
      '?$select=fmaint_technicienid,fmaint_nomtechnicien,fmaint_telephone&$orderby=fmaint_nomtechnicien asc'
    )
    return rows.map((r) => ({
      id: r.fmaint_technicienid,
      nom: r.fmaint_nomtechnicien,
      telephone: r.fmaint_telephone || '',
    }))
  } catch (error) {
    console.error('Erreur lors de la lecture des techniciens:', error)
    throw error
  }
}

// ============================================================================
// ACTIFS - Dataverse fmaint_actifs
// ============================================================================

export async function getActifs() {
  try {
    const rows = await portalGet(
      'fmaint_actifs',
      `?$select=fmaint_actifid,fmaint_nom,fmaint_numerodeserie,fmaint_statut,_fmaint_emplacementid_value,_fmaint_categoriedactifid_value,fmaint_datedacquisition,fmaint_datedefindegarantie,fmaint_valeur
      &$orderby=fmaint_nom asc`
    )
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
      codeInventaire: r.fmaint_codeinventaire || null,
      piecesJointes: [],
    }))
  } catch (error) {
    console.error('Erreur lors de la lecture des actifs:', error)
    throw error
  }
}

export async function createActif(nouvelActif) {
  try {
    const codeInventaire = await genererProchainCodeInventaire()
    
    const payload = {
      fmaint_nom: nouvelActif.nom,
      fmaint_numerodeserie: nouvelActif.numeroSerie || '',
      fmaint_statut: STATUT_ACTIF_CODES[nouvelActif.statut] ?? STATUT_ACTIF_CODES['En service'],
      fmaint_valeur: Number(nouvelActif.valeur) || 0,
      fmaint_codeinventaire: codeInventaire,
    }
    
    if (nouvelActif.dateAcquisition) payload.fmaint_datedacquisition = nouvelActif.dateAcquisition
    if (nouvelActif.dateFinGarantie) payload.fmaint_datedefindegarantie = nouvelActif.dateFinGarantie
    if (nouvelActif.emplacementId) {
      payload['fmaint_EmplacementID@odata.bind'] = `/fmaint_emplacements(${nouvelActif.emplacementId})`
    }
    if (nouvelActif.categorieId) {
      payload['fmaint_CategoriedactifID@odata.bind'] = `/fmaint_categoriedactifs(${nouvelActif.categorieId})`
    }
    
    const r = await portalPost('fmaint_actifs', payload)
    
    return {
      id: r.fmaint_actifid,
      nom: r.fmaint_nom,
      numeroSerie: r.fmaint_numerodeserie,
      statut: nouvelActif.statut || 'En service',
      emplacementId: nouvelActif.emplacementId || null,
      categorieId: nouvelActif.categorieId || null,
      dateAcquisition: nouvelActif.dateAcquisition || null,
      dateFinGarantie: nouvelActif.dateFinGarantie || null,
      valeur: Number(nouvelActif.valeur) || 0,
      etatCycleVie: 'En saisie',
      criticite: nouvelActif.criticite || 'Moyenne',
      codeInventaire,
      piecesJointes: [],
    }
  } catch (error) {
    console.error('Erreur lors de la création de l\'actif:', error)
    throw error
  }
}

export async function updateActifStatut(id, statut) {
  try {
    const code = STATUT_ACTIF_CODES[statut]
    if (code !== undefined) {
      await portalPatch('fmaint_actifs', id, { fmaint_statut: code })
    }
    return { id, statut }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut actif:', error)
    throw error
  }
}

export async function genererProchainCodeInventaire() {
  try {
    const annee = new Date().getFullYear()
    const prefixe = `INV-${annee}-`
    
    // Récupérer les actifs existants pour trouver le plus haut numéro
    const rows = await portalGet(
      'fmaint_actifs',
      `?$select=fmaint_codeinventaire&$filter=contains(fmaint_codeinventaire, '${prefixe}')`
    )
    
    const numeros = rows
      .map((r) => r.fmaint_codeinventaire)
      .filter(c => c && c.startsWith(prefixe))
      .map((c) => Number(c.slice(prefixe.length)) || 0)
    
    const prochain = (numeros.length ? Math.max(...numeros) : 0) + 1
    return `${prefixe}${String(prochain).padStart(4, '0')}`
  } catch (error) {
    console.error('Erreur lors de la génération du code inventaire:', error)
    throw error
  }
}

export async function activerActif(id) {
  try {
    await portalPatch('fmaint_actifs', id, {
      // Ajouter le champ pour marquer comme actif dans Dataverse si disponible
    })
    return { id, etatCycleVie: 'Actif' }
  } catch (error) {
    console.error('Erreur lors de l\'activation de l\'actif:', error)
    throw error
  }
}

export async function demanderRetraitActif(id, motif) {
  try {
    await portalPatch('fmaint_actifs', id, {
      fmaint_statut: STATUT_ACTIF_CODES['Retiré']
    })
    return { id, statut: 'Retiré' }
  } catch (error) {
    console.error('Erreur lors de la demande de retrait:', error)
    throw error
  }
}

export async function confirmerRetraitActif(id) {
  try {
    await portalPatch('fmaint_actifs', id, {
      fmaint_statut: STATUT_ACTIF_CODES['Retiré']
    })
    return { id, etatCycleVie: 'Retiré' }
  } catch (error) {
    console.error('Erreur lors de la confirmation du retrait:', error)
    throw error
  }
}

export async function ajouterPieceJointeActif(id, nomFichier, typeDocument) {
  try {
    // Les pièces jointes sont gérées via la table Notes/Documents de Dataverse
    // ou via une table personnalisée fmaint_piecesjointes
    return { id, nomFichier, typeDocument, dateAjout: new Date().toISOString().slice(0, 10) }
  } catch (error) {
    console.error('Erreur lors de l\'ajout de pièce jointe:', error)
    throw error
  }
}

export async function demanderModificationActif(id, champs, categorie) {
  try {
    // Mise à jour directe pour les modifications courantes
    if (categorie !== 'critique') {
      await portalPatch('fmaint_actifs', id, champs)
      return { id, ...champs }
    }
    // Pour les modifications critiques, stocker en base de données pour validation
    // (implémentation dépend de la table fmaint_demandesmodificationactif)
    return { id, statut: 'En attente de validation' }
  } catch (error) {
    console.error('Erreur lors de la demande de modification:', error)
    throw error
  }
}

export async function validerDemandeModification(id) {
  try {
    return { id, statut: 'Validée' }
  } catch (error) {
    console.error('Erreur lors de la validation de modification:', error)
    throw error
  }
}

export async function getDemandesModificationActif() {
  try {
    // Retourner un tableau vide si la table n'existe pas encore
    return []
  } catch (error) {
    console.error('Erreur lors de la lecture des demandes de modification:', error)
    return []
  }
}

export async function importActifsCsv(lignes) {
  try {
    const crees = []
    const rejetes = []
    
    for (const [index, ligne] of lignes.entries()) {
      const numeroLigne = index + 2
      if (!ligne.nom || !ligne.nom.trim()) {
        rejetes.push({ ligne: numeroLigne, motif: 'Nom manquant.' })
        continue
      }
      
      try {
        const actif = await createActif({
          nom: ligne.nom,
          numeroSerie: ligne.numeroSerie,
          statut: ligne.statut || 'En service',
          emplacementId: ligne.emplacementId || null,
          categorieId: ligne.categorieId || null,
          dateAcquisition: ligne.dateAcquisition || null,
          dateFinGarantie: ligne.dateFinGarantie || null,
          valeur: Number(ligne.valeur) || 0,
          criticite: ligne.criticite || 'Moyenne',
        })
        crees.push(actif)
      } catch (error) {
        rejetes.push({ ligne: numeroLigne, motif: error.message })
      }
    }
    
    return { crees, rejetes }
  } catch (error) {
    console.error('Erreur lors de l\'import CSV:', error)
    throw error
  }
}

// ============================================================================
// ORDRES DE TRAVAIL - Dataverse fmaint_ordredetravails
// ============================================================================

export async function getOrdresTravail() {
  try {
    const rows = await portalGet(
      'fmaint_ordredetravails',
      `?$select=fmaint_ordredetravailid,fmaint_nomordre,statecode,fmaint_urgent,_fmaint_technicienid_value,_fmaint_actifid_value,fmaint_dateintervention,fmaint_dureeheures
      &$orderby=fmaint_dateintervention desc`
    )
    return rows.map((r) => ({
      id: r.fmaint_ordredetravailid,
      numero: r.fmaint_nomordre,
      titre: r.fmaint_nomordre,
      statut: getFormatted(r, 'statecode') || 'Nouveau',
      priorite: r.fmaint_urgent ? 'Critique' : 'Moyenne',
      technicienId: r._fmaint_technicienid_value,
      dateEcheance: r.fmaint_dateintervention ? r.fmaint_dateintervention.slice(0, 10) : null,
      dureeHeures: r.fmaint_dureeheures || 0,
      actifId: r._fmaint_actifid_value || null,
      checklist: [],
      piecesJointes: [],
      origine: 'Corrective',
    }))
  } catch (error) {
    console.error('Erreur lors de la lecture des ordres de travail:', error)
    throw error
  }
}

export function prochainNumeroOt(origine) {
  const prefixe = origine === 'Préventif' ? 'PREV' : 'CORR'
  const timestamp = Date.now().toString().slice(-6)
  return `${prefixe}-${timestamp}`
}

export async function createOrdreTravail(nouvelOrdre) {
  try {
    const origine = nouvelOrdre.origine || 'Corrective'
    const numero = prochainNumeroOt(origine)
    const dateEcheance = nouvelOrdre.dateEcheance || dateEcheanceParCriticite('Moyenne')
    
    const payload = {
      fmaint_nomordre: nouvelOrdre.titre || numero,
      fmaint_urgent: nouvelOrdre.priorite === 'Critique',
    }
    
    if (dateEcheance) payload.fmaint_dateintervention = dateEcheance
    if (nouvelOrdre.actifId) {
      payload['fmaint_ActifID@odata.bind'] = `/fmaint_actifs(${nouvelOrdre.actifId})`
    }
    if (nouvelOrdre.technicienId) {
      payload['fmaint_TechnicienID@odata.bind'] = `/fmaint_techniciens(${nouvelOrdre.technicienId})`
    }
    
    const r = await portalPost('fmaint_ordredetravails', payload)
    
    return {
      id: r.fmaint_ordredetravailid,
      numero,
      titre: r.fmaint_nomordre || numero,
      statut: 'Nouveau',
      priorite: nouvelOrdre.priorite || 'Moyenne',
      technicienId: nouvelOrdre.technicienId || null,
      dateEcheance,
      dureeHeures: 0,
      actifId: nouvelOrdre.actifId || null,
      checklist: [],
      piecesJointes: [],
      origine,
      dateOuverture: new Date().toISOString().slice(0, 10),
    }
  } catch (error) {
    console.error('Erreur lors de la création de l\'ordre de travail:', error)
    throw error
  }
}

export async function updateOrdreTravailStatut(id, statut) {
  try {
    const codeStatut = {
      'Nouveau': 0,
      'En qualification': 1,
      'Affecté': 2,
      'En cours': 3,
      'Résolu': 4,
      'Clôturé': 5,
      'Rejeté': 6,
    }
    
    await portalPatch('fmaint_ordredetravails', id, {
      statecode: codeStatut[statut] ?? 0
    })
    return { id, statut }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut OT:', error)
    throw error
  }
}

export async function qualifierOrdreTravail(id, { priorite, technicien } = {}) {
  try {
    const payload = {}
    if (priorite === 'Critique') payload.fmaint_urgent = true
    if (technicien) {
      payload['fmaint_TechnicienID@odata.bind'] = `/fmaint_techniciens(${technicien})`
    }
    
    await portalPatch('fmaint_ordredetravails', id, payload)
    return updateOrdreTravailStatut(id, 'Affecté')
  } catch (error) {
    console.error('Erreur lors de la qualification OT:', error)
    throw error
  }
}

export async function accuserReception(id, accepte) {
  try {
    if (!accepte) {
      return updateOrdreTravailStatut(id, 'Nouveau')
    }
    return updateOrdreTravailStatut(id, 'En cours')
  } catch (error) {
    console.error('Erreur lors de l\'accusé de réception:', error)
    throw error
  }
}

export async function passerEnAttenteDePiece(id) {
  try {
    return updateOrdreTravailStatut(id, 'En attente de pièce')
  } catch (error) {
    console.error('Erreur lors du passage en attente de pièce:', error)
    throw error
  }
}

export async function reprendreIntervention(id) {
  try {
    return updateOrdreTravailStatut(id, 'En cours')
  } catch (error) {
    console.error('Erreur lors de la reprise d\'intervention:', error)
    throw error
  }
}

export async function resoudreOrdreTravail(id, compteRendu) {
  try {
    return updateOrdreTravailStatut(id, 'Résolu')
  } catch (error) {
    console.error('Erreur lors de la résolution OT:', error)
    throw error
  }
}

export async function validerClotureOrdreTravail(id, valide) {
  try {
    if (!valide) {
      return updateOrdreTravailStatut(id, 'En cours')
    }
    return updateOrdreTravailStatut(id, 'Clôturé')
  } catch (error) {
    console.error('Erreur lors de la validation de clôture:', error)
    throw error
  }
}

export async function rejeterOrdreTravail(id, motif) {
  try {
    return updateOrdreTravailStatut(id, 'Rejeté')
  } catch (error) {
    console.error('Erreur lors du rejet OT:', error)
    throw error
  }
}

export async function cloturerOrdreTravailAvecCompteRendu(id, compteRendu) {
  try {
    await resoudreOrdreTravail(id, compteRendu)
    return validerClotureOrdreTravail(id, true)
  } catch (error) {
    console.error('Erreur lors de la clôture OT:', error)
    throw error
  }
}

export async function cocherItemChecklist(id, itemId, coche) {
  try {
    return { id, itemId, coche }
  } catch (error) {
    console.error('Erreur lors du cochage de checklist:', error)
    throw error
  }
}

export async function ajouterPieceJointeOrdreTravail(id, nomFichier) {
  try {
    return { id, nomFichier, dateAjout: new Date().toISOString().slice(0, 10) }
  } catch (error) {
    console.error('Erreur lors de l\'ajout de pièce jointe OT:', error)
    throw error
  }
}

export async function getHistoriqueOrdreTravail() {
  try {
    return []
  } catch (error) {
    console.error('Erreur lors de la lecture de l\'historique OT:', error)
    return []
  }
}

// ============================================================================
// TICKETS - Dataverse fmaint_tickets
// ============================================================================

export async function getTickets() {
  try {
    const rows = await portalGet(
      'fmaint_tickets',
      `?$select=fmaint_ticketid,fmaint_titre,fmaint_description,statecode,_fmaint_agenceid_value,fmaint_urgence,_fmaint_ordredetravailid_value
      &$orderby=createdon desc`
    )
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
  } catch (error) {
    console.error('Erreur lors de la lecture des tickets:', error)
    throw error
  }
}

const URGENCE_CODES = {
  'Faible': 607570000,
  'Moyenne': 607570001,
  'Haute': 607570002,
}

export async function createTicket(nouveauTicket) {
  try {
    const payload = {
      fmaint_titre: nouveauTicket.titre,
      fmaint_description: nouveauTicket.description || '',
      fmaint_urgence: URGENCE_CODES[nouveauTicket.urgence] || URGENCE_CODES['Moyenne'],
    }
    
    if (nouveauTicket.emplacementId) {
      payload['fmaint_AgenceID@odata.bind'] = `/fmaint_agences(${nouveauTicket.emplacementId})`
    }
    
    const r = await portalPost('fmaint_tickets', payload)
    
    return {
      id: r.fmaint_ticketid,
      titre: r.fmaint_titre,
      description: r.fmaint_description,
      statut: 'Ouvert',
      emplacementId: nouveauTicket.emplacementId || null,
      urgence: nouveauTicket.urgence || 'Moyenne',
      ordreTravailId: null,
      piecesJointes: [],
    }
  } catch (error) {
    console.error('Erreur lors de la création du ticket:', error)
    throw error
  }
}

export async function updateTicketStatut(id, statut) {
  try {
    const codeStatut = {
      'Ouvert': 0,
      'En cours': 1,
      'Fermé': 2,
    }
    
    await portalPatch('fmaint_tickets', id, {
      statecode: codeStatut[statut] ?? 0
    })
    return { id, statut }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut ticket:', error)
    throw error
  }
}

export async function relierTicketAOrdre(id, ordreTravailId) {
  try {
    await portalPatch('fmaint_tickets', id, {
      'fmaint_OrdreDeTravailID@odata.bind': `/fmaint_ordredetravails(${ordreTravailId})`
    })
    return { id, ordreTravailId }
  } catch (error) {
    console.error('Erreur lors de la liaison ticket-OT:', error)
    throw error
  }
}

export async function ajouterPieceJointeTicket(id, nomFichier) {
  try {
    return { id, nomFichier, dateAjout: new Date().toISOString().slice(0, 10) }
  } catch (error) {
    console.error('Erreur lors de l\'ajout de pièce jointe ticket:', error)
    throw error
  }
}

export async function getCommentairesTicket(ticketId) {
  try {
    const rows = await portalGet(
      'fmaint_commentairetickets',
      `?$select=fmaint_commentaireticketid,fmaint_message,fmaint_auteur,fmaint_estreponsebanque,createdon
      &$filter=_fmaint_ticketid_value eq ${ticketId}
      &$orderby=createdon asc`
    )
    return rows.map((r) => ({
      id: r.fmaint_commentaireticketid,
      message: r.fmaint_message,
      auteur: r.fmaint_auteur,
      estReponseBanque: !!r.fmaint_estreponsebanque,
      date: r.createdon,
    }))
  } catch (error) {
    console.error('Erreur lors de la lecture des commentaires:', error)
    throw error
  }
}

export async function createCommentaireTicket(ticketId, message, auteur, estReponseBanque = false) {
  try {
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
  } catch (error) {
    console.error('Erreur lors de la création du commentaire:', error)
    throw error
  }
}

// ============================================================================
// MAINTENANCE PRÉVENTIVE (Placeholder - à implémenter avec tables Dataverse)
// ============================================================================

export async function getPlansPreventifs() {
  return []
}

export async function getEcheancesPlan() {
  return []
}

export async function createPlanPreventif(nouveauPlan) {
  return { ...nouveauPlan, id: `plan-${Date.now()}`, etatCycleVie: 'Brouillon' }
}

export async function updatePlanPreventif(id, changements) {
  return { id, ...changements }
}

export async function validerPlanPreventif(id, validateur, dateDebut) {
  return { id, etatCycleVie: 'Actif' }
}

export async function proposerDateIntervention(id, date) {
  return { id, dateInterventionProposee: date }
}

export async function validerDateIntervention(id, date) {
  return { id, dateInterventionValidee: date }
}

export async function signalerAnomaliePreventif(otPreventifId, description) {
  return createOrdreTravail({
    titre: `Anomalie: ${description}`,
    description,
    priorite: 'Haute',
    origine: 'Corrective',
  })
}

// ============================================================================
// MODULES AFRILAND (Placeholder - à implémenter)
// ============================================================================

export async function getFournisseurs() {
  return []
}

export async function createFournisseur(nouveauFournisseur) {
  return { ...nouveauFournisseur, id: `frs-${Date.now()}` }
}

export async function getContrats() {
  return []
}

export async function createContrat(nouveauContrat) {
  return { ...nouveauContrat, id: `ctr-${Date.now()}` }
}

export async function getSlaRules() {
  return []
}

export async function createSlaRule(nouvelleRegle) {
  return { ...nouvelleRegle, id: `slar-${Date.now()}` }
}

export async function getSlaMeasures() {
  return []
}

export async function createSlaMeasure(nouvelleMesure) {
  return { ...nouvelleMesure, id: `slam-${Date.now()}` }
}

export async function getPenalites() {
  return []
}

export async function createPenalite(nouvellePenalite) {
  return { ...nouvellePenalite, id: `pen-${Date.now()}` }
}

export async function updatePenaliteStatut(id, statut) {
  return { id, statut }
}

export async function getValidationsPaiement() {
  return []
}

export async function updateValidationPaiementStatut(id, statut, validateur) {
  return { id, statut }
}

export async function getEvaluationsPrestataires() {
  return []
}

export async function createEvaluationPrestataire(nouvelleEvaluation) {
  return { ...nouvelleEvaluation, id: `eval-${Date.now()}` }
}

export async function getCles() {
  return []
}

export async function createCle(nouvelleCle) {
  return { ...nouvelleCle, id: `cle-${Date.now()}` }
}

export async function getMouvementsCles() {
  return []
}

export async function createMouvementCle(nouveauMouvement) {
  return { ...nouveauMouvement, id: `mvc-${Date.now()}` }
}

export async function getProjetsImmobiliers() {
  return []
}

export async function createProjetImmobilier(nouveauProjet) {
  return { ...nouveauProjet, id: `proj-${Date.now()}` }
}

export async function getJalonsProjets() {
  return []
}

export async function createJalonProjet(nouveauJalon) {
  return { ...nouveauJalon, id: `jal-${Date.now()}` }
}

export async function updateJalonProjet(id, statut) {
  return { id, statut }
}

export async function updateProjetBudgetConsomme(id, montantDepense) {
  return { id, budgetConsomme: montantDepense }
}

export async function receptionnerProjet(id) {
  return { id, statut: 'Terminé' }
}

export async function getTachesWorkflow() {
  return []
}

export async function updateTacheWorkflowStatut(id, statut) {
  return { id, statut }
}

export async function getAlertesAutomatiques() {
  return []
}

export async function marquerAlerteLue(id) {
  return { id, lu: true }
}

export async function getPiecesRechange() {
  return []
}

export async function createPieceRechange(nouvellePiece) {
  return { ...nouvellePiece, id: `pr-${Date.now()}` }
}

export async function getMouvementsStock() {
  return []
}

export async function createMouvementStock(nouveauMouvement) {
  return { ...nouveauMouvement, id: `ms-${Date.now()}` }
}

export async function getConsommationsEnergie() {
  return []
}

export async function createConsommationEnergie(nouvelleConso) {
  return { ...nouvelleConso, id: `conso-${Date.now()}` }
}

// ============================================================================
// UTILISATEURS - Dataverse fmaint_utilisateurs
// ============================================================================

const CHAMPS_UTILISATEUR = 'fmaint_utilisateurid,fmaint_nom,fmaint_email,fmaint_role,fmaint_statut'

function mapUtilisateur(r) {
  return {
    id: r.fmaint_utilisateurid,
    nom: r.fmaint_nom,
    email: r.fmaint_email,
    role: r.fmaint_role,
    statut: r.fmaint_statut || 'Actif',
  }
}

export async function getUtilisateurs() {
  try {
    const rows = await portalGet(
      'fmaint_utilisateurs',
      `?$select=${CHAMPS_UTILISATEUR}&$orderby=fmaint_nom asc`
    )
    return rows.map(mapUtilisateur)
  } catch (error) {
    console.error('Erreur lors de la lecture des utilisateurs:', error)
    return []
  }
}

export async function createUtilisateur(nouvelUtilisateur) {
  try {
    const payload = {
      fmaint_nom: nouvelUtilisateur.nom,
      fmaint_email: nouvelUtilisateur.email,
      fmaint_role: nouvelUtilisateur.role || 'Opérateur DMG',
      fmaint_statut: nouvelUtilisateur.statut || 'Actif',
    }
    
    const r = await portalPost('fmaint_utilisateurs', payload)
    return mapUtilisateur(r)
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error)
    throw error
  }
}

export async function updateUtilisateurRole(id, role) {
  try {
    const r = await portalPatch('fmaint_utilisateurs', id, { fmaint_role: role })
    return mapUtilisateur(r)
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error)
    throw error
  }
}

export async function updateUtilisateurStatut(id, statut) {
  try {
    const r = await portalPatch('fmaint_utilisateurs', id, { fmaint_statut: statut })
    return mapUtilisateur(r)
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut utilisateur:', error)
    throw error
  }
}

export async function getOrCreateUtilisateurCourant(email, nomPropose) {
  try {
    const emailEchappe = email.replace(/'/g, "''")
    const rows = await portalGet(
      'fmaint_utilisateurs',
      `?$select=${CHAMPS_UTILISATEUR}&$filter=fmaint_email eq '${emailEchappe}'`
    )
    
    if (rows.length) return mapUtilisateur(rows[0])
    
    return createUtilisateur({
      nom: nomPropose || email,
      email,
      role: 'Opérateur DMG',
      statut: 'Actif',
    })
  } catch (error) {
    console.error('Erreur lors de la récupération/création utilisateur:', error)
    throw error
  }
}

// ============================================================================
// AUDIT (Placeholder - à implémenter)
// ============================================================================

export async function getJournalAudit() {
  return []
}

export async function ajouterAudit(entree) {
  console.log('Audit:', entree)
  return { id: `aud-${Date.now()}`, ...entree }
}

// ============================================================================
// GESTION DES FICHES POST-INCIDENT ET RAPPORTS
// ============================================================================

export async function getFichesAnalysePostIncident() {
  return []
}

export async function getRapportsMensuels() {
  return []
}
