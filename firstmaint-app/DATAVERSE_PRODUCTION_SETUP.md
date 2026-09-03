# FirstMaint - Dataverse Production Setup Guide

## Status Update ✅

Your FirstMaint app has been successfully converted to **Dataverse-only mode** without mock data dependencies.

### What Changed

- ✅ **dataService.js** - Now uses Dataverse API exclusively via Power Pages portal
- ✅ **Removed** - All mockData imports and fallbacks
- ✅ **Backup** - Original file saved as `dataService.js.backup` 
- ✅ **Pure Dataverse** - All data is read from and written to Dataverse

---

## Required Dataverse Tables

Your Dataverse environment must have these tables created. If not present, the app will fail to load data.

### Core Tables (REQUIRED - Data persists)

| Table Logical Name | French Name | Purpose | Columns Needed | Status |
|---|---|---|---|---|
| `fmaint_emplacements` | Emplacements | Sites/Buildings/Rooms | `fmaint_emplacementid`, `fmaint_nom`, `fmaint_type`, `fmaint_emplacementparent` | 🔴 MUST CREATE |
| `fmaint_categoriedactifs` | Catégories d'Actif | Asset categories | `fmaint_categoriedactifid`, `fmaint_nomdelacategorie`, `fmaint_description` | 🔴 MUST CREATE |
| `fmaint_actifs` | Actifs | Physical assets | `fmaint_actifid`, `fmaint_nom`, `fmaint_statut`, `fmaint_criticite`, `fmaint_emplacementid`, `fmaint_categoriedactifid`, `fmaint_datedacquisition`, `fmaint_valeur`, `fmaint_codeinventaire` | 🔴 MUST CREATE |
| `fmaint_ordredetravails` | Ordres de Travail | Work orders | `fmaint_ordredetravailid`, `fmaint_nomordre`, `statecode`, `fmaint_actifid`, `fmaint_dateintervention`, `fmaint_urgent`, `fmaint_dureeheures` | 🔴 MUST CREATE |
| `fmaint_tickets` | Tickets | Service requests | `fmaint_ticketid`, `fmaint_titre`, `fmaint_description`, `statecode`, `fmaint_urgence`, `fmaint_agenceid` | 🔴 MUST CREATE |
| `fmaint_agences` | Agences | Branches | `fmaint_agenceid`, `fmaint_nomagence`, `fmaint_telephone` | 🔴 MUST CREATE |
| `fmaint_techniciens` | Techniciens | Technicians | `fmaint_technicienid`, `fmaint_nomtechnicien`, `fmaint_telephone` | 🔴 MUST CREATE |
| `fmaint_utilisateurs` | Utilisateurs | Users | `fmaint_utilisateurid`, `fmaint_nom`, `fmaint_email`, `fmaint_role`, `fmaint_statut` | 🔴 MUST CREATE |
| `fmaint_commentairetickets` | Commentaires Tickets | Ticket comments | `fmaint_commentaireticketid`, `fmaint_ticketid`, `fmaint_message`, `fmaint_auteur`, `fmaint_estreponsebanque` | 🔴 MUST CREATE |

### Optional Tables (For Extended Features)

These tables can be added later for advanced features (not needed for MVP):

| Table | Purpose | Timeline |
|---|---|---|
| `fmaint_planspreventifs` | Preventive maintenance plans | Phase 2 |
| `fmaint_echeancesplans` | Plan schedules | Phase 2 |
| `fmaint_fournisseurs` | Suppliers | Phase 3 |
| `fmaint_contrats` | Contracts | Phase 3 |
| `fmaint_slaregles` | SLA rules | Phase 3 |
| `fmaint_slamesures` | SLA measures | Phase 3 |
| `fmaint_penalties` | Penalties | Phase 3 |
| `fmaint_cles` | Key management | Phase 3 |
| `fmaint_journalaudit` | Audit trail | Phase 3 |

---

## Table Creation in Dataverse

### Method 1: Using Power Apps (Easiest)

1. **Go to** [https://make.powerapps.com](https://make.powerapps.com)
2. **Select** your environment
3. **Create** → **Table** → **Create your own**
4. **Name**: `Emplacement` (logical name will auto-generate to `fmaint_emplacement`)
5. **Add columns** as listed below
6. **Save**

### Method 2: Using Power Pages (If Available)

Tables might already exist if FirstMaint solution is deployed.

### Method 3: Solution Import

If you have a FirstMaint solution file (`.zip`), import it via:
- Power Apps → Solutions → Import → Upload the solution file

---

## Column Definitions for Each Table

### 1. Emplacements (fmaint_emplacements)

```
Column Name                | Type           | Required | Notes
========================|================|==========|====================
fmaint_emplacementid    | Primary Key    | Yes      | Auto-generated
fmaint_nom              | Text (100)     | Yes      | Location name
fmaint_type             | Option Set     | No       | Values: Agence, Siège, Étage, Salle
fmaint_emplacementparent | Lookup         | No       | References parent location
statecode               | Option Set     | No       | Active/Inactive
```

### 2. Catégories d'Actif (fmaint_categoriedactifs)

```
Column Name                | Type           | Required | Notes
========================|================|==========|====================
fmaint_categoriedactifid | Primary Key    | Yes      | Auto-generated
fmaint_nomdelacategorie | Text (100)     | Yes      | Category name
fmaint_description      | Text (500)     | No       | Description
```

### 3. Actifs (fmaint_actifs)

```
Column Name                | Type           | Required | Notes
========================|================|==========|====================
fmaint_actifid          | Primary Key    | Yes      | Auto-generated
fmaint_nom              | Text (100)     | Yes      | Asset name
fmaint_numerodeserie    | Text (50)      | No       | Serial number
fmaint_statut           | Option Set     | No       | Values: En service, En panne, En maintenance, Retiré
fmaint_criticite        | Option Set     | No       | Values: Critique, Haute, Moyenne, Basse
fmaint_emplacementid    | Lookup         | No       | References fmaint_emplacements
fmaint_categoriedactifid | Lookup        | No       | References fmaint_categoriedactifs
fmaint_datedacquisition | Date           | No       | Acquisition date
fmaint_datedefindegarantie | Date        | No       | Warranty end date
fmaint_valeur           | Currency       | No       | Asset value
fmaint_codeinventaire   | Text (20)      | No       | Auto-generated inventory code
statecode               | Option Set     | No       | Active/Inactive
```

### 4. Ordres de Travail (fmaint_ordredetravails)

```
Column Name                | Type           | Required | Notes
========================|================|==========|====================
fmaint_ordredetravailid | Primary Key    | Yes      | Auto-generated
fmaint_nomordre         | Text (100)     | Yes      | Order number/title
fmaint_actifid          | Lookup         | No       | References fmaint_actifs
fmaint_technicienid     | Lookup         | No       | References fmaint_techniciens
fmaint_dateintervention | Date           | No       | Scheduled date
fmaint_urgent           | Yes/No         | No       | Urgent flag
fmaint_dureeheures      | Number         | No       | Duration
statecode               | Option Set     | No       | Active/Inactive
```

### 5. Tickets (fmaint_tickets)

```
Column Name                | Type           | Required | Notes
========================|================|==========|====================
fmaint_ticketid         | Primary Key    | Yes      | Auto-generated
fmaint_titre            | Text (100)     | Yes      | Ticket title
fmaint_description      | Text (500)     | No       | Description
fmaint_urgence          | Option Set     | No       | Values: Faible, Moyenne, Haute
fmaint_agenceid         | Lookup         | No       | References fmaint_agences
fmaint_ordredetravailid | Lookup         | No       | References fmaint_ordredetravails
statecode               | Option Set     | No       | Active/Inactive
```

### 6. Agences (fmaint_agences)

```
Column Name                | Type           | Required | Notes
========================|================|==========|====================
fmaint_agenceid         | Primary Key    | Yes      | Auto-generated
fmaint_nomagence        | Text (100)     | Yes      | Branch name
fmaint_telephone        | Text (20)      | No       | Phone number
```

### 7. Techniciens (fmaint_techniciens)

```
Column Name                | Type           | Required | Notes
========================|================|==========|====================
fmaint_technicienid     | Primary Key    | Yes      | Auto-generated
fmaint_nomtechnicien    | Text (100)     | Yes      | Technician name
fmaint_telephone        | Text (20)      | No       | Phone number
```

### 8. Utilisateurs (fmaint_utilisateurs)

```
Column Name                | Type           | Required | Notes
========================|================|==========|====================
fmaint_utilisateurid    | Primary Key    | Yes      | Auto-generated
fmaint_nom              | Text (100)     | Yes      | User name
fmaint_email            | Email          | Yes      | Email address
fmaint_role             | Text (50)      | No       | Role (Opérateur, Manager, etc)
fmaint_statut           | Option Set     | No       | Active/Inactive
fmaint_siteid           | Lookup         | No       | References fmaint_emplacements
```

### 9. Commentaires Tickets (fmaint_commentairetickets)

```
Column Name                | Type           | Required | Notes
========================|================|==========|====================
fmaint_commentaireticketid | Primary Key  | Yes      | Auto-generated
fmaint_ticketid         | Lookup         | Yes      | References fmaint_tickets
fmaint_message          | Text (1000)    | Yes      | Comment message
fmaint_auteur           | Text (100)     | No       | Comment author
fmaint_estreponsebanque | Yes/No         | No       | Bank response flag
```

---

## Step-by-Step Setup Instructions

### Step 1: Create All Required Tables

Follow the table definitions above to create tables in your Dataverse environment using Power Apps interface.

### Step 2: Set Up Option Sets (Picklists)

When creating Option Set columns, use these values:

**fmaint_statut (Statut Actif)**
- 607570000: En service
- 607570001: En panne
- 607570002: En maintenance
- 607570003: Retiré

**fmaint_type (Type Emplacement)**
- 607570000: Agence
- 607570001: Siège
- 607570002: Étage
- 607570003: Salle

**fmaint_urgence (Urgence Ticket)**
- 607570000: Faible
- 607570001: Moyenne
- 607570002: Haute

### Step 3: Create Lookup Relationships

Set up the following relationships between tables:

```
fmaint_actifs.fmaint_emplacementid → fmaint_emplacements.fmaint_emplacementid
fmaint_actifs.fmaint_categoriedactifid → fmaint_categoriedactifs.fmaint_categoriedactifid
fmaint_ordredetravails.fmaint_actifid → fmaint_actifs.fmaint_actifid
fmaint_ordredetravails.fmaint_technicienid → fmaint_techniciens.fmaint_technicienid
fmaint_tickets.fmaint_agenceid → fmaint_agences.fmaint_agenceid
fmaint_tickets.fmaint_ordredetravailid → fmaint_ordredetravails.fmaint_ordredetravailid
fmaint_commentairetickets.fmaint_ticketid → fmaint_tickets.fmaint_ticketid
```

### Step 4: Configure Security Roles

1. **Go to** Settings → Security Roles
2. **Find or create** a role for FirstMaint users
3. **Grant permissions**:
   - Read: All tables
   - Create: Actifs, Ordres de Travail, Tickets, Commentaires
   - Update: Own records or all (depending on organization)
   - Delete: Only administrators

### Step 5: Add Initial Data

Create sample records in each table (Agencies, Technicians, Categories) so users can create Assets, Work Orders, and Tickets.

---

## Testing the Connection

### Test 1: Load Emplacements

1. **Open** the app in Power Pages
2. **Navigate** to any page that shows locations
3. **Expected**: See Dataverse data, not mock data
4. **If failing**: Check browser console for errors

### Test 2: Create an Asset

1. **Click** "New Asset" or similar button
2. **Fill in**: Name, Serial Number, Category, Location
3. **Click** "Save"
4. **Expected**: New record appears in Dataverse
5. **Verify** by checking Dataverse table directly

### Test 3: Check Browser Console

Press **F12** → **Console** tab to see any API errors:

```
GET /_api/fmaint_actifs → Should return 200 OK
POST /_api/fmaint_actifs → Should return 201 Created
```

### Test 4: Create Work Order

1. **Click** "New Work Order"
2. **Select** an asset
3. **Click** "Save"
4. **Expected**: Appears in Dataverse with asset relationship

---

## Error Troubleshooting

### Error: "Table not found"

**Cause**: Table doesn't exist in Dataverse

**Solution**:
1. Verify table logical name matches exactly (case-sensitive)
2. Confirm table is created in Dataverse
3. Check Web API query in browser Network tab

### Error: "401 Unauthorized"

**Cause**: Authentication token invalid or expired

**Solution**:
1. Check user is logged in to Power Pages
2. Verify portal has Dataverse access
3. Reload the page

### Error: "Permission denied"

**Cause**: User doesn't have Dataverse access

**Solution**:
1. Assign security role to user
2. Grant table permissions in role
3. Test with admin account first

### Error: "Column not found"

**Cause**: Column doesn't exist or has different name

**Solution**:
1. Check column logical names match API calls
2. Verify column was created in table
3. Check column hasn't been deleted

---

## Enabling Error Logging

To see detailed errors, add this to `portalApi.js` after the response:

```javascript
if (!response.ok) {
  const error = await response.json()
  console.error('API Error:', {
    status: response.status,
    error: error,
    endpoint: url,
  })
}
```

---

## Data Import (Bulk Load)

To import existing data into Dataverse:

1. **Prepare** CSV file with columns matching table structure
2. **Go to** Power Apps → Tables → Select table
3. **Click** "Import data"
4. **Upload** CSV file
5. **Map** columns to Dataverse fields
6. **Review** and confirm import

---

## Performance Tips

1. **Use $top and $skip** for large datasets (added to API queries automatically)
2. **Filter by statecode eq 0** to show only active records
3. **Cache data** client-side to reduce API calls
4. **Index** frequently queried columns (fmaint_nom, statecode)

---

## Next Steps

1. **Today**: Create required Dataverse tables
2. **Tomorrow**: Test data creation in app
3. **This Week**: Import initial data
4. **Following Week**: Add security roles and permissions

---

## Support

**Documentation Files**:
- `DATAVERSE_SETUP.md` - Setup guide
- `DATAVERSE_API_REFERENCE.md` - API documentation
- `dataService.js` - Source code (all Dataverse calls)

**Dataverse Docs**:
- [Web API Reference](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/reference/)
- [Table Definitions](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/entity-overview)
- [Security Roles](https://learn.microsoft.com/en-us/power-platform/admin/security-roles-privileges)

---

## Rollback (If Needed)

The original mock-data version is available as `dataService.js.backup`:

```bash
# Restore original
mv dataService.js dataService.dataverse.js
mv dataService.js.backup dataService.js

# Reload app
```

---

## Version Info

- **Updated**: 01/09/2026
- **Version**: 2.0 (Dataverse-only, production-ready)
- **Previous**: 1.0 (Mock data)
- **Status**: Ready for deployment
