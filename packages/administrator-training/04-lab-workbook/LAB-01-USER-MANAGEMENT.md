# LAB-01 — User Management & SCIM Provisioning

**Module**: 1
**Duration**: 30 minutes
**Mode**: Live (hosted sandbox) + scenario extension

---

## Scenario

You are the new IT Administrator at Nexara Training Co. The HR team has sent you a CSV file of 5 new starters who need IMS access. Additionally, the company has just signed up for Azure AD and wants automatic provisioning going forward.

---

## Part A: Bulk User Import (15 min)

### Step 1: Download the Sample CSV

In the admin console: **Admin Console → Users → Import → Download Sample CSV**

Or use the following data:

```csv
email,firstName,lastName,role,department,jobTitle
james.warren@nexara-training.io,James,Warren,HS_MANAGER,Health & Safety,HSE Manager
priya.patel@nexara-training.io,Priya,Patel,AUDITOR,Compliance,Internal Auditor
tom.chen@nexara-training.io,Tom,Chen,VIEWER,Operations,Operations Coordinator
sarah.jones@nexara-training.io,Sarah,Jones,FINANCE_MANAGER,Finance,Finance Director
alex.kim@nexara-training.io,Alex,Kim,IT_MANAGER,IT,IT Manager
```

### Step 2: Import the CSV

1. Navigate to **Admin Console → Users → Import → Upload CSV**
2. Upload the CSV above
3. Map the columns:
   - `email` → Email
   - `firstName` → First Name
   - `lastName` → Last Name
   - `role` → Role
   - `department` → Department
   - `jobTitle` → Job Title
4. Review the validation preview — all 5 rows should validate successfully
5. Click **Import**
6. Confirm: 5 invitation emails sent

### Step 3: Verify Import

Navigate to **Admin Console → Users → All Users**

Confirm all 5 new users appear with status `Pending`.

**Question**: What is the difference between `Pending` and `Inactive`?

*Your answer:* _______________________________________________

---

## Part B: SCIM Configuration (15 min)

### Step 1: Generate a SCIM Token

1. Navigate to **Admin Console → Integrations → SCIM**
2. Click **Generate Token**
3. Copy the token (it will not be shown again)
4. Note the SCIM base URL: `https://training-{cohortId}.nexara.io/scim/v2`

### Step 2: Connect the Mock IdP

In the lab environment, a mock Azure AD is available at `https://mock-idp.training.nexara.io`. Connect it:

1. Open `https://mock-idp.training.nexara.io/configure`
2. Set **SCIM Endpoint**: `https://training-{cohortId}.nexara.io/scim/v2`
3. Set **Bearer Token**: paste your SCIM token
4. Click **Test Connection**
5. Expected result: `Connection successful. 5 users found.`

### Step 3: Trigger Provisioning

1. In the mock IdP console, navigate to **Users → Assign Group: IMS-Viewers**
2. Add user: `ext.consultant@clientco.io`
3. Click **Sync Now**
4. Return to IMS: **Admin Console → Users → All Users**
5. Verify: `ext.consultant@clientco.io` now appears in Active state

### Step 4: Check SCIM Audit Log

Navigate to **Admin Console → Audit Log**
Filter: Category = INTEGRATION, Event Type = SCIM_USER_CREATE

Confirm the provisioning event is recorded.

---

## Live Extension (Fast Finishers)

Configure the group-to-role mapping for the mock IdP:

| IdP Group | IMS Role |
|-----------|---------|
| `IMS-HSManagers` | `HS_MANAGER` |
| `IMS-Auditors` | `AUDITOR` |
| `IMS-ReadOnly` | `VIEWER` |

Test by adding the consultant user to `IMS-Auditors` and verifying their role updates automatically in the IMS.

---

## Lab Debrief Questions

1. What HTTP status code would you expect if you tried to provision a user with an email that already exists?
2. How would you diagnose a SCIM provisioning failure where users are not appearing in the IMS?
3. Your SCIM token was compromised. What are the steps to remediate?

*Facilitator notes: See ANSWER-KEY.md for expected answers.*
