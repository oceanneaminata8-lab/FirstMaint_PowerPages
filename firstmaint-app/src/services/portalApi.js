// Accès au Web API de Power Pages (/_api/...) — remplace le SDK Dataverse
// typé du Power Apps Code App (@microsoft/power-apps/data), qui ne fonctionne
// que dans le lecteur Power Apps. Ici, le jeton anti-forgery est récupéré via
// /_layout/tokenhtml (pattern documenté par Microsoft pour les sites SPA Power
// Pages), aucune dépendance MSAL n'est nécessaire pour cette partie.

let tokenPromise = null

async function fetchRequestVerificationToken() {
  const response = await fetch('/_layout/tokenhtml', { credentials: 'same-origin' })
  const html = await response.text()
  const match = html.match(/value="([^"]+)"/)
  if (!match) throw new Error('Jeton anti-forgery introuvable (/_layout/tokenhtml).')
  return match[1]
}

// Le jeton est valable pour toute la session : on ne le récupère qu'une fois.
// Exporté pour être réutilisé par portalAuth.js (formulaire de connexion Entra ID).
export function getRequestVerificationToken() {
  if (!tokenPromise) tokenPromise = fetchRequestVerificationToken()
  return tokenPromise
}

// Inclut les valeurs "affichage" des lookups/picklists (ex. fmaint_typename,
// statecodename), équivalent de ce que fournissait le SDK Code App.
const PREFER_FORMATTED_VALUES = 'odata.include-annotations="OData.Community.Display.V1.FormattedValue"'

export async function portalGet(entitySet, query = '') {
  const token = await getRequestVerificationToken()
  const response = await fetch(`/_api/${entitySet}${query}`, {
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      Prefer: PREFER_FORMATTED_VALUES,
      __RequestVerificationToken: token,
    },
  })
  if (!response.ok) {
    throw new Error(`Web API Power Pages — échec de lecture "${entitySet}" (${response.status}).`)
  }
  const data = await response.json()
  return data.value
}

export async function portalPost(entitySet, payload) {
  const token = await getRequestVerificationToken()
  const response = await fetch(`/_api/${entitySet}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Prefer: `return=representation, ${PREFER_FORMATTED_VALUES}`,
      __RequestVerificationToken: token,
    },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Web API Power Pages — échec de création dans "${entitySet}" (${response.status}).`)
  }
  return response.json()
}

// Lit la valeur "affichage" d'un champ lookup/picklist sur un enregistrement
// renvoyé par portalGet/portalPost (ex. getFormatted(r, 'fmaint_type')).
export function getFormatted(record, field) {
  return record[`${field}@OData.Community.Display.V1.FormattedValue`]
}
