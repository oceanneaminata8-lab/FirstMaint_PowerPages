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
const STRICT_DATAVERSE_WRITES = true

const STORAGE_PREFIX = 'firstmaint-powerapps:'

function readLocalCollection(name) {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(window.localStorage.getItem(`${STORAGE_PREFIX}${name}`) || '[]')
  } catch (error) {
    console.warn(`Impossible de lire le stockage local ${name}:`, error)
    return []
  }
}

function writeLocalCollection(name, rows) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(`${STORAGE_PREFIX}${name}`, JSON.stringify(rows))
}

function createLocalRecord(name, prefix, record) {
  const rows = readLocalCollection(name)
  const created = {
    ...record,
    id: record.id || `${prefix}-${Date.now()}`,
    createdAt: record.createdAt || new Date().toISOString(),
  }
  writeLocalCollection(name, [created, ...rows])
  return created
}

function updateLocalRecord(name, id, changes) {
  const rows = readLocalCollection(name)
  const updatedRows = rows.map((row) => (row.id === id ? { ...row, ...changes } : row))
  writeLocalCollection(name, updatedRows)
  return updatedRows.find((row) => row.id === id) || { id, ...changes }
}

const ENTITY_ID_FIELDS = {
  fmaint_emplacements: 'fmaint_emplacementid',
  fmaint_categoriedactifs: 'fmaint_categoriedactifid',
  fmaint_agences: 'fmaint_agenceid',
  fmaint_techniciens: 'fmaint_technicienid',
  fmaint_actifs: 'fmaint_actifid',
  fmaint_ordredetravails: 'fmaint_ordredetravailid',
  fmaint_tickets: 'fmaint_ticketid',
  fmaint_utilisateurs: 'fmaint_utilisateurid',
  fmaint_commentairetickets: 'fmaint_commentaireticketid',
  fmaint_fournisseurs: 'fmaint_fournisseurid',
  fmaint_planspreventifs: 'fmaint_planspreventifid',
  fmaint_echeancesplans: 'fmaint_echeancesplanid',
  fmaint_contrats: 'fmaint_contratid',
  fmaint_slarules: 'fmaint_slaruleid',
  fmaint_slameasures: 'fmaint_slameasureid',
  fmaint_penalites: 'fmaint_penaliteid',
  fmaint_validationspaiement: 'fmaint_validationpaiementid',
  fmaint_evaluationsprestataires: 'fmaint_evaluationprestataireid',
  fmaint_cles: 'fmaint_cleid',
  fmaint_mouvementscles: 'fmaint_mouvementcleid',
  fmaint_projetsimmobiliers: 'fmaint_projetimmobilierid',
  fmaint_jalonsprojets: 'fmaint_jalonprojetid',
  fmaint_tachesworkflow: 'fmaint_tacheworkflowid',
  fmaint_alertesautomatiques: 'fmaint_alerteautomatiqueid',
  fmaint_piecesrechange: 'fmaint_piecerechangeid',
  fmaint_mouvementsstock: 'fmaint_mouvementstockid',
  fmaint_consommationsenergie: 'fmaint_consommationenergieid',
  fmaint_journalaudit: 'fmaint_journalauditid',
  fmaint_fichesanalysepostincident: 'fmaint_ficheanalysepostincidentid',
  fmaint_rapportsmensuels: 'fmaint_rapportmensuelid',
}

const ENTITY_ALIASES = {
  fmaint_emplacements: ['emplacement', 'emplacements', 'site', 'sites', 'agence', 'agences'],
  fmaint_categoriedactifs: ['categorie actif', 'categories actif', 'categorie d actif', 'categories d actifs', 'famille actif'],
  fmaint_agences: ['agence', 'agences'],
  fmaint_techniciens: ['technicien', 'techniciens'],
  fmaint_actifs: ['actif', 'actifs', 'asset', 'assets', 'immobilisation', 'immobilisations'],
  fmaint_ordredetravails: ['ordre de travail', 'ordres de travail', 'ordredetravail'],
  fmaint_tickets: ['ticket', 'tickets'],
  fmaint_utilisateurs: ['utilisateur', 'utilisateurs', 'user', 'users'],
  fmaint_commentairetickets: ['commentaire ticket', 'commentaires ticket', 'commentairetickets'],
  fmaint_fournisseurs: ['fournisseur', 'fournisseurs', 'prestataire', 'prestataires'],
  fmaint_planspreventifs: ['plan preventif', 'plans preventifs'],
  fmaint_echeancesplans: ['echeance plan', 'echeances plans'],
  fmaint_contrats: ['contrat', 'contrats'],
  fmaint_slarules: ['sla rule', 'sla rules', 'regle sla'],
  fmaint_slameasures: ['sla measure', 'sla measures', 'mesure sla'],
  fmaint_penalites: ['penalite', 'penalites'],
  fmaint_validationspaiement: ['validation paiement', 'validations paiement'],
  fmaint_evaluationsprestataires: ['evaluation prestataire', 'evaluations prestataires'],
  fmaint_cles: ['cle', 'cles', 'cle acces', 'cles acces'],
  fmaint_mouvementscles: ['mouvement cle', 'mouvements cles'],
  fmaint_projetsimmobiliers: ['projet immobilier', 'projets immobiliers'],
  fmaint_jalonsprojets: ['jalon projet', 'jalons projets'],
  fmaint_tachesworkflow: ['tache workflow', 'taches workflow', 'tache', 'taches'],
  fmaint_alertesautomatiques: ['alerte automatique', 'alertes automatiques', 'alerte', 'alertes'],
  fmaint_piecesrechange: ['piece rechange', 'pieces rechange'],
  fmaint_mouvementsstock: ['mouvement stock', 'mouvements stock'],
  fmaint_consommationsenergie: ['consommation energie', 'consommations energie'],
  fmaint_journalaudit: ['journal audit', 'audit'],
  fmaint_fichesanalysepostincident: ['fiche analyse post incident', 'fiches analyse post incident'],
  fmaint_rapportsmensuels: ['rapport mensuel', 'rapports mensuels'],
}

let entitiesPromise = null
const resolvedEntities = new Map()

function normaliserTexte(valeur) {
  return String(valeur || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

function rowDisplayName(row) {
  return row?.DisplayCollectionName?.UserLocalizedLabel?.Label || ''
}

async function getDataverseEntities() {
  if (!entitiesPromise) {
    entitiesPromise = MicrosoftDataverseService.GetEntitiesWithOrganization(ORGANIZATION_URL)
      .then((result) => {
        if (!result?.success) throw new Error(result?.error?.message || 'Impossible de lire les tables Dataverse.')
        return result.data?.value || []
      })
  }
  return entitiesPromise
}

function scoreEntityMatch(row, expectedEntityName) {
  const aliases = ENTITY_ALIASES[expectedEntityName] || [expectedEntityName.replace(/^fmaint_/, '')]
  const wanted = aliases.map(normaliserTexte)
  const logical = normaliserTexte(row.LogicalName)
  const entitySet = normaliserTexte(row.EntitySetName)
  const display = normaliserTexte(rowDisplayName(row))
  const expected = normaliserTexte(expectedEntityName.replace(/^fmaint_/, ''))

  if (row.EntitySetName === expectedEntityName || row.LogicalName === expectedEntityName) return 100
  if (wanted.some((name) => entitySet === name || logical === name || display === name)) return 90
  if (entitySet.endsWith(expected) || logical.endsWith(expected)) return 80
  if (wanted.some((name) => entitySet.endsWith(name) || logical.endsWith(name))) return 75
  if (wanted.some((name) => display.includes(name))) return 70
  if (entitySet.includes(expected) || logical.includes(expected)) return 55
  return 0
}

async function resolveEntityInfo(expectedEntityName) {
  if (resolvedEntities.has(expectedEntityName)) return resolvedEntities.get(expectedEntityName)

  if (expectedEntityName.startsWith('fmaint_')) {
    const idField = ENTITY_ID_FIELDS[expectedEntityName]
    const logicalName = idField?.replace(/id$/, '') || expectedEntityName.replace(/s$/, '')
    const info = {
      expectedEntityName,
      entitySetName: expectedEntityName,
      logicalName,
      prefix: 'fmaint_',
      idField: idField || `${logicalName}id`,
    }
    resolvedEntities.set(expectedEntityName, info)
    return info
  }

  const entities = await getDataverseEntities()
  const exact = entities.find((row) => row.EntitySetName === expectedEntityName || row.LogicalName === expectedEntityName)
  const best = exact || entities
    .map((row) => ({ row, score: scoreEntityMatch(row, expectedEntityName) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)[0]?.row

  if (!best?.EntitySetName) {
    const message = `Table Dataverse introuvable pour ${expectedEntityName}. Creez la table avec ce nom logique ou verifiez le nom reel dans Dataverse.`
    const error = new Error(message)
    error.dataverseMissingTable = expectedEntityName
    throw error
  }

  const logicalName = best.LogicalName || best.EntitySetName
  const prefix = logicalName.includes('_') ? `${logicalName.split('_')[0]}_` : 'fmaint_'
  const info = {
    expectedEntityName,
    entitySetName: best.EntitySetName,
    logicalName,
    prefix,
    idField: `${logicalName}id`,
  }
  if (best.EntitySetName !== expectedEntityName) {
    console.warn(`Dataverse: ${expectedEntityName} resolu vers ${best.EntitySetName} (${logicalName}).`)
  }
  resolvedEntities.set(expectedEntityName, info)
  return info
}

function translateDataverseField(entityName, info, field) {
  if (!field || !info) return field
  if (field === ENTITY_ID_FIELDS[entityName]) return info.idField
  if (field.startsWith('_fmaint_')) return `_${info.prefix}${field.slice('_fmaint_'.length)}`
  if (field.startsWith('fmaint_')) return `${info.prefix}${field.slice('fmaint_'.length)}`
  return field
}

function translateSelect(entityName, info, select) {
  if (!select) return select
  return select.split(',').map((field) => translateDataverseField(entityName, info, field.trim())).join(',')
}

function translateExpression(entityName, info, expression) {
  if (!expression) return expression
  return expression.replace(/_?fmaint_[A-Za-z0-9_]+/g, (field) => translateDataverseField(entityName, info, field))
}

function normalizeDataverseRow(entityName, info, row) {
  if (!info || info.prefix === 'fmaint_') return row
  const normalized = { ...row }
  const idField = ENTITY_ID_FIELDS[entityName]
  if (row[info.idField] !== undefined) normalized[idField] = row[info.idField]
  for (const [key, value] of Object.entries(row)) {
    if (key.startsWith(info.prefix)) normalized[`fmaint_${key.slice(info.prefix.length)}`] = value
    if (key.startsWith(`_${info.prefix}`)) normalized[`_fmaint_${key.slice(1 + info.prefix.length)}`] = value
  }
  return normalized
}

async function translatePayloadKey(key) {
  if (!key.includes('@odata.bind')) return key
  const [field, suffix] = key.split('@')
  if (!field.startsWith('fmaint_')) return key
  const prefix = (await resolveEntityInfo('fmaint_actifs')).prefix
  return `${prefix}${field.slice('fmaint_'.length)}@${suffix}`
}

async function translateBindValue(value) {
  if (typeof value !== 'string') return value
  const match = value.match(/^\/(fmaint_[A-Za-z0-9_]+)\((.+)\)$/)
  if (!match) return value
  const target = await resolveEntityInfo(match[1])
  return `/${target.entitySetName}(${match[2]})`
}

async function translatePayload(entityName, info, item) {
  const translated = {}
  for (const [key, value] of Object.entries(item)) {
    if (key.includes('@odata.bind')) {
      const [field, suffix] = key.split('@')
      const translatedField = translateDataverseField(entityName, info, field)
      translated[`${translatedField}@${suffix}`] = await translateBindValue(value)
    } else {
      translated[translateDataverseField(entityName, info, key)] = value
    }
  }
  return translated
}

function isMissingDataverseResource(error) {
  const message = `${error?.message || ''} ${error?.error?.message || ''}`
  return message.includes('0x80060888') || message.includes('Resource not found for the segment')
}

function isDataverseSchemaError(error) {
  const message = `${error?.message || ''} ${error?.error?.message || ''}`
  return message.includes('Could not find a property named')
    || message.includes('Does not support untyped value in non-open type')
    || message.includes('An undeclared property')
}

function messageDataverseOperation(entityName, operation, error) {
  const detail = error?.message || error?.error?.message || 'Erreur Dataverse inconnue.'
  return [
    `Dataverse n'a pas enregistre cette information (${operation}).`,
    `Table: ${entityName}.`,
    `Verifiez que la table existe et que toutes les colonnes utilisees par FirstMaint ont exactement le bon nom logique.`,
    `Detail: ${detail}`,
  ].join(' ')
}

function throwDataverseWriteError(entityName, operation, error) {
  const message = messageDataverseOperation(entityName, operation, error)
  if (typeof window !== 'undefined') window.alert(message)
  throw new Error(message)
}

function localEntityStoreName(entityName) {
  return `dataverse:${entityName}`
}

function localEntityPrefix(entityName) {
  return entityName.replace(/^fmaint_/, '').replace(/s$/, '') || 'row'
}

function createLocalEntityRecord(entityName, item) {
  const idField = ENTITY_ID_FIELDS[entityName] || 'id'
  const created = createLocalRecord(localEntityStoreName(entityName), localEntityPrefix(entityName), item)
  return { ...created, [idField]: created[idField] || created.id }
}

function updateLocalEntityRecord(entityName, recordId, item) {
  const storeName = localEntityStoreName(entityName)
  const idField = ENTITY_ID_FIELDS[entityName] || 'id'
  const rows = readLocalCollection(storeName)
  const updatedRows = rows.map((row) => (
    row.id === recordId || row[idField] === recordId
      ? { ...row, ...item, id: row.id || recordId, [idField]: row[idField] || recordId }
      : row
  ))
  writeLocalCollection(storeName, updatedRows)
  return updatedRows.find((row) => row.id === recordId || row[idField] === recordId) || {
    id: recordId,
    [idField]: recordId,
    ...item,
  }
}

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

async function resolvedListRecords(entityName, select, filter, orderby) {
  try {
    const entityInfo = await resolveEntityInfo(entityName)
    const resolvedEntityName = entityInfo.entitySetName
    const translatedSelect = translateSelect(entityName, entityInfo, select)
    const translatedFilter = translateExpression(entityName, entityInfo, filter)
    const translatedOrderby = translateExpression(entityName, entityInfo, orderby)
    console.log(`Fetching real data from Dataverse for ${entityName} via ${resolvedEntityName}...`)

    const result = await MicrosoftDataverseService.ListRecordsWithOrganization(
      ORGANIZATION_URL,
      resolvedEntityName,
      PREFER_FORMATTED_VALUES,
      'application/json',
      undefined,
      undefined,
      translatedSelect,
      translatedFilter,
      translatedOrderby
    )

    if (result.success) {
      const rows = result.data?.value || []
      console.log(`Got ${rows.length} records from Dataverse for ${entityName}`)
      return rows.map(unwrap).map((row) => normalizeDataverseRow(entityName, entityInfo, row))
    }

    throw new Error(result.error?.message || `Echec de lecture Dataverse pour ${entityName}.`)
  } catch (error) {
    console.error(`Exception reading ${entityName}:`, error.message)
    throw error
  }
}

async function resolvedCreateRecord(entityName, item) {
  try {
    const entityInfo = await resolveEntityInfo(entityName)
    const resolvedEntityName = entityInfo.entitySetName
    const translatedItem = await translatePayload(entityName, entityInfo, item)
    console.log(`Creating record in Dataverse for ${entityName} via ${resolvedEntityName}...`)

    const result = await MicrosoftDataverseService.CreateRecordWithOrganization(
      `return=representation, ${PREFER_FORMATTED_VALUES}`,
      'application/json',
      ORGANIZATION_URL,
      resolvedEntityName,
      translatedItem
    )

    if (result.success) {
      console.log(`Record created successfully in ${entityName}`)
      return normalizeDataverseRow(entityName, entityInfo, unwrap(result.data))
    }

    throw new Error(result.error?.message || `Echec de creation Dataverse pour ${entityName}.`)
  } catch (error) {
    console.error(`Exception creating ${entityName}:`, error.message)
    throw error
  }
}

async function resolvedUpdateRecord(entityName, recordId, item) {
  try {
    const entityInfo = await resolveEntityInfo(entityName)
    const resolvedEntityName = entityInfo.entitySetName
    const translatedItem = await translatePayload(entityName, entityInfo, item)
    console.log(`Updating record in Dataverse for ${entityName} via ${resolvedEntityName}...`)

    const result = await MicrosoftDataverseService.UpdateRecordWithOrganization(
      `return=representation, ${PREFER_FORMATTED_VALUES}`,
      'application/json',
      ORGANIZATION_URL,
      resolvedEntityName,
      recordId,
      translatedItem
    )

    if (result.success) {
      console.log(`Record updated successfully in ${entityName}`)
      return normalizeDataverseRow(entityName, entityInfo, unwrap(result.data))
    }

    throw new Error(result.error?.message || `Echec de mise a jour Dataverse pour ${entityName}.`)
  } catch (error) {
    console.error(`Exception updating ${entityName}:`, error.message)
    throw error
  }
}

async function safeListRecords(entityName, select, filter, orderby) {
  try {
    return await resolvedListRecords(entityName, select, filter, orderby)
  } catch (error) {
    if (isMissingDataverseResource(error) || error.dataverseMissingTable) {
      console.warn(`Table Dataverse introuvable (${entityName}). Lecture vide pour eviter une fausse connexion locale.`)
      return []
    }
    throw error
  }
}

async function safeCreateRecord(entityName, item) {
  try {
    return await resolvedCreateRecord(entityName, item)
  } catch (error) {
    if (STRICT_DATAVERSE_WRITES && (isMissingDataverseResource(error) || isDataverseSchemaError(error))) {
      throwDataverseWriteError(entityName, 'creation', error)
    }
    if (isMissingDataverseResource(error)) {
      console.warn(`Table Dataverse introuvable (${entityName}). Creation dans le stockage local.`)
      return createLocalEntityRecord(entityName, item)
    }
    throw error
  }
}

async function safeUpdateRecord(entityName, recordId, item) {
  try {
    return await resolvedUpdateRecord(entityName, recordId, item)
  } catch (error) {
    if (STRICT_DATAVERSE_WRITES && (isMissingDataverseResource(error) || isDataverseSchemaError(error))) {
      throwDataverseWriteError(entityName, 'mise a jour', error)
    }
    if (isMissingDataverseResource(error)) {
      console.warn(`Table Dataverse introuvable (${entityName}). Mise a jour dans le stockage local.`)
      return updateLocalEntityRecord(entityName, recordId, item)
    }
    throw error
  }
}

const MODULES_DATAVERSE = {
  plansPreventifs: {
    table: 'fmaint_planspreventifs',
    id: 'fmaint_planspreventifid',
    prefix: 'plan',
    fields: {
      actifId: 'fmaint_actifid',
      categorieId: 'fmaint_categorieid',
      libelle: 'fmaint_libelle',
      frequence: 'fmaint_frequence',
      prestataireParDefautId: 'fmaint_prestatairepardefautid',
      modeOperatoire: 'fmaint_modeoperatoire',
      modeOperatoireParDefaut: 'fmaint_modeoperatoirepardefaut',
      etatCycleVie: 'fmaint_etatcyclevie',
      validateur: 'fmaint_validateur',
      dateDebut: 'fmaint_datedebut',
    },
  },
  echeancesPlan: {
    table: 'fmaint_echeancesplans',
    id: 'fmaint_echeancesplanid',
    prefix: 'ech',
    fields: {
      planPreventifId: 'fmaint_planpreventifid',
      actifId: 'fmaint_actifid',
      datePrevue: 'fmaint_dateprevue',
      statut: 'fmaint_statut',
      ordreTravailId: 'fmaint_ordredetravailid',
    },
  },
  contrats: {
    table: 'fmaint_contrats',
    id: 'fmaint_contratid',
    prefix: 'ctr',
    fields: {
      fournisseurId: 'fmaint_fournisseurid',
      type: 'fmaint_type',
      objet: 'fmaint_objet',
      valeur: 'fmaint_valeur',
      dateDebut: 'fmaint_datedebut',
      dateFin: 'fmaint_datefin',
      statut: 'fmaint_statut',
      conditionsRenouvellement: 'fmaint_conditionsrenouvellement',
      actifsCouverts: 'fmaint_actifscouverts',
    },
  },
  slaRules: {
    table: 'fmaint_slarules',
    id: 'fmaint_slaruleid',
    prefix: 'slar',
    fields: {
      categorieId: 'fmaint_categorieid',
      contratId: 'fmaint_contratid',
      priorite: 'fmaint_priorite',
      delaiHeures: 'fmaint_delaiheures',
      penaliteMontant: 'fmaint_penalitemontant',
      libelle: 'fmaint_libelle',
    },
  },
  slaMeasures: {
    table: 'fmaint_slameasures',
    id: 'fmaint_slameasureid',
    prefix: 'slam',
    fields: {
      ordreTravailId: 'fmaint_ordredetravailid',
      contratId: 'fmaint_contratid',
      delaiHeures: 'fmaint_delaiheures',
      dureeReelleHeures: 'fmaint_dureereelleheures',
      respecte: 'fmaint_respecte',
      dateMesure: 'fmaint_datemesure',
    },
  },
  penalites: {
    table: 'fmaint_penalites',
    id: 'fmaint_penaliteid',
    prefix: 'pen',
    fields: {
      slaMeasureId: 'fmaint_slameasureid',
      contratId: 'fmaint_contratid',
      montant: 'fmaint_montant',
      motif: 'fmaint_motif',
      statut: 'fmaint_statut',
      dateApplication: 'fmaint_dateapplication',
    },
  },
  validationsPaiement: {
    table: 'fmaint_validationspaiement',
    id: 'fmaint_validationpaiementid',
    prefix: 'vp',
    fields: {
      fournisseurId: 'fmaint_fournisseurid',
      contratId: 'fmaint_contratid',
      montant: 'fmaint_montant',
      statut: 'fmaint_statut',
      validateur: 'fmaint_validateur',
      dateValidation: 'fmaint_datevalidation',
    },
  },
  evaluationsPrestataires: {
    table: 'fmaint_evaluationsprestataires',
    id: 'fmaint_evaluationprestataireid',
    prefix: 'eval',
    fields: {
      fournisseurId: 'fmaint_fournisseurid',
      periode: 'fmaint_periode',
      noteQualite: 'fmaint_notequalite',
      noteDelai: 'fmaint_notedelai',
      noteCout: 'fmaint_notecout',
      commentaire: 'fmaint_commentaire',
      evaluateur: 'fmaint_evaluateur',
    },
  },
  cles: {
    table: 'fmaint_cles',
    id: 'fmaint_cleid',
    prefix: 'cle',
    fields: {
      libelle: 'fmaint_libelle',
      emplacementId: 'fmaint_emplacementid',
      type: 'fmaint_type',
      classification: 'fmaint_classification',
      niveauCriticite: 'fmaint_niveaucriticite',
      statut: 'fmaint_statut',
      detenteur: 'fmaint_detenteur',
      detenteurActuel: 'fmaint_detenteuractuel',
    },
  },
  mouvementsCles: {
    table: 'fmaint_mouvementscles',
    id: 'fmaint_mouvementcleid',
    prefix: 'mvc',
    fields: {
      cleId: 'fmaint_cleid',
      action: 'fmaint_action',
      personne: 'fmaint_personne',
      date: 'fmaint_date',
      dateRestitutionPrevue: 'fmaint_daterestitutionprevue',
      valideur1: 'fmaint_valideur1',
      valideur2: 'fmaint_valideur2',
      commentaire: 'fmaint_commentaire',
    },
  },
  projetsImmobiliers: {
    table: 'fmaint_projetsimmobiliers',
    id: 'fmaint_projetimmobilierid',
    prefix: 'proj',
    fields: {
      nom: 'fmaint_nom',
      emplacementId: 'fmaint_emplacementid',
      budget: 'fmaint_budget',
      budgetConsomme: 'fmaint_budgetconsomme',
      dateDebut: 'fmaint_datedebut',
      dateFin: 'fmaint_datefin',
      statut: 'fmaint_statut',
      responsable: 'fmaint_responsable',
    },
  },
  jalonsProjets: {
    table: 'fmaint_jalonsprojets',
    id: 'fmaint_jalonprojetid',
    prefix: 'jal',
    fields: {
      projetId: 'fmaint_projetid',
      libelle: 'fmaint_libelle',
      datePrevue: 'fmaint_dateprevue',
      dateReelle: 'fmaint_datereelle',
      statut: 'fmaint_statut',
    },
  },
  tachesWorkflow: {
    table: 'fmaint_tachesworkflow',
    id: 'fmaint_tacheworkflowid',
    prefix: 'tw',
    fields: {
      titre: 'fmaint_titre',
      description: 'fmaint_description',
      type: 'fmaint_type',
      statut: 'fmaint_statut',
      assigneA: 'fmaint_assignea',
      dateEcheance: 'fmaint_dateecheance',
    },
  },
  alertesAutomatiques: {
    table: 'fmaint_alertesautomatiques',
    id: 'fmaint_alerteautomatiqueid',
    prefix: 'alert',
    fields: {
      titre: 'fmaint_titre',
      description: 'fmaint_description',
      message: 'fmaint_message',
      source: 'fmaint_source',
      niveau: 'fmaint_niveau',
      lu: 'fmaint_lu',
      assigneA: 'fmaint_assignea',
      date: 'fmaint_date',
    },
  },
  piecesRechange: {
    table: 'fmaint_piecesrechange',
    id: 'fmaint_piecerechangeid',
    prefix: 'pr',
    fields: {
      reference: 'fmaint_reference',
      libelle: 'fmaint_libelle',
      categorieId: 'fmaint_categorieid',
      stock: 'fmaint_stock',
      seuilAlerte: 'fmaint_seuilalerte',
      unite: 'fmaint_unite',
      prixUnitaire: 'fmaint_prixunitaire',
    },
  },
  mouvementsStock: {
    table: 'fmaint_mouvementsstock',
    id: 'fmaint_mouvementstockid',
    prefix: 'ms',
    fields: {
      pieceId: 'fmaint_pieceid',
      type: 'fmaint_type',
      quantite: 'fmaint_quantite',
      date: 'fmaint_date',
      motif: 'fmaint_motif',
      ordreTravailId: 'fmaint_ordredetravailid',
    },
  },
  consommationsEnergie: {
    table: 'fmaint_consommationsenergie',
    id: 'fmaint_consommationenergieid',
    prefix: 'conso',
    fields: {
      emplacementId: 'fmaint_emplacementid',
      periode: 'fmaint_periode',
      typeEnergie: 'fmaint_typeenergie',
      consommation: 'fmaint_consommation',
      cout: 'fmaint_cout',
      commentaire: 'fmaint_commentaire',
    },
  },
  journalAudit: {
    table: 'fmaint_journalaudit',
    id: 'fmaint_journalauditid',
    prefix: 'aud',
    fields: {
      action: 'fmaint_action',
      cible: 'fmaint_cible',
      auteur: 'fmaint_auteur',
      date: 'fmaint_date',
      details: 'fmaint_details',
    },
  },
  fichesAnalysePostIncident: {
    table: 'fmaint_fichesanalysepostincident',
    id: 'fmaint_ficheanalysepostincidentid',
    prefix: 'fapi',
    fields: {
      ordreTravailId: 'fmaint_ordredetravailid',
      causeRacine: 'fmaint_causeracine',
      impact: 'fmaint_impact',
      actionCorrective: 'fmaint_actioncorrective',
      responsable: 'fmaint_responsable',
      date: 'fmaint_date',
    },
  },
  rapportsMensuels: {
    table: 'fmaint_rapportsmensuels',
    id: 'fmaint_rapportmensuelid',
    prefix: 'rap',
    fields: {
      mois: 'fmaint_mois',
      titre: 'fmaint_titre',
      statut: 'fmaint_statut',
      destinataire: 'fmaint_destinataire',
      dateEnvoi: 'fmaint_dateenvoi',
    },
  },
}

function normaliserValeurDataverse(valeur) {
  if (Array.isArray(valeur) || (valeur && typeof valeur === 'object')) return JSON.stringify(valeur)
  return valeur
}

function rowToModuleRecord(config, row) {
  const record = { id: row[config.id] || row.id }
  for (const [appField, dataverseField] of Object.entries(config.fields)) {
    const valeur = row[dataverseField] ?? row[appField]
    if (typeof valeur === 'string' && (valeur.startsWith('[') || valeur.startsWith('{'))) {
      try {
        record[appField] = JSON.parse(valeur)
      } catch {
        record[appField] = valeur
      }
    } else {
      record[appField] = valeur
    }
  }
  if (row.createdon && !record.date) record.date = row.createdon
  return record
}

function moduleRecordToPayload(config, record) {
  const payload = {}
  for (const [appField, dataverseField] of Object.entries(config.fields)) {
    if (record[appField] !== undefined) payload[dataverseField] = normaliserValeurDataverse(record[appField])
  }
  return payload
}

async function listModuleRecords(name) {
  const config = MODULES_DATAVERSE[name]
  try {
    const rows = await safeListRecords(config.table, [config.id, ...Object.values(config.fields), 'createdon'].join(','))
    return rows.map((row) => rowToModuleRecord(config, row))
  } catch (error) {
    if (!isDataverseSchemaError(error)) throw error
    console.warn(`Schema ${config.table} incomplet. Lecture depuis le stockage local ${name}.`)
    return readLocalCollection(name)
  }
}

async function createModuleRecord(name, record) {
  const config = MODULES_DATAVERSE[name]
  try {
    const created = await safeCreateRecord(config.table, moduleRecordToPayload(config, record))
    return rowToModuleRecord(config, { ...moduleRecordToPayload(config, record), ...created })
  } catch (error) {
    if (isDataverseSchemaError(error)) throwDataverseWriteError(config.table, 'creation', error)
    throw error
  }
}

async function updateModuleRecord(name, id, changes) {
  const config = MODULES_DATAVERSE[name]
  try {
    const updated = await safeUpdateRecord(config.table, id, moduleRecordToPayload(config, changes))
    return rowToModuleRecord(config, { ...moduleRecordToPayload(config, changes), ...updated, [config.id]: id })
  } catch (error) {
    if (isDataverseSchemaError(error)) throwDataverseWriteError(config.table, 'mise a jour', error)
    throw error
  }
}

// ---- Emplacements ----------------------------------------------------------
export async function getEmplacements() {
  const rows = await safeListRecords('fmaint_emplacements', 'fmaint_emplacementid,fmaint_nom,fmaint_type,_fmaint_emplacementparent_value')
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
  const r = await safeCreateRecord('fmaint_emplacements', payload)

  return { parentId: null, ...nouvelEmplacement, id: r.fmaint_emplacementid }
}

// ---- Catégories d'actif -----------------------------------------------------
export async function getCategoriesActif() {
  const rows = await safeListRecords('fmaint_categoriedactifs', 'fmaint_categoriedactifid,fmaint_nomdelacategorie,fmaint_description')
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
  const r = await safeCreateRecord('fmaint_categoriedactifs', payload)

  return { ...nouvelleCategorie, id: r.fmaint_categoriedactifid }
}

// ---- Agences -----------------------------------------------------------------
export async function getAgences() {
  const rows = await safeListRecords('fmaint_agences', 'fmaint_agenceid,fmaint_nomagence,fmaint_telephone')
  return rows.map((r) => ({
    id: r.fmaint_agenceid,
    nom: r.fmaint_nomagence,
    telephone: r.fmaint_telephone || '',
  }))
}

// ---- Techniciens --------------------------------------------------------------
export async function getTechniciens() {
  const rows = await safeListRecords(
    'fmaint_techniciens',
    'fmaint_technicienid,fmaint_nomtechnicien,fmaint_telephone,fmaint_email,fmaint_domaine,fmaint_specialite,fmaint_zone,fmaint_reference',
  )
  return rows.map((r) => ({
    id: r.fmaint_technicienid,
    nom: r.fmaint_nomtechnicien,
    telephone: r.fmaint_telephone || '',
    email: r.fmaint_email || '',
    domaine: r.fmaint_domaine || '',
    specialite: r.fmaint_specialite || '',
  }))
}

export async function createTechnicien(nouveauTechnicien) {
  const payloadComplet = {
    fmaint_nomtechnicien: nouveauTechnicien.nom,
    fmaint_telephone: nouveauTechnicien.telephone || '',
    fmaint_email: nouveauTechnicien.email || nouveauTechnicien.emailContact || '',
    fmaint_domaine: nouveauTechnicien.domaine || '',
    fmaint_specialite: nouveauTechnicien.specialite || '',
    fmaint_zone: nouveauTechnicien.ville || '',
    fmaint_reference: nouveauTechnicien.matricule || '',
  }
  try {
    const r = await safeCreateRecord('fmaint_techniciens', payloadComplet)
    return {
      id: r.fmaint_technicienid,
      nom: r.fmaint_nomtechnicien || nouveauTechnicien.nom,
      telephone: r.fmaint_telephone || nouveauTechnicien.telephone || '',
      email: r.fmaint_email || nouveauTechnicien.email || nouveauTechnicien.emailContact || '',
      domaine: r.fmaint_domaine || nouveauTechnicien.domaine || '',
      specialite: r.fmaint_specialite || nouveauTechnicien.specialite || '',
    }
  } catch (error) {
    if (isDataverseSchemaError(error)) throwDataverseWriteError('fmaint_techniciens', 'creation', error)
    throw error
  }
}

// ---- Actifs -----------------------------------------------------------------
export async function getActifs() {
  const rows = await safeListRecords('fmaint_actifs', 'fmaint_actifid,fmaint_nom,fmaint_numerodeserie,fmaint_statut,_fmaint_emplacementid_value,_fmaint_categoriedactifid_value,fmaint_datedacquisition,fmaint_datedefindegarantie,fmaint_valeur,fmaint_codeinventaire')
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
}

export async function genererProchainCodeInventaire() {
  const annee = new Date().getFullYear()
  const prefixe = `INV-${annee}-`
  const rows = await safeListRecords('fmaint_actifs', 'fmaint_codeinventaire')
  const numeros = rows
    .map((r) => r.fmaint_codeinventaire)
    .filter((code) => code && code.startsWith(prefixe))
    .map((code) => Number(code.slice(prefixe.length)) || 0)
  const prochain = (numeros.length ? Math.max(...numeros) : 0) + 1
  return `${prefixe}${String(prochain).padStart(4, '0')}`
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
  const r = await safeCreateRecord('fmaint_actifs', payload)

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
    await safeUpdateRecord('fmaint_actifs', id, { fmaint_statut: code })
  }
  return { id, statut }
}

// ---- Ordres de travail -------------------------------------------------------
export async function getOrdresTravail() {
  const rows = await safeListRecords('fmaint_ordredetravails', 'fmaint_ordredetravailid,fmaint_nomordre,statecode,fmaint_urgent,_fmaint_technicienid_value,fmaint_dateintervention,fmaint_dureeheures')
  return rows.map((r) => ({
    id: r.fmaint_ordredetravailid,
    numero: r.fmaint_nomordre,
    titre: r.fmaint_nomordre,
    statut: getFormatted(r, 'statecode') || 'Nouveau',
    priorite: r.fmaint_urgent ? 'Critique' : 'Moyenne',
    technicien: getFormatted(r, '_fmaint_technicienid_value') || null,
    dateEcheance: r.fmaint_dateintervention ? r.fmaint_dateintervention.slice(0, 10) : null,
    dureeHeures: r.fmaint_dureeheures || 0,
    actifId: null,
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
  // La table fmaint_ordredetravail dans l'environnement FirstMaint n'a pas de lookup Actif.
  const r = await safeCreateRecord('fmaint_ordredetravails', payload)

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
  const rows = await safeListRecords('fmaint_tickets', 'fmaint_ticketid,fmaint_titre,fmaint_description,statecode,_fmaint_agenceid_value,fmaint_urgence,_fmaint_ordredetravailid_value')
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
  await safeUpdateRecord('fmaint_tickets', id, {
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
  const r = await safeCreateRecord('fmaint_tickets', payload)
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
    nom: r.fmaint_nomutilisateur,
    email: r.fmaint_email,
    role: r.fmaint_role || 'Opérateur DMG',
    statut: getFormatted(r, 'statecode') || 'Actif',
    siteId: null,
  }
}

const CHAMPS_UTILISATEUR = 'fmaint_utilisateurid,fmaint_nomutilisateur,fmaint_email,fmaint_role,statecode'

export async function getUtilisateurs() {
  const rows = await safeListRecords('fmaint_utilisateurs', CHAMPS_UTILISATEUR)
  return rows.map(mapUtilisateur)
}

export async function createUtilisateur(nouvelUtilisateur) {
  const payload = {
    fmaint_nomutilisateur: nouvelUtilisateur.nom,
    fmaint_email: nouvelUtilisateur.email,
  }
  if (nouvelUtilisateur.role) payload.fmaint_role = nouvelUtilisateur.role
  const r = await safeCreateRecord('fmaint_utilisateurs', payload)
  return mapUtilisateur(r)
}

export async function updateUtilisateurRole(id, role) {
  throw new Error('La table fmaint_utilisateurs ne contient pas encore de colonne de rôle.')
}

export async function updateUtilisateurStatut(id, statut) {
  const r = await safeUpdateRecord('fmaint_utilisateurs', id, { statecode: statut === 'Actif' ? 0 : 1 })
  return mapUtilisateur(r)
}

// Retrouve l'utilisateur courant par email, ou le crée avec le rôle le moins
// privilégié par défaut — répond à "créer un utilisateur quand il se connecte".
export async function getOrCreateUtilisateurCourant(email, nomPropose) {
  const emailEchappe = email.replace(/'/g, "''")
  const rows = await safeListRecords('fmaint_utilisateurs', CHAMPS_UTILISATEUR, `fmaint_email eq '${emailEchappe}'`)
  const utilisateurTrouve = rows.find((row) => row.fmaint_email?.toLowerCase() === email.toLowerCase())
  if (utilisateurTrouve) return mapUtilisateur(utilisateurTrouve)
  return createUtilisateur({ nom: nomPropose || email, email, role: 'Opérateur DMG', statut: 'Actif' })
}

// ---- Discussion sur ticket (table Dataverse fmaint_commentaireticket, accès authentifié) --
export async function getCommentairesTicket(ticketId) {
  const rows = await safeListRecords(
    'fmaint_commentairetickets',
    'fmaint_commentaireticketid,fmaint_message,fmaint_auteur,fmaint_estreponsebanque,_fmaint_ticketid_value,createdon',
    `_fmaint_ticketid_value eq ${ticketId}`,
    'createdon asc',
  )
  return rows
    .filter((r) => {
      const bind = r['fmaint_TicketID@odata.bind'] || ''
      return r._fmaint_ticketid_value === ticketId || bind.includes(`(${ticketId})`)
    })
    .map((r) => ({
    id: r.fmaint_commentaireticketid,
    message: r.fmaint_message,
    auteur: r.fmaint_auteur,
    estReponseBanque: !!r.fmaint_estreponsebanque,
    date: r.createdon,
  }))
}

export async function createCommentaireTicket(ticketId, message, auteur, estReponseBanque = false) {
  const r = await safeCreateRecord('fmaint_commentairetickets', {
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

// ---- Modules non encore exposes comme tables Dataverse ----------------------
// Ces modules etaient herites de dataService.js avec des retours temporaires
// en memoire. On les persiste dans localStorage pour eviter la perte au refresh,
// en attendant la creation des tables Dataverse correspondantes.
export async function getPlansPreventifs() {
  return listModuleRecords('plansPreventifs')
}

export async function getEcheancesPlan() {
  return listModuleRecords('echeancesPlan')
}

export async function createPlanPreventif(nouveauPlan) {
  return createModuleRecord('plansPreventifs', { etatCycleVie: 'Brouillon', ...nouveauPlan })
}

export async function updatePlanPreventif(id, changements) {
  return updateModuleRecord('plansPreventifs', id, changements)
}

export async function validerPlanPreventif(id, validateur, dateDebut) {
  return updateModuleRecord('plansPreventifs', id, {
    etatCycleVie: 'Actif',
    validateur,
    dateDebut,
  })
}

export async function proposerDateIntervention(id, date) {
  return safeUpdateRecord('fmaint_ordredetravails', id, { fmaint_dateintervention: date })
}

export async function validerDateIntervention(id, date) {
  return safeUpdateRecord('fmaint_ordredetravails', id, { fmaint_dateintervention: date })
}

function mapFournisseur(r) {
  return {
    id: r.fmaint_fournisseurid || r.id,
    nom: r.fmaint_nomfournisseur || r.nom,
    contact: r.fmaint_contact || r.contact || '',
    telephone: r.fmaint_telephone || r.telephone || '',
    email: r.fmaint_email || r.email || '',
    specialite: r.fmaint_specialite || r.specialite || r.domaine || '',
    domaine: r.fmaint_domaine || r.domaine || r.fmaint_specialite || r.specialite || '',
    rccm: r.fmaint_rccm || r.rccm || '',
    statutPrestataire: r.fmaint_statutprestataire || r.statutPrestataire || 'Actif',
    ville: r.fmaint_zone || r.ville || '',
  }
}

export async function getFournisseurs() {
  let rowsDataverse = []
  try {
    rowsDataverse = await safeListRecords(
      'fmaint_fournisseurs',
      'fmaint_fournisseurid,fmaint_nomfournisseur,fmaint_contact,fmaint_telephone,fmaint_email,fmaint_specialite,fmaint_domaine,fmaint_rccm,fmaint_statutprestataire,fmaint_zone',
    )
  } catch (error) {
    if (!isDataverseSchemaError(error)) throw error
    console.warn('Schema fmaint_fournisseurs incomplet. Lecture vide pour eviter une fausse connexion locale.')
  }
  return rowsDataverse.map(mapFournisseur)
}

export async function createFournisseur(nouveauFournisseur) {
  const payloadComplet = {
    fmaint_nomfournisseur: nouveauFournisseur.nom,
    fmaint_contact: nouveauFournisseur.contact || '',
    fmaint_telephone: nouveauFournisseur.telephone || '',
    fmaint_email: nouveauFournisseur.email || '',
    fmaint_specialite: nouveauFournisseur.specialite || nouveauFournisseur.domaine || '',
    fmaint_domaine: nouveauFournisseur.domaine || nouveauFournisseur.specialite || '',
    fmaint_rccm: nouveauFournisseur.rccm || '',
    fmaint_statutprestataire: nouveauFournisseur.statutPrestataire || 'Actif',
    fmaint_zone: nouveauFournisseur.ville || '',
  }
  try {
    const r = await safeCreateRecord('fmaint_fournisseurs', payloadComplet)
    return mapFournisseur({ ...payloadComplet, ...r })
  } catch (error) {
    if (isDataverseSchemaError(error)) throwDataverseWriteError('fmaint_fournisseurs', 'creation', error)
    throw error
  }
}

export async function enregistrerProfilIntervenant(profil) {
  const profilComplet = createLocalRecord('profilsIntervenants', 'int', {
    ...profil,
    dateEnregistrement: new Date().toISOString(),
  })

  if (profil.type === 'Prestataire') {
    const fournisseur = await createFournisseur({
      nom: profil.entreprise || profil.nom,
      contact: profil.nom,
      telephone: profil.telephone,
      email: profil.emailContact,
      specialite: profil.specialite,
      domaine: profil.domaine,
      rccm: profil.matricule,
      statutPrestataire: 'Actif',
      ville: profil.ville,
    })
    return { ...profilComplet, fournisseur }
  }

  const technicien = await createTechnicien({
    nom: profil.nom,
    telephone: profil.telephone,
    email: profil.emailContact,
    domaine: profil.domaine,
    specialite: profil.specialite,
    ville: profil.ville,
    matricule: profil.matricule,
  })
  return { ...profilComplet, technicien }
}

export async function getContrats() {
  return listModuleRecords('contrats')
}

export async function createContrat(nouveauContrat) {
  return createModuleRecord('contrats', nouveauContrat)
}

export async function getSlaRules() {
  return listModuleRecords('slaRules')
}

export async function createSlaRule(nouvelleRegle) {
  return createModuleRecord('slaRules', nouvelleRegle)
}

export async function getSlaMeasures() {
  return listModuleRecords('slaMeasures')
}

export async function createSlaMeasure(nouvelleMesure) {
  return createModuleRecord('slaMeasures', nouvelleMesure)
}

export async function getPenalites() {
  return listModuleRecords('penalites')
}

export async function createPenalite(nouvellePenalite) {
  return createModuleRecord('penalites', nouvellePenalite)
}

export async function updatePenaliteStatut(id, statut) {
  return updateModuleRecord('penalites', id, { statut })
}

export async function getValidationsPaiement() {
  return listModuleRecords('validationsPaiement')
}

export async function updateValidationPaiementStatut(id, statut, validateur) {
  return updateModuleRecord('validationsPaiement', id, { statut, validateur, dateValidation: new Date().toISOString().slice(0, 10) })
}

export async function getEvaluationsPrestataires() {
  return listModuleRecords('evaluationsPrestataires')
}

export async function createEvaluationPrestataire(nouvelleEvaluation) {
  return createModuleRecord('evaluationsPrestataires', nouvelleEvaluation)
}

export async function getCles() {
  return listModuleRecords('cles')
}

export async function createCle(nouvelleCle) {
  return createModuleRecord('cles', nouvelleCle)
}

export async function getMouvementsCles() {
  return listModuleRecords('mouvementsCles')
}

export async function createMouvementCle(nouveauMouvement) {
  return createModuleRecord('mouvementsCles', nouveauMouvement)
}

export async function getProjetsImmobiliers() {
  return listModuleRecords('projetsImmobiliers')
}

export async function createProjetImmobilier(nouveauProjet) {
  return createModuleRecord('projetsImmobiliers', nouveauProjet)
}

export async function getJalonsProjets() {
  return listModuleRecords('jalonsProjets')
}

export async function createJalonProjet(nouveauJalon) {
  return createModuleRecord('jalonsProjets', nouveauJalon)
}

export async function updateJalonProjet(id, statut) {
  return updateModuleRecord('jalonsProjets', id, { statut })
}

export async function updateProjetBudgetConsomme(id, montantDepense) {
  return updateModuleRecord('projetsImmobiliers', id, { budgetConsomme: montantDepense })
}

export async function receptionnerProjet(id) {
  return updateModuleRecord('projetsImmobiliers', id, { statut: 'Termine' })
}

export async function getTachesWorkflow() {
  return listModuleRecords('tachesWorkflow')
}

export async function updateTacheWorkflowStatut(id, statut) {
  return updateModuleRecord('tachesWorkflow', id, { statut })
}

export async function createTacheWorkflow(nouvelleTache) {
  return createModuleRecord('tachesWorkflow', nouvelleTache)
}

export async function getAlertesAutomatiques() {
  return listModuleRecords('alertesAutomatiques')
}

export async function createAlerteAutomatique(nouvelleAlerte) {
  return createModuleRecord('alertesAutomatiques', nouvelleAlerte)
}

export async function marquerAlerteLue(id) {
  return updateModuleRecord('alertesAutomatiques', id, { lu: true })
}

export async function getPiecesRechange() {
  return listModuleRecords('piecesRechange')
}

export async function createPieceRechange(nouvellePiece) {
  return createModuleRecord('piecesRechange', nouvellePiece)
}

export async function getMouvementsStock() {
  return listModuleRecords('mouvementsStock')
}

export async function createMouvementStock(nouveauMouvement) {
  return createModuleRecord('mouvementsStock', nouveauMouvement)
}

export async function getConsommationsEnergie() {
  return listModuleRecords('consommationsEnergie')
}

export async function createConsommationEnergie(nouvelleConso) {
  return createModuleRecord('consommationsEnergie', nouvelleConso)
}

export async function getJournalAudit() {
  return listModuleRecords('journalAudit')
}

export async function ajouterAudit(entree) {
  return createModuleRecord('journalAudit', { date: new Date().toISOString(), ...entree })
}

export async function getFichesAnalysePostIncident() {
  return listModuleRecords('fichesAnalysePostIncident')
}

export async function getRapportsMensuels() {
  return listModuleRecords('rapportsMensuels')
}
