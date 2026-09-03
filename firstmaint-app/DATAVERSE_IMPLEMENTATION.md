# Dataverse Implementation Template

This template shows how to convert existing mock-based functions to Dataverse API calls.

## Step 1: Create Dataverse Service Wrapper

Create `src/services/dataverseClient.js`:

```javascript
import axios from 'axios'

// Configuration
const DATAVERSE_URL = import.meta.env.VITE_DATAVERSE_URL || 'https://your-env.api.crm.dynamics.com/api/data/v9.2'

// Headers for all requests
function getHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Prefer: 'odata.include-annotations="OData.Community.Display.V1.FormattedValue"'
  }
}

// Generic GET request
export async function get(endpoint, query = '', token) {
  try {
    const response = await axios.get(
      `${DATAVERSE_URL}/${endpoint}${query}`,
      { headers: getHeaders(token) }
    )
    return response.data.value || response.data
  } catch (error) {
    console.error(`GET ${endpoint} failed:`, error.response?.data || error.message)
    throw error
  }
}

// Generic POST request
export async function post(endpoint, data, token) {
  try {
    const response = await axios.post(
      `${DATAVERSE_URL}/${endpoint}`,
      data,
      { 
        headers: {
          ...getHeaders(token),
          Prefer: 'return=representation, odata.include-annotations="OData.Community.Display.V1.FormattedValue"'
        }
      }
    )
    return response.data
  } catch (error) {
    console.error(`POST ${endpoint} failed:`, error.response?.data || error.message)
    throw error
  }
}

// Generic PATCH request
export async function patch(endpoint, recordId, changes, token) {
  try {
    const response = await axios.patch(
      `${DATAVERSE_URL}/${endpoint}(${recordId})`,
      changes,
      { 
        headers: {
          ...getHeaders(token),
          Prefer: 'return=representation, odata.include-annotations="OData.Community.Display.V1.FormattedValue"'
        }
      }
    )
    return response.data
  } catch (error) {
    console.error(`PATCH ${endpoint} failed:`, error.response?.data || error.message)
    throw error
  }
}

// Generic DELETE request
export async function del(endpoint, recordId, token) {
  try {
    await axios.delete(
      `${DATAVERSE_URL}/${endpoint}(${recordId})`,
      { headers: getHeaders(token) }
    )
  } catch (error) {
    console.error(`DELETE ${endpoint} failed:`, error.response?.data || error.message)
    throw error
  }
}
```

---

## Step 2: Update .env Configuration

Create `.env.local`:

```env
VITE_DATAVERSE_URL=https://yourenv.api.crm.dynamics.com/api/data/v9.2
VITE_CLIENT_ID=your-app-registration-client-id
VITE_TENANT_ID=your-tenant-id
VITE_AUTHORITY=https://login.microsoftonline.com/your-tenant-id
```

---

## Step 3: Create Token Provider Hook

Create `src/hooks/useDataverseToken.js`:

```javascript
import { useMsal } from '@azure/msal-react'
import { useEffect, useState } from 'react'

export function useDataverseToken() {
  const { instance, accounts } = useMsal()
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function getToken() {
      try {
        if (!accounts || accounts.length === 0) {
          throw new Error('No account found. Please login first.')
        }

        const response = await instance.acquireTokenSilent({
          scopes: [
            `${import.meta.env.VITE_DATAVERSE_URL.split('/api')[0]}/.default`
          ],
          account: accounts[0],
        })
        setToken(response.accessToken)
      } catch (err) {
        setError(err)
        console.error('Failed to acquire token:', err)
      } finally {
        setLoading(false)
      }
    }

    getToken()
  }, [instance, accounts])

  return { token, loading, error }
}
```

---

## Step 4: Convert Functions - BEFORE/AFTER Examples

### Example 1: getActifs()

**BEFORE (Mock Data):**
```javascript
export async function getActifs() {
  return mockActifs
}
```

**AFTER (Dataverse):**
```javascript
import * as dv from './dataverseClient'

export async function getActifs(token) {
  if (!token) throw new Error('No authentication token provided')
  
  const query = `?$select=fmaint_actifsid,fmaint_name,fmaint_description,fmaint_statut,fmaint_criticite,fmaint_dateacquisition,fmaint_valeurnet,fmaint_emplacement,fmaint_categorie
  &$expand=fmaint_emplacement($select=fmaint_name)
  &$expand=fmaint_categorie($select=fmaint_name)
  &$filter=statecode eq 0
  &$orderby=fmaint_name asc`
  
  const records = await dv.get('fmaint_actifs', query, token)
  
  // Transform Dataverse records to app format
  return records.map(r => ({
    id: r.fmaint_actifsid,
    nom: r.fmaint_name,
    description: r.fmaint_description,
    statut: r.fmaint_statut_formatted || 'En service',
    criticite: r.fmaint_criticite_formatted || 'Moyenne',
    dateAcquisition: r.fmaint_dateacquisition,
    valeurNet: r.fmaint_valeurnet,
    emplacementId: r._fmaint_emplacement_value,
    emplacementNom: r.fmaint_emplacement?.fmaint_name || '',
    categorieId: r._fmaint_categorie_value,
    categorieNom: r.fmaint_categorie?.fmaint_name || '',
    codeInventaire: r.fmaint_codeinventaire,
    numeroSerie: r.fmaint_numero_serie,
  }))
}
```

### Example 2: createActif()

**BEFORE (Mock Data):**
```javascript
export async function createActif(nouvelActif) {
  const id = Math.random().toString(36).substr(2, 9)
  const actif = { id, ...nouvelActif, etat: 'Actif', dateCreation: new Date() }
  mockActifs.push(actif)
  return actif
}
```

**AFTER (Dataverse):**
```javascript
export async function createActif(nouvelActif, token) {
  if (!token) throw new Error('No authentication token provided')
  
  const payload = {
    fmaint_name: nouvelActif.nom,
    fmaint_description: nouvelActif.description,
    fmaint_criticite: getCriticiteCode(nouvelActif.criticite),
    fmaint_statut: 607570000, // En service
    fmaint_emplacement@odata.bind: `/fmaint_emplacements(${nouvelActif.emplacementId})`,
    fmaint_categorie@odata.bind: `/fmaint_categorie_actifs(${nouvelActif.categorieId})`,
    fmaint_dateacquisition: nouvelActif.dateAcquisition,
    fmaint_valeurnet: nouvelActif.valeurNet,
    fmaint_numero_serie: nouvelActif.numeroSerie,
  }
  
  const created = await dv.post('fmaint_actifs', payload, token)
  
  return {
    id: created.fmaint_actifsid,
    nom: created.fmaint_name,
    description: created.fmaint_description,
    statut: 'En service',
    criticite: nouvelActif.criticite,
    // ... other fields
  }
}

function getCriticiteCode(criticite) {
  const codes = {
    'Critique': 607570000,
    'Haute': 607570001,
    'Moyenne': 607570002,
    'Basse': 607570003,
  }
  return codes[criticite] || 607570002
}
```

### Example 3: updateActifStatut()

**BEFORE (Mock Data):**
```javascript
export async function updateActifStatut(id, statut) {
  const actif = mockActifs.find(a => a.id === id)
  if (actif) actif.statut = statut
  return actif
}
```

**AFTER (Dataverse):**
```javascript
export async function updateActifStatut(id, statut, token) {
  if (!token) throw new Error('No authentication token provided')
  
  const statutCode = STATUT_ACTIF_CODES[statut]
  if (!statutCode) throw new Error(`Invalid status: ${statut}`)
  
  const updated = await dv.patch(
    'fmaint_actifs',
    id,
    { fmaint_statut: statutCode },
    token
  )
  
  return {
    id: updated.fmaint_actifsid,
    statut: updated.fmaint_statut_formatted || statut,
  }
}
```

### Example 4: getOrdresTravail()

**BEFORE (Mock Data):**
```javascript
export async function getOrdresTravail() {
  return mockOrdresTravail
}
```

**AFTER (Dataverse):**
```javascript
export async function getOrdresTravail(token) {
  if (!token) throw new Error('No authentication token provided')
  
  const query = `?$select=fmaint_ordretravailid,fmaint_name,fmaint_description,fmaint_statut,fmaint_priorite,fmaint_datedemande,fmaint_dateintervention,fmaint_actif,fmaint_technicien
  &$expand=fmaint_actif($select=fmaint_name)
  &$expand=fmaint_technicien($select=fmaint_name)
  &$filter=statecode eq 0
  &$orderby=fmaint_datedemande desc`
  
  const records = await dv.get('fmaint_ordretravails', query, token)
  
  return records.map(r => ({
    id: r.fmaint_ordretravailid,
    numero: r.fmaint_name,
    description: r.fmaint_description,
    statut: r.fmaint_statut_formatted || 'En attente',
    priorite: r.fmaint_priorite_formatted || 'Normal',
    dateCreation: r.fmaint_datedemande,
    dateIntervention: r.fmaint_dateintervention,
    actifId: r._fmaint_actif_value,
    actifNom: r.fmaint_actif?.fmaint_name || '',
    technicienId: r._fmaint_technicien_value,
    technicienNom: r.fmaint_technicien?.fmaint_name || '',
  }))
}
```

---

## Step 5: Update Components to Pass Token

Update components that call dataService functions:

**BEFORE:**
```javascript
export function ActifsList() {
  const [actifs, setActifs] = useState([])
  
  useEffect(() => {
    dataService.getActifs().then(setActifs)
  }, [])
  
  return <div>...</div>
}
```

**AFTER:**
```javascript
import { useDataverseToken } from '../hooks/useDataverseToken'

export function ActifsList() {
  const [actifs, setActifs] = useState([])
  const { token, loading, error } = useDataverseToken()
  
  useEffect(() => {
    if (token) {
      dataService.getActifs(token).then(setActifs)
    }
  }, [token])
  
  if (loading) return <div>Loading authentication...</div>
  if (error) return <div>Authentication failed: {error.message}</div>
  
  return <div>...</div>
}
```

---

## Step 6: Error Handling & Retry Logic

Create `src/services/retryClient.js`:

```javascript
export async function withRetry(fn, maxRetries = 3, delay = 1000) {
  let lastError
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Don't retry on 401/403 (auth errors)
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw error
      }
      
      // Don't retry on 404 (not found)
      if (error.response?.status === 404) {
        throw error
      }
      
      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
  }
  
  throw lastError
}
```

Use it:

```javascript
export async function getActifs(token) {
  return withRetry(() => {
    const query = `?$select=...`
    return dv.get('fmaint_actifs', query, token)
  })
}
```

---

## Implementation Checklist

For each function in dataService.js:

- [ ] Identify mock data source
- [ ] Determine Dataverse table and fields
- [ ] Write Dataverse query ($select, $filter, $expand)
- [ ] Write transformation logic (Dataverse → app format)
- [ ] Add error handling
- [ ] Test with actual Dataverse data
- [ ] Update calling components to pass token
- [ ] Add loading/error states in UI

---

## Migration Strategy

1. **Phase 1**: Core read operations
   - `getActifs()`
   - `getEmplacements()`
   - `getOrdresTravail()`
   - `getTickets()`

2. **Phase 2**: Core write operations
   - `createActif()`
   - `createOrdreTravail()`
   - `createTicket()`

3. **Phase 3**: Status/state updates
   - `updateActifStatut()`
   - `updateOrdreTravailStatut()`
   - All state transition functions

4. **Phase 4**: Extended features
   - Maintenance plans
   - Suppliers, contracts
   - SLA, penalties
   - Key management
   - Projects

5. **Phase 5**: Cleanup
   - Remove mock data dependencies
   - Remove fallback to mockData
   - Performance optimization
   - Caching strategy

---

## Testing Each Function

Template test:

```javascript
import { getActifs } from './dataService'

async function testGetActifs() {
  try {
    // Get token from MSAL (in browser console)
    const token = '<paste-actual-token>'
    
    // Call function
    const actifs = await getActifs(token)
    
    // Verify results
    console.assert(Array.isArray(actifs), 'Should return array')
    console.assert(actifs.length > 0, 'Should have records')
    console.assert(actifs[0].id, 'Records should have id')
    console.assert(actifs[0].nom, 'Records should have nom')
    
    console.log('✓ getActifs() passed', actifs)
  } catch (error) {
    console.error('✗ getActifs() failed:', error)
  }
}
```

---

## Common Mistakes to Avoid

1. ❌ Forgetting to pass `token` to updated functions
2. ❌ Not transforming Dataverse field names (fmaint_name → nom)
3. ❌ Mixing mock data and Dataverse calls
4. ❌ Not handling null/undefined lookup values
5. ❌ Forgetting `@odata.bind` syntax for relationships
6. ❌ Not awaiting async calls
7. ❌ Ignoring formatted value suffixes (_formatted, _label)
8. ❌ Not setting proper headers (Authorization, Prefer)

---

## Next Steps

1. Create `dataverseClient.js` wrapper
2. Set up `.env.local` with your Dataverse URL
3. Create `useDataverseToken` hook
4. Start converting functions phase by phase
5. Test each phase thoroughly
6. Deploy to production when all phases complete
