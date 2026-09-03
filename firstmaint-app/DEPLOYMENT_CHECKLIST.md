# FirstMaint - Dataverse Connection Checklist

## Pre-Deployment Checklist

### Phase 1: Dataverse Environment Preparation

- [ ] **Access to Dataverse**: Confirm you have admin access to your Dataverse environment
- [ ] **Environment Ready**: Dataverse environment is created and active
- [ ] **FirstMaint Solution**: Solution is deployed or ready to deploy
- [ ] **Power Pages Site**: Power Pages site is set up and accessible

### Phase 2: Table Creation

- [ ] **fmaint_emplacements** - Created with required columns
- [ ] **fmaint_categoriedactifs** - Created with required columns
- [ ] **fmaint_actifs** - Created with required columns and relationships
- [ ] **fmaint_ordredetravails** - Created with required columns and relationships
- [ ] **fmaint_tickets** - Created with required columns and relationships
- [ ] **fmaint_agences** - Created with required columns
- [ ] **fmaint_techniciens** - Created with required columns
- [ ] **fmaint_utilisateurs** - Created with required columns
- [ ] **fmaint_commentairetickets** - Created with required columns

### Phase 3: Option Sets Configuration

- [ ] **fmaint_statut** - Option set created with values (607570000, 607570001, 607570002, 607570003)
- [ ] **fmaint_type** - Option set created with values (607570000, 607570001, 607570002, 607570003)
- [ ] **fmaint_urgence** - Option set created with values (607570000, 607570001, 607570002)

### Phase 4: Relationships

- [ ] **Actifs → Emplacements**: fmaint_emplacementid lookup configured
- [ ] **Actifs → Categories**: fmaint_categoriedactifid lookup configured
- [ ] **OrdresTravail → Actifs**: fmaint_actifid lookup configured
- [ ] **OrdresTravail → Techniciens**: fmaint_technicienid lookup configured
- [ ] **Tickets → Agences**: fmaint_agenceid lookup configured
- [ ] **Tickets → OrdresTravail**: fmaint_ordredetravailid lookup configured
- [ ] **Commentaires → Tickets**: fmaint_ticketid lookup configured

### Phase 5: Security Configuration

- [ ] **Create Security Role**: FirstMaint User role created
- [ ] **Table Permissions**: Read permissions granted on all tables
- [ ] **Create Permissions**: Create permissions granted on Actifs, OrdresTravail, Tickets
- [ ] **Update Permissions**: Update permissions configured
- [ ] **Assign Role to Users**: FirstMaint User role assigned to app users

### Phase 6: Initial Data

- [ ] **Agencies**: At least 2 agencies created
- [ ] **Categories**: At least 2 asset categories created
- [ ] **Locations**: At least 1 location created
- [ ] **Technicians**: At least 2 technicians created
- [ ] **Users**: App user created with FirstMaint User role

### Phase 7: App Configuration

- [ ] **Deployment**: App deployed to Power Pages
- [ ] **Data Source**: portalApi.js configured for Web API
- [ ] **Environment URL**: Dataverse environment URL is correct
- [ ] **Database References**: power.config.json has correct environmentId

### Phase 8: Testing

- [ ] **Load Test**: App loads without errors
- [ ] **List Test**: Emplacements load from Dataverse
- [ ] **Create Test**: Can create new Asset
- [ ] **Search Test**: Can search and filter existing Assets
- [ ] **Relationship Test**: Asset displays correct Location and Category
- [ ] **Create Work Order**: Can create Order and link to Asset
- [ ] **Create Ticket**: Can create Ticket
- [ ] **Comments**: Can add comments to Ticket
- [ ] **Update Status**: Can update record status
- [ ] **Error Handling**: Error messages are clear if Dataverse is unavailable

### Phase 9: Performance

- [ ] **Load Time**: App loads in under 5 seconds
- [ ] **Search Time**: Search results return in under 2 seconds
- [ ] **Create Time**: New record created in under 3 seconds
- [ ] **No Mock Data**: No references to mockData.js in Network tab

### Phase 10: Documentation

- [ ] **User Guide**: Users know how to use the app
- [ ] **Admin Guide**: Admins know how to manage Dataverse tables
- [ ] **Troubleshooting**: Known issues and solutions documented
- [ ] **Backup**: Original dataService.js.backup preserved

---

## Deployment Steps

### 1. Environment Setup (30 minutes)

```powershell
# Verify Power Pages and Dataverse are accessible
$env_url = "https://yourenvironment.crm.dynamics.com"
# Test connectivity
```

### 2. Table Creation (1-2 hours)

Use **DATAVERSE_PRODUCTION_SETUP.md** to create all required tables:
- Follow column definitions exactly
- Set up option sets with correct values
- Create relationships between tables

### 3. Security Configuration (30 minutes)

```
Settings → Security Roles → Create FirstMaint User role
Grant permissions on all 9 tables
Assign role to users
```

### 4. Initial Data Load (30 minutes)

```
Create in Dataverse:
- 2+ Agencies
- 2+ Asset Categories
- 1+ Locations
- 2+ Technicians
- 1 Test User
```

### 5. App Deployment (15 minutes)

```bash
# Build for Power Pages
npm run build

# Deploy to Power Pages site
pac powerpages upload --path .
```

### 6. Testing (1 hour)

Run all tests in "Phase 8" above.

### 7. Go Live (Immediate)

- [ ] Notify users
- [ ] Monitor for errors
- [ ] Keep backup handy

---

## Troubleshooting During Setup

### Table Not Found Error

**Symptom**: "Table 'fmaint_actifs' not found" or 404 errors

**Solution**:
1. Verify table exists in Dataverse
2. Check logical name matches exactly
3. Verify user has access to table
4. Check security role permissions

### Authorization Failed

**Symptom**: "401 Unauthorized" or "Permission denied"

**Solution**:
1. Verify user is logged in
2. Assign FirstMaint User security role
3. Grant table read/create permissions
4. Clear browser cache and reload

### Data Not Saving

**Symptom**: Create works but record doesn't appear

**Solution**:
1. Check browser Network tab for failed POST
2. Verify Dataverse table has all required columns
3. Check for validation errors in Dataverse
4. Verify user has Create permission

### No Data Showing

**Symptom**: Tables are empty or show no records

**Solution**:
1. Verify tables have data
2. Check filter logic (statecode=0 for active only)
3. Verify user has Read permission
4. Check browser console for errors

### Slow Performance

**Symptom**: App loads slowly or searches are slow

**Solution**:
1. Add indexes to fmaint_nom and statecode columns
2. Reduce query results with $top and $skip
3. Cache data client-side
4. Check for large file attachments

---

## Rollback Plan

If you need to revert to mock data:

```bash
# Stop the app in Power Pages

# Restore backup
cd src/services
mv dataService.js dataService.dataverse.js
mv dataService.js.backup dataService.js

# Rebuild
npm run build

# Redeploy
pac powerapps upload --path .

# Restart app
```

All your Dataverse data remains intact and can be accessed again by switching back to the Dataverse version.

---

## Success Criteria

✅ **Success** when:

1. App loads without errors
2. Users can see Dataverse data
3. Users can create new records
4. Records persist after page refresh
5. No mock data in Network requests
6. Performance is acceptable

❌ **Not Ready** if:

1. Any table creation failed
2. Security roles not assigned
3. API errors in console
4. Records not persisting
5. Mock data still being used

---

## Support & Escalation

### Level 1: Check Documentation

- Review **DATAVERSE_PRODUCTION_SETUP.md**
- Review **DATAVERSE_API_REFERENCE.md**
- Check browser console errors
- Verify table names and column names

### Level 2: Test Connectivity

```javascript
// In browser console
fetch('/_api/fmaint_actifs?$select=fmaint_actifid', {
  headers: {
    'Accept': 'application/json',
    '__RequestVerificationToken': document.querySelector('[name="__RequestVerificationToken"]')?.value
  }
})
.then(r => r.json())
.then(d => console.log(d))
```

### Level 3: Dataverse Admin

- Check table permissions in Security Roles
- Verify table columns exist
- Check for any validation rules blocking creates
- Review audit trail for errors

### Level 4: Escalate to Microsoft

- Provide error message and HTTP status code
- Include Dataverse table and column names
- Include Power Pages site URL
- Include browser console output

---

## Performance Benchmarks

Target performance metrics:

| Operation | Target | Warning | Critical |
|---|---|---|---|
| Page Load | < 2s | 3-5s | > 5s |
| List Load (100 records) | < 1s | 2-3s | > 3s |
| Search/Filter | < 1s | 2-3s | > 3s |
| Create Record | < 2s | 3-5s | > 5s |
| Update Status | < 1s | 2-3s | > 3s |

---

## Monitoring

### Daily Checks

- [ ] App is accessible
- [ ] Users can create records
- [ ] No repeated error messages
- [ ] Performance is acceptable

### Weekly Checks

- [ ] Check error logs
- [ ] Verify data integrity
- [ ] Review user feedback
- [ ] Monitor Dataverse storage

### Monthly Reviews

- [ ] Performance analysis
- [ ] Data growth trends
- [ ] Security audit
- [ ] Backup verification

---

## Contact & Resources

- **Dataverse Admin**: [Microsoft Dataverse Docs](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/)
- **Power Pages**: [Power Pages Docs](https://learn.microsoft.com/en-us/power-pages/)
- **API Reference**: [Dataverse Web API](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/overview)

---

## Completion Certificate

When all steps are complete:

```
Date Completed: _______________
Approved By: ___________________
Environment: ___________________
Version: 2.0 (Dataverse Only)
Status: PRODUCTION READY ✅
```
