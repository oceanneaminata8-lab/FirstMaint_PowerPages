# FirstMaint - Dataverse Integration Guide

## Application Verification Report ✓

### Current Status
- ✅ **App is running successfully** on `http://localhost:5173/`
- ✅ **No build errors** - Vite development server started without issues
- ✅ **React components** are properly configured and rendering
- ✅ **Architecture is Dataverse-ready** - Service layer abstraction in place

### Current Architecture

The app uses a **three-layer architecture**:

```
React Components (UI Layer)
         ↓
dataService.js (Service Layer) ← **SINGLE POINT OF CHANGE**
         ↓
Data Sources (Mock Data OR Dataverse Web API)
```

**Key Insight**: To connect to Dataverse, you only need to modify `src/services/dataService.js`. 
All UI components remain unchanged!

---

## Prerequisites for Dataverse Connection

You'll need:

1. **Microsoft Dataverse Environment**
   - Active Dynamics 365 environment or Dataverse standalone instance
   - FirstMaint solution deployed in the environment

2. **Microsoft Entra ID (Azure AD)**
   - Application registration (to get Client ID & Tenant ID)
   - Your user account must have Dataverse access

3. **Power Pages Site (Optional but Recommended)**
   - The app is designed to run on Power Pages
   - Provides automatic authentication + Web API access without MSAL setup

---

## Setup Option 1: Local Development (Without Power Pages)

This approach uses MSAL for Entra ID authentication.

### Step 1: Install Authentication Library

```bash
npm install @azure/msal-browser @azure/msal-react
```

### Step 2: Register Application in Entra ID

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure AD → App registrations → New registration**
3. Configure:
   - **Name**: `FirstMaint-Dev`
   - **Supported account types**: `Accounts in this organizational directory only`
   - **Redirect URI**: `http://localhost:5173/` (add this platform as SPA)
4. After creation, copy:
   - **Client ID** (Application ID)
   - **Tenant ID** (Directory ID)

### Step 3: Create Authentication Configuration

Create `src/services/authConfig.js`:

```javascript
import { PublicClientApplication } from '@azure/msal-browser';

const msalConfig = {
  auth: {
    clientId: 'YOUR_CLIENT_ID_HERE',
    authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID_HERE',
    redirectUri: 'http://localhost:5173/',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const loginRequest = {
  scopes: [
    `https://YOUR_ENVIRONMENT.api.crm.dynamics.com/.default`,
  ],
};
```

### Step 4: Update main.jsx

Replace the content of `src/main.jsx`:

```javascript
import '@fontsource/space-grotesk/500.css' 
import '@fontsource/space-grotesk/600.css' 
import '@fontsource/space-grotesk/700.css' 
import '@fontsource/inter/400.css' 
import '@fontsource/inter/500.css' 
import '@fontsource/inter/600.css' 
import '@fontsource/inter/700.css' 
import '@fontsource/jetbrains-mono/500.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { MsalProvider } from '@azure/msal-react'
import { msalInstance } from './services/authConfig'
import App from './App.jsx'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </React.StrictMode>,
)
```

### Step 5: Integrate Dataverse Web API Calls

Update `src/services/dataService.js` to use Dataverse instead of mock data.

Example pattern for `getActifs()`:

**Before (Mock Data):**
```javascript
export async function getActifs() {
  return mockActifs
}
```

**After (Dataverse):**
```javascript
import { useMsal } from '@azure/msal-react'
import axios from 'axios'

const DATAVERSE_URL = 'https://YOUR_ENVIRONMENT.api.crm.dynamics.com/api/data/v9.2'

export async function getActifs(token) {
  try {
    const response = await axios.get(
      `${DATAVERSE_URL}/fmaint_actifs?$select=fmaint_actifsid,fmaint_name,fmaint_statut,fmaint_criticite`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    )
    return response.data.value.map(actif => ({
      id: actif.fmaint_actifsid,
      nom: actif.fmaint_name,
      statut: actif.fmaint_statut_formatted || 'En service',
      criticite: actif.fmaint_criticite_formatted || 'Moyenne',
      // ... map other fields
    }))
  } catch (error) {
    console.error('Failed to fetch actifs:', error)
    throw error
  }
}
```

---

## Setup Option 2: Power Pages Deployment (Recommended)

If you're deploying to Power Pages, the authentication is automatic.

### Step 1: Deploy to Power Pages

```bash
# Build for Power Pages
npm run build:powerapps

# This creates optimized build in ./dist-powerapps/
```

### Step 2: Upload to Power Pages

Use the [Power Pages CLI](https://learn.microsoft.com/en-us/power-pages/configure/cli-overview):

```bash
pac powerpages download --path .
pac powerpages upload --path .
```

### Step 3: Update dataService.js for Power Pages

Power Pages provides automatic authentication via `/_layout/tokenhtml`.

The app already has this configured! Just ensure:
- `src/services/portalApi.js` is used for all API calls
- Token is fetched automatically
- No additional MSAL setup needed

---

## Implementation Checklist

### Phase 1: Authentication Setup
- [ ] Install MSAL library (`npm install @azure/msal-browser @azure/msal-react`)
- [ ] Register app in Entra ID
- [ ] Create `authConfig.js` with correct credentials
- [ ] Update `main.jsx` with MsalProvider
- [ ] Test login flow in browser

### Phase 2: Dataverse Tables
- [ ] Verify FirstMaint solution tables exist:
  - [ ] `fmaint_actif`
  - [ ] `fmaint_emplacement`
  - [ ] `fmaint_categorie_actif`
  - [ ] `fmaint_ordretravail`
  - [ ] `fmaint_ticket`
- [ ] Document table schema and field mappings
- [ ] Set appropriate security roles and table permissions

### Phase 3: Data Service Layer
- [ ] Update `getActifs()` to query Dataverse
- [ ] Update `createActif()` to write to Dataverse
- [ ] Update `getOrdresTravail()` to query Dataverse
- [ ] Update remaining CRUD operations
- [ ] Test each function individually

### Phase 4: Integration Testing
- [ ] Login with Entra ID credentials
- [ ] Verify data loads from Dataverse
- [ ] Test create/update/delete operations
- [ ] Check for any console errors
- [ ] Performance test with large datasets

### Phase 5: Production Deployment
- [ ] Deploy to Power Pages
- [ ] Test in production environment
- [ ] Remove mock data dependencies (optional)
- [ ] Configure security roles

---

## Key Functions to Update

Priority order for connecting to Dataverse:

### High Priority (Core Operations)
1. `getActifs()` - Read actifs
2. `createActif()` - Create actif
3. `getEmplacements()` - Read emplacements
4. `getOrdresTravail()` - Read work orders
5. `createOrdreTravail()` - Create work order

### Medium Priority (Status Updates)
6. `updateActifStatut()` - Update actif status
7. `updateOrdreTravailStatut()` - Update order status
8. `updateTicketStatut()` - Update ticket status

### Lower Priority (Extended Features)
9. Tickets, preventive maintenance, suppliers
10. Auditing, analytics, reporting

---

## Common Issues & Solutions

### Issue: CORS Errors
**Cause**: Browser blocks cross-origin requests to Dataverse
**Solution**: 
- Use Power Pages (handles CORS)
- OR configure CORS in Dataverse environment
- OR use proxy in development

### Issue: 401 Unauthorized
**Cause**: Invalid or expired token
**Solution**:
- Verify Client ID & Tenant ID are correct
- Check Entra ID app permissions
- Ensure user has Dataverse access

### Issue: 404 Table Not Found
**Cause**: Table name mismatch
**Solution**:
- Verify table logical names in Dataverse
- Check FirstMaint solution is installed
- Use Web API Tester to explore schema

### Issue: Data Not Persisting
**Cause**: Still reading/writing to mock data
**Solution**:
- Verify dataService.js functions are updated
- Check network requests in browser DevTools
- Confirm token is being sent in headers

---

## Testing Dataverse Connection

### 1. Quick API Test (Power Apps Portals)

```bash
# In browser console (when logged into Power Pages)
fetch('/_api/fmaint_actifs?$select=fmaint_actifsid,fmaint_name', {
  credentials: 'same-origin',
  headers: {
    Accept: 'application/json',
    __RequestVerificationToken: document.querySelector('[name="__RequestVerificationToken"]').value
  }
})
.then(r => r.json())
.then(d => console.log(d))
```

### 2. MSAL Token Test

```javascript
import { useMsal } from '@azure/msal-react'

export function TestAuth() {
  const { instance, accounts } = useMsal()
  
  const handleGetToken = async () => {
    const token = await instance.acquireTokenSilent({
      scopes: ['https://yourenv.api.crm.dynamics.com/.default'],
      account: accounts[0],
    })
    console.log('Token:', token.accessToken)
  }
  
  return <button onClick={handleGetToken}>Get Token</button>
}
```

### 3. API Call Test

```javascript
const response = await fetch(
  'https://yourenv.api.crm.dynamics.com/api/data/v9.2/fmaint_actifs',
  {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    }
  }
)
console.log(await response.json())
```

---

## References

- [Dataverse Web API Documentation](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/overview)
- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [Power Pages Web API Guide](https://learn.microsoft.com/en-us/power-pages/configure/web-api-overview)
- [FirstMaint Solution Documentation](./docs/)

---

## Next Steps

1. **Determine deployment target**:
   - Local development → Use MSAL setup
   - Power Pages → Use existing portalApi.js

2. **Prepare Dataverse environment**:
   - Deploy FirstMaint solution
   - Verify tables and fields
   - Configure security roles

3. **Start Phase 1: Authentication**
   - Set up MSAL or confirm Power Pages access
   - Test login flow

4. **Schedule Phase 3: Data Service Updates**
   - Begin with high-priority functions
   - Test incrementally

Need help with any specific step? Let me know!
