# Dataverse API Quick Reference

## Table Mappings

### Actif (fmaint_actif)
```javascript
{
  fmaint_actifsid: "guid",
  fmaint_name: "string",               // nom
  fmaint_description: "string",        // description
  fmaint_statut: "OptionSet",          // En service, En panne, En maintenance, Retiré
  fmaint_criticite: "OptionSet",       // Critique, Haute, Moyenne, Basse
  fmaint_emplacement: "Lookup",        // Reference to Emplacement
  fmaint_categorie: "Lookup",          // Reference to Categorie Actif
  fmaint_dateacquisition: "datetime",  // dateAcquisition
  fmaint_valeurnet: "decimal",         // valeurNet
  fmaint_codeinventaire: "string",     // codeInventaire
  fmaint_numero_serie: "string",       // numeroSerie
  statecode: "OptionSet",              // Active/Inactive
  createdon: "datetime",               // automatic
  createdby: "Lookup",                 // automatic
}
```

### Emplacement (fmaint_emplacement)
```javascript
{
  fmaint_emplacementsid: "guid",
  fmaint_name: "string",               // nom
  fmaint_type: "OptionSet",            // Agence, Siège, Étage, Salle
  fmaint_parent: "Lookup",             // Parent emplacement
  fmaint_description: "string",        // description
  statecode: "OptionSet",              // Active/Inactive
}
```

### Ordre de Travail (fmaint_ordretravail)
```javascript
{
  fmaint_ordretravailid: "guid",
  fmaint_name: "string",               // numero
  fmaint_actif: "Lookup",              // Related Actif
  fmaint_description: "string",        // description
  fmaint_statut: "OptionSet",          // Status
  fmaint_priorite: "OptionSet",        // Urgence, Prioritaire, Normal, Basse
  fmaint_technicien: "Lookup",         // Assigned technician
  fmaint_datedemande: "datetime",      // requestDate
  fmaint_dateintervention: "datetime", // interventionDate
  statecode: "OptionSet",              // Active/Inactive
}
```

---

## Common Query Patterns

### Get All Records with Formatted Values
```javascript
const query = `?$select=fmaint_name,fmaint_statut
&$expand=fmaint_emplacement($select=fmaint_name)
&$filter=statecode eq 0
&$orderby=fmaint_name asc
&$top=250`

// Add this to headers:
headers: {
  Prefer: 'odata.include-annotations="OData.Community.Display.V1.FormattedValue"'
}
```

### Filter by Status Code
```javascript
// Get only active records
`?$filter=statecode eq 0`

// Get active + specific status
`?$filter=statecode eq 0 and fmaint_statut eq 607570000`
```

### Expand Related Records
```javascript
`?$select=fmaint_name
&$expand=fmaint_emplacement($select=fmaint_name,fmaint_type)
&$expand=fmaint_categorie($select=fmaint_name)`
```

### Search
```javascript
`?$filter=contains(fmaint_name,'searchterm')`
```

---

## Common CRUD Operations

### CREATE
```javascript
async function createRecord(tableName, data, token) {
  const response = await fetch(
    `${DATAVERSE_URL}/${tableName}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify(data)
    }
  )
  
  if (!response.ok) throw new Error(`Create failed: ${response.status}`)
  return response.json()
}
```

### READ
```javascript
async function getRecords(tableName, query, token) {
  const response = await fetch(
    `${DATAVERSE_URL}/${tableName}${query}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        Prefer: 'odata.include-annotations="OData.Community.Display.V1.FormattedValue"'
      }
    }
  )
  
  if (!response.ok) throw new Error(`Read failed: ${response.status}`)
  const data = await response.json()
  return data.value
}
```

### UPDATE
```javascript
async function updateRecord(tableName, recordId, changes, token) {
  const response = await fetch(
    `${DATAVERSE_URL}/${tableName}(${recordId})`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify(changes)
    }
  )
  
  if (!response.ok) throw new Error(`Update failed: ${response.status}`)
  return response.json()
}
```

### DELETE
```javascript
async function deleteRecord(tableName, recordId, token) {
  const response = await fetch(
    `${DATAVERSE_URL}/${tableName}(${recordId})`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
  
  if (!response.ok) throw new Error(`Delete failed: ${response.status}`)
}
```

---

## Option Set Values (Picklists)

### Statut Actif
- `607570000`: En service
- `607570001`: En panne
- `607570002`: En maintenance
- `607570003`: Retiré

### Type Emplacement
- `607570000`: Agence
- `607570001`: Siège
- `607570002`: Étage
- `607570003`: Salle

### Priorité Ordre Travail
- `607570000`: Urgence
- `607570001`: Prioritaire
- `607570002`: Normal
- `607570003`: Basse

### Status Workflow
- `0`: Active
- `1`: Inactive

---

## Error Handling

```javascript
async function withErrorHandling(fn) {
  try {
    return await fn()
  } catch (error) {
    if (error.response?.status === 401) {
      // Token expired - refresh and retry
      throw new Error('Unauthorized - please login again')
    }
    if (error.response?.status === 404) {
      throw new Error('Record not found')
    }
    if (error.response?.status === 409) {
      throw new Error('Record was modified by another user')
    }
    throw error
  }
}
```

---

## Batch Operations

```javascript
async function batchCreate(tableName, records, token) {
  const batch = records.map((record, index) => ({
    id: String(index),
    method: 'POST',
    url: `/${tableName}`,
    headers: { 'Content-Type': 'application/json' },
    body: record
  }))
  
  const response = await fetch(
    `${DATAVERSE_URL}/$batch`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests: batch })
    }
  )
  
  return response.json()
}
```

---

## Testing with Postman

1. Get token from MSAL:
   ```javascript
   // In browser console
   const account = msal.getAllAccounts()[0]
   const token = await msal.acquireTokenSilent({
     scopes: ['https://yourenv.api.crm.dynamics.com/.default'],
     account
   })
   copy(token.accessToken)
   ```

2. In Postman:
   - Set Authorization: Bearer [paste token]
   - GET `https://yourenv.api.crm.dynamics.com/api/data/v9.2/fmaint_actifs`
   - Add Header: `Prefer: odata.include-annotations="OData.Community.Display.V1.FormattedValue"`

---

## Performance Tips

1. **Use $top and $skip for pagination**:
   ```javascript
   `?$top=50&$skip=0`
   ```

2. **Select only needed columns**:
   ```javascript
   `?$select=fmaint_name,fmaint_statut` // not *
   ```

3. **Cache results locally**:
   ```javascript
   const cache = new Map()
   
   async function getCachedRecords(key, fetchFn) {
     if (cache.has(key)) return cache.get(key)
     const data = await fetchFn()
     cache.set(key, data)
     return data
   }
   ```

4. **Use batch requests for bulk operations**
5. **Implement request debouncing for search**

---

## Debugging

```javascript
// Enable detailed logging
async function debugApiCall(url, options) {
  console.log('API Call:', { url, options })
  const response = await fetch(url, options)
  console.log('Response:', { status: response.status, ok: response.ok })
  const data = await response.json()
  console.log('Data:', data)
  return data
}
```

Use browser DevTools Network tab to:
- Inspect request/response headers
- Check Authorization header present
- Verify Content-Type and Accept headers
- Look for error details in response body
