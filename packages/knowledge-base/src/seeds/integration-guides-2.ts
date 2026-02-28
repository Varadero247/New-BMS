import type { KBArticle } from '../types';

export const integrationGuides2Articles: KBArticle[] = [
  {
    id: 'KB-IG2-001',
    title: 'Integrating IMS with SAP ERP',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'sap', 'erp'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Integrating IMS with SAP ERP

## Overview

This guide covers connecting IMS to SAP S/4HANA or SAP ECC to synchronise operational data between the two systems. The integration enables:

- **Purchase order sync** (SAP → IMS Supplier Portal): Approved POs from SAP appear automatically in the Supplier Portal so suppliers can acknowledge, confirm delivery dates, and submit invoices against them.
- **Supplier master data sync** (SAP → IMS Supplier module): Vendor master records (name, address, category, contact) are the system of record in SAP and sync to IMS.
- **Financial data for ESG reporting** (SAP → IMS ESG): Revenue, energy spend, and other financial aggregates feed IMS ESG module for GRI/SASB financial disclosures.
- **Asset register sync** (SAP PM → IMS CMMS): Equipment master data from SAP Plant Maintenance is reflected in IMS CMMS for unified maintenance management.

## Prerequisites

- SAP S/4HANA 2020+ or SAP ECC 6.0 EhP7+
- SAP API Hub credentials or direct RFC connectivity
- IMS Enterprise subscription with Integration Hub enabled
- IMS Integration Hub API key (generated in Admin → Integrations → API Keys)
- SAP Basis team access to configure RFC destinations and outbound queues

## Integration Architecture

The integration uses a REST-based middleware approach:

**SAP → IMS (Push):** SAP outbound IDocs or SAP Event Mesh events are consumed by the IMS Integration Hub webhook endpoint. The Integration Hub transforms and loads the data into the target IMS module.

**IMS → SAP (Pull/Callback):** Where bidirectional sync is needed (e.g. supplier acknowledgement of a PO), IMS posts a callback to a SAP REST API endpoint using a configured RFC destination.

All integration events are logged in IMS Admin → Integrations → Event Log for troubleshooting.

## Configuration Steps

1. In IMS, navigate to **Admin → Integrations → SAP ERP**.
2. Click **Configure** and enter your SAP system details: system ID, host URL, client number, and integration user credentials.
3. Generate the IMS webhook URL and API key for the SAP outbound configuration.
4. In SAP, work with your Basis team to:
   a. Create an RFC HTTP destination pointing to the IMS webhook URL.
   b. Configure the relevant IDocs (ORDERS05 for POs, CREMAS05 for vendor master, EQUI01 for equipment) to use the RFC destination.
   c. Enable the outbound queue for each IDoc type.
5. In IMS, map the SAP fields to IMS fields using the field mapping editor.
6. Run a test sync by triggering a test IDoc from SAP and verifying receipt in IMS Integration Event Log.
7. Enable the integration and set sync frequency (real-time or scheduled batch).

## Data Mapping

| IMS Field | SAP Field | Notes |
|---|---|---|
| Supplier.name | LFA1-NAME1 | Vendor name |
| Supplier.externalRef | LFA1-LIFNR | SAP vendor number (used as cross-reference key) |
| Supplier.country | LFA1-LAND1 | ISO country code |
| PurchaseOrder.poNumber | EKKO-EBELN | Purchase order number |
| PurchaseOrder.value | EKKO-NETWR | Net order value |
| PurchaseOrder.currency | EKKO-WAERS | Currency code |
| Asset.assetId | EQUI-EQUNR | SAP equipment number |
| Asset.description | EQUI-EQKTX | Equipment description |
| Asset.location | EQUI-TPLNR | Functional location |

## Troubleshooting

- **IDoc not received in IMS:** Check the SAP outbound queue (Transaction SMQ1) for queued or failed IDocs. Verify the RFC destination test connection in SM59.
- **Field mapping errors:** Incorrect field type mappings cause import failures. Review the IMS Event Log for the specific field causing the error and adjust the mapping.
- **Duplicate records:** If both SAP and IMS allow creation of the same entity type, duplicate detection is based on the external reference field. Ensure the SAP vendor number (LIFNR) is consistently used as the cross-reference key.
- **Authentication failures:** IMS API keys expire after 12 months. Regenerate the key in Admin → Integrations → API Keys and update the SAP RFC destination.

## Support

For SAP integration support, contact IMS Support with the following information: SAP system release, IDoc type, and the relevant entries from IMS Admin → Integrations → Event Log.
`,
  },
  {
    id: 'KB-IG2-002',
    title: 'Integrating IMS with Salesforce CRM',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'salesforce', 'crm'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Integrating IMS with Salesforce CRM

## Overview

This guide covers the integration between Salesforce CRM and IMS, enabling:

- **Account and contact sync** (Salesforce ↔ IMS CRM): Customer account and contact records are synchronised bidirectionally, so both systems reflect the same customer data.
- **Complaint sync** (Salesforce ↔ IMS Complaints): Customer complaints logged as Cases in Salesforce are mirrored to IMS Complaint Management for formal investigation and CAPA. Status updates sync back to Salesforce so customer-facing teams have visibility.
- **Opportunity data for renewal campaigns** (Salesforce → IMS Marketing): Renewal opportunity data from Salesforce triggers targeted renewal and winback campaigns in IMS Marketing module.

## Prerequisites

- Salesforce Professional, Enterprise, or Unlimited edition
- Salesforce Connected App created with OAuth 2.0
- IMS Enterprise subscription with Integration Hub enabled
- IMS Integration Hub API key
- Salesforce System Administrator access for initial setup

## Integration Architecture

The integration uses Salesforce Platform Events (for real-time sync) and scheduled Apex batch jobs (for historical sync and reconciliation).

**Salesforce → IMS:** Salesforce Platform Events are published when accounts, contacts, or cases are created/updated. A Salesforce Flow or Apex trigger publishes the event. IMS Integration Hub subscribes to the Platform Event channel via the Salesforce Streaming API and processes incoming events.

**IMS → Salesforce:** IMS uses the Salesforce REST API to create/update records in Salesforce. OAuth 2.0 client credentials flow is used for server-to-server authentication.

## Configuration Steps

1. In Salesforce, create a **Connected App**:
   a. Navigate to Setup → App Manager → New Connected App.
   b. Enable OAuth settings, add 'api' and 'refresh_token' scopes.
   c. Note the Consumer Key and Consumer Secret.
2. In IMS, navigate to **Admin → Integrations → Salesforce**.
3. Enter the Connected App Consumer Key, Consumer Secret, and your Salesforce instance URL.
4. Click **Authorise** — you will be redirected to Salesforce to grant access. Complete the OAuth flow.
5. Select the objects to sync: Accounts, Contacts, Cases (Complaints), Opportunities.
6. Configure the field mapping for each object.
7. Configure the sync direction (bidirectional, Salesforce-to-IMS only, or IMS-to-Salesforce only) per object.
8. Enable Platform Events in Salesforce for real-time updates.
9. Run an initial historical sync for each object type.
10. Verify sync by creating a test account in Salesforce and confirming it appears in IMS CRM.

## Data Mapping

| IMS Field | Salesforce Field | Notes |
|---|---|---|
| Customer.name | Account.Name | Account name |
| Customer.externalRef | Account.Id | Salesforce Account ID (cross-reference key) |
| Customer.industry | Account.Industry | Industry picklist |
| Customer.annualRevenue | Account.AnnualRevenue | Revenue value |
| Contact.firstName | Contact.FirstName | First name |
| Contact.email | Contact.Email | Primary email |
| Complaint.title | Case.Subject | Case subject becomes complaint title |
| Complaint.description | Case.Description | Full complaint description |
| Complaint.status | Case.Status | Bidirectional status sync |
| Complaint.externalRef | Case.CaseNumber | Salesforce case number |

## Troubleshooting

- **OAuth token expired:** Salesforce refresh tokens can expire if unused for 90 days. Re-authorise the connection in Admin → Integrations → Salesforce → Re-Authorise.
- **Sync conflict on bidirectional fields:** When the same field is updated in both systems simultaneously, IMS uses a "last-write-wins" approach based on timestamp. For critical fields, configure the master system in the field mapping editor.
- **Cases not syncing:** Verify that the Salesforce Case record type is set to match the configured type filter. By default, only Cases with the 'Customer Complaint' record type are synced.

## Support

Contact IMS Support with your Salesforce instance URL and the IMS Event Log entries for failed sync events.
`,
  },
  {
    id: 'KB-IG2-003',
    title: 'Integrating IMS with Azure Active Directory',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'azure-ad', 'sso', 'microsoft'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Integrating IMS with Azure Active Directory

## Overview

This guide covers two related integrations with Microsoft Azure Active Directory (Azure AD / Entra ID):

1. **SAML 2.0 Single Sign-On:** Users log into IMS using their Microsoft credentials. No separate IMS password is required.
2. **SCIM 2.0 User Provisioning:** User accounts are automatically created, updated, and deactivated in IMS based on changes in Azure AD, without manual admin intervention.

These integrations together provide a fully automated user lifecycle managed from Azure AD.

## Prerequisites

- Azure AD / Microsoft Entra ID tenant (any plan)
- Global Administrator or Application Administrator role in Azure AD
- IMS System Administrator access
- IMS Professional or Enterprise subscription

## Integration Architecture

**SSO flow:** User navigates to IMS login page → clicks "Sign in with Microsoft" → redirected to Azure AD → authenticates → Azure AD issues SAML assertion → IMS validates assertion → user is logged in. Session is maintained in IMS with configurable timeout.

**SCIM provisioning flow:** Azure AD Provisioning Service polls IMS SCIM endpoint on a schedule (every 20–40 minutes). New/updated/deactivated users and group changes in Azure AD are pushed to IMS automatically.

## Configuration Steps

**Part 1 — SAML SSO:**

1. In Azure Portal, navigate to **Azure Active Directory → Enterprise Applications → New Application → Create your own application**.
2. Name the application "IMS" and select "Integrate any other application you don't find in the gallery".
3. In the application, navigate to **Single sign-on → SAML**.
4. Configure:
   - **Identifier (Entity ID):** Your IMS SAML Entity ID (found in IMS Admin → SSO → SAML Configuration)
   - **Reply URL (ACS URL):** Your IMS ACS URL (found in same location)
5. Download the **Federation Metadata XML** from Azure.
6. In IMS Admin → SSO → SAML, upload the Federation Metadata XML.
7. Test the SSO connection using the "Test" button in Azure.

**Part 2 — SCIM Provisioning:**

1. In the Azure application, navigate to **Provisioning → Set up provisioning**.
2. Select **Automatic** provisioning mode.
3. In IMS, navigate to **Admin → Directory Sync → SCIM** and copy the SCIM Endpoint URL and Bearer Token.
4. In Azure, paste the Tenant URL and Secret Token.
5. Click **Test Connection** to verify.
6. Configure attribute mappings (IMS provides defaults).
7. Under **Settings**, configure scope (sync all users or only assigned users/groups).
8. Start provisioning.

## Data Mapping

| IMS Attribute | Azure AD Attribute | Notes |
|---|---|---|
| user.email | user.mail | Primary identifier |
| user.firstName | user.givenName | First name |
| user.lastName | user.surname | Last name |
| user.displayName | user.displayName | Full display name |
| user.department | user.department | Department |
| user.jobTitle | user.jobTitle | Job title |
| user.active | user.accountEnabled | Deprovisioning trigger |
| role assignment | groupMembership | Groups mapped to IMS roles |

## Troubleshooting

- **SAML assertion validation failure:** Ensure the clock on the IMS server and Azure are synchronised. SAML assertions have a validity window and clock skew causes failures.
- **Users not provisioning:** Check the Azure provisioning logs (Azure AD → Enterprise App → Provisioning → Provisioning Logs) for error details. Common cause: attribute mapping errors or SCIM endpoint returning non-200 responses.
- **Group-to-role mapping not applying:** In IMS Admin → SSO → Group Mapping, ensure Azure AD group Object IDs are entered correctly (not display names).

## Support

For SSO configuration issues, provide IMS Support with the SAML error message and the IMS SSO debug log (Admin → SSO → Debug Log).
`,
  },
  {
    id: 'KB-IG2-004',
    title: 'Integrating IMS with Okta',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'okta', 'sso', 'identity'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Integrating IMS with Okta

## Overview

This guide covers integrating IMS with Okta as the identity provider for:

- **SAML 2.0 Single Sign-On:** Users authenticate with Okta credentials to access IMS.
- **SCIM 2.0 Provisioning:** User lifecycle (create, update, deactivate) managed from Okta.
- **Okta Group Push:** Okta group membership changes are reflected in IMS role assignments.
- **MFA policy inheritance:** Okta MFA requirements are enforced before the SAML assertion is issued to IMS.

## Prerequisites

- Okta tenant (Workforce Identity Cloud)
- Okta Super Administrator access
- IMS System Administrator access
- IMS Professional or Enterprise subscription

## Integration Architecture

IMS is configured as an Okta application (SAML 2.0 app). When a user accesses IMS, they are redirected to Okta for authentication. Okta evaluates sign-on policies (including MFA requirements, device trust, network zone restrictions) before issuing a SAML assertion to IMS. SCIM provisioning runs on a separate channel, using the Okta Provisioning Agent to push user and group changes to IMS.

## Configuration Steps

1. In Okta Admin Console, navigate to **Applications → Create App Integration**.
2. Select **SAML 2.0** as the sign-on method.
3. Configure the SAML settings:
   - **Single sign-on URL (ACS URL):** Copy from IMS Admin → SSO → SAML Configuration
   - **Audience URI (Entity ID):** Copy from IMS Admin → SSO → SAML Configuration
   - **Name ID format:** EmailAddress
   - **Application username:** Okta username (email format)
4. Add attribute statements for: firstName, lastName, email, department, groups.
5. Download the Identity Provider metadata XML from Okta.
6. In IMS Admin → SSO → SAML, upload the Okta metadata XML.
7. Assign the application to users/groups in Okta.
8. Test SSO by clicking the IMS tile in the Okta dashboard.

**SCIM Provisioning:**

1. In the IMS Okta app, navigate to **Provisioning → Configure API Integration**.
2. In IMS, copy the SCIM endpoint URL and bearer token from Admin → Directory Sync → SCIM.
3. Enter these in Okta and test the API connection.
4. Enable provisioning features: Create Users, Update User Attributes, Deactivate Users, Push Groups.
5. Map Okta attributes to IMS attributes.
6. Test by assigning a test user to the app and verifying creation in IMS.

## Data Mapping

| IMS Attribute | Okta Attribute | Notes |
|---|---|---|
| user.email | user.email | Primary identifier |
| user.firstName | user.firstName | |
| user.lastName | user.lastName | |
| user.department | user.department | |
| user.active | user.status | Deactivated/Suspended → inactive |
| role | groups | Okta groups pushed to IMS role assignments |

## Troubleshooting

- **"User not assigned" error on login:** The user must be assigned to the IMS app in Okta. Check the user's app assignments in Okta Admin Console.
- **MFA not being enforced:** Verify that the Okta sign-on policy for the IMS app requires MFA. Check Okta Admin → Applications → IMS → Sign On → Sign On Policy.
- **Groups not pushing:** Okta Group Push must be explicitly configured. Navigate to Application → Push Groups and add the groups to push.
- **Provisioning failures:** Review Okta System Log (Admin → Reports → System Log) for SCIM provisioning error details.

## Support

Contact IMS Support with the Okta System Log entries for the affected user and the IMS SSO debug log.
`,
  },
  {
    id: 'KB-IG2-005',
    title: 'Integrating IMS with Microsoft Teams',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'microsoft-teams', 'notifications', 'collaboration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Integrating IMS with Microsoft Teams

## Overview

IMS integrates with Microsoft Teams to bring IMS notifications and actions into your team's collaboration environment. This guide covers:

- **Channel notifications:** IMS events (incident alerts, overdue action reminders, management review invitations, CAPA escalations) posted to Teams channels.
- **Teams tab:** Embed an IMS dashboard or module view as a tab within a Teams channel.
- **Adaptive Card approvals:** Approve or reject IMS records directly from a Teams message without opening IMS.
- **Bot queries:** Query IMS data conversationally via the IMS bot in Teams.

## Prerequisites

- Microsoft Teams with a Microsoft 365 Business or Enterprise plan
- Teams channel owner or admin rights to add connectors
- IMS System Administrator access
- IMS Professional or Enterprise subscription

## Integration Architecture

**Notifications and Adaptive Cards:** IMS posts to Teams via an Incoming Webhook (for basic notifications) or via the Microsoft Bot Framework (for interactive Adaptive Cards requiring user responses). The Adaptive Card approval feature requires the IMS Teams App to be installed in your Teams tenant.

**Bot queries:** The IMS Teams Bot is published to the Microsoft Teams App Store (or can be sideloaded for enterprise). It uses the Teams messaging extension protocol to receive and respond to user queries.

## Configuration Steps

**Basic channel notifications (Incoming Webhook):**

1. In Microsoft Teams, navigate to the target channel.
2. Click the three dots (More options) → Connectors → Incoming Webhook.
3. Name the webhook (e.g. "IMS Alerts") and click Create.
4. Copy the webhook URL.
5. In IMS, navigate to **Admin → Integrations → Microsoft Teams**.
6. Click **Add Channel**, paste the webhook URL, and name the channel.
7. Select which event types route to this channel (e.g. all High/Critical incidents → #safety-alerts).
8. Optionally add multiple channels with different event filters.
9. Save and test by triggering a test notification.

**Adaptive Card approvals (IMS Teams App):**

1. Download the IMS Teams App manifest from IMS Admin → Integrations → Microsoft Teams → Download App.
2. In Teams Admin Center, upload the app as a custom app (or request your Microsoft 365 admin to publish it to your tenant app store).
3. In IMS, enable Adaptive Card approvals under Admin → Integrations → Microsoft Teams → Advanced.
4. Specify which record types and approval steps send Teams approval cards.

## Data Mapping

| IMS Event | Teams Message Content | Channel |
|---|---|---|
| New High/Critical Incident | Incident details, severity, location, assignee | #safety-incidents |
| Overdue CAPA Action | CAPA title, owner, due date, days overdue | #quality-actions |
| Management Review Due | Review date, agenda link, attendee list | #management-review |
| Approval Required | Record summary, Approve/Reject buttons (Adaptive Card) | Approver's DM |
| New Audit Finding | Finding title, severity, auditor, auditee | #audit-findings |

## Troubleshooting

- **Notifications not appearing in channel:** Verify the Incoming Webhook URL has not expired (Teams webhooks do not expire, but the connector may need to be re-added if the channel was recreated). Test the webhook URL directly from IMS Admin → Integrations → Test.
- **Adaptive Card buttons not working:** Ensure the IMS Teams App is installed and the bot service URL is correctly configured in IMS. Check Teams Admin Center → Apps for app status.
- **Bot not responding:** The IMS bot requires the app to be installed in the conversation. Type '@IMS help' to trigger the bot. If no response, verify the app is installed for the user.

## Support

Contact IMS Support with the Teams channel name, event type that failed to notify, and timestamp of the expected notification.
`,
  },
  {
    id: 'KB-IG2-006',
    title: 'Integrating IMS with Slack',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'slack', 'notifications'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Integrating IMS with Slack

## Overview

IMS integrates with Slack to deliver notifications and interactive actions within your team's Slack workspace. This guide covers:

- **Webhook notifications:** IMS events posted to designated Slack channels.
- **Slash commands:** Query IMS data from any Slack channel using '/ims' commands.
- **Interactive messages:** Approve or respond to IMS action requests directly from Slack messages.
- **Channel routing:** Route different IMS module events to different Slack channels (e.g. incidents to #safety, CAPAs to #quality).

## Prerequisites

- Slack workspace (any paid plan or free for basic webhooks)
- Slack Workspace Admin access for app installation
- IMS System Administrator access
- IMS Professional or Enterprise subscription

## Integration Architecture

**Notifications:** IMS posts messages to Slack via Incoming Webhooks. Each webhook is associated with a specific Slack channel. IMS filters events by module and severity and routes to the appropriate webhook.

**Slash commands and interactive messages:** The IMS Slack App (installed from the Slack App Directory or sideloaded) registers '/ims' as a slash command and handles Block Kit interactive message callbacks.

## Configuration Steps

**Webhook notifications:**

1. In Slack, navigate to **Apps → Manage → Custom Integrations → Incoming WebHooks**.
2. Add a new webhook configuration, select the target channel, and copy the webhook URL.
3. Repeat for each channel that will receive IMS notifications.
4. In IMS, navigate to **Admin → Integrations → Slack**.
5. Add each webhook URL and assign it a channel name and event filter.
6. Configure routing rules — for example: Severity HIGH/CRITICAL incidents → #safety, Overdue CAPA → #quality, Supplier risk alerts → #procurement.
7. Save and send a test message to verify each channel.

**IMS Slack App (slash commands and interactive messages):**

1. Install the IMS Slack App from the Slack App Directory (search "IMS Management System") or request your Slack admin to install it.
2. During installation, authorise the app with the required scopes (commands, chat:write, users:read).
3. In IMS Admin → Integrations → Slack → App Configuration, enter the Slack App Signing Secret to validate incoming slash command requests.
4. Test by typing '/ims incidents today' in any Slack channel where the app is present.

**Available slash commands:**

- '/ims incidents today' — count of open incidents created today
- '/ims overdue actions' — list of overdue actions assigned to you
- '/ims kpi [metric]' — current value of a named KPI
- '/ims help' — list of available commands

## Data Mapping

| IMS Event | Slack Message | Routed To |
|---|---|---|
| New Critical Incident | Title, location, severity, assignee, deep link | #safety |
| CAPA overdue | Title, owner, days overdue, due date | #quality |
| Supplier risk level changed to High | Supplier name, previous/new rating, reviewer | #procurement |
| Audit finding — Major nonconformance | Finding description, auditee, due date | #audit |
| Approval pending | Record summary, Approve/Reject buttons | Assignee DM |

## Troubleshooting

- **Webhook returning 404:** The Slack webhook URL may have been revoked. Regenerate the webhook in Slack and update in IMS Admin → Integrations → Slack.
- **Slash command returning "Dispatch failed":** Verify the Slack App Signing Secret is correctly entered in IMS and that the IMS slash command endpoint URL is accessible from Slack's servers (check firewall rules).
- **Messages not routing to correct channel:** Review the routing rules in Admin → Integrations → Slack → Routing Rules. Ensure event type and severity filters match the expected events.

## Support

Contact IMS Support with the Slack workspace name, channel name, event type, and the IMS Integration Event Log entry for the failed notification.
`,
  },
  {
    id: 'KB-IG2-007',
    title: 'Integrating IMS with Jira',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'jira', 'project-management'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Integrating IMS with Jira

## Overview

This guide covers the bidirectional integration between IMS and Jira (Jira Cloud or Jira Data Center). The integration enables:

- **CAPA and corrective action sync:** IMS CAPA records are mirrored as Jira issues, enabling engineering and IT teams who work in Jira to see and action IMS-originated tasks without leaving their tool.
- **Status sync:** Jira issue status changes (Open → In Progress → Done) sync back to update the IMS action status.
- **Comment sync:** Comments added in Jira appear in the IMS record activity log, and vice versa.
- **Incident-to-bug linking:** IMS incidents can be linked to Jira bug tickets, creating a cross-system traceability record.
- **Automatic Jira ticket creation:** When an IMS nonconformance or CAPA is raised, a Jira issue is automatically created in the configured project.

## Prerequisites

- Jira Cloud or Jira Data Center (version 9.0+)
- Jira Project Administrator access
- Jira API token (for Jira Cloud) or Personal Access Token (Jira Data Center)
- IMS System Administrator access
- IMS Professional or Enterprise subscription

## Integration Architecture

The integration is API-based and bidirectional:

**IMS → Jira:** When an IMS record is created or updated, IMS calls the Jira REST API to create or update the corresponding Jira issue.

**Jira → IMS:** A Jira Automation rule (configured during setup) sends a webhook to IMS whenever an IMS-linked Jira issue is updated. IMS processes the webhook and updates the corresponding IMS record.

## Configuration Steps

1. In Jira, create a dedicated project (or identify an existing project) for IMS-originated issues.
2. Create a Jira API token (Jira Cloud: account.atlassian.com → Security → API tokens) or Personal Access Token (Jira Data Center: User profile → Personal Access Tokens).
3. In IMS, navigate to **Admin → Integrations → Jira**.
4. Enter: Jira instance URL, email address (Jira Cloud) or username, API token/PAT, and target project key.
5. Map IMS record types to Jira issue types (e.g. CAPA → Story, Corrective Action → Task, Incident → Bug).
6. Configure status mapping (see Data Mapping table below).
7. Configure field mapping for custom Jira fields if applicable.
8. In Jira, create an **Automation Rule** triggered on "Issue updated" filtered to the IMS project, with action "Send web request" pointing to the IMS Jira webhook URL (provided in IMS Admin → Integrations → Jira → Webhook URL).
9. Test by creating a test CAPA in IMS and verifying the Jira issue is created.

## Data Mapping

| IMS Status | Jira Status | Notes |
|---|---|---|
| Open | To Do | Initial state |
| In Progress | In Progress | Action assigned and started |
| Under Review | In Review | Pending approval |
| Closed | Done | Completed and verified |

| IMS Field | Jira Field | Notes |
|---|---|---|
| CAPA.title | Issue.summary | Issue title |
| CAPA.description | Issue.description | Full description |
| CAPA.assignee | Issue.assignee | Matched by email address |
| CAPA.dueDate | Issue.duedate | Due date |
| CAPA.priority | Issue.priority | High=High, Critical=Highest |
| CAPA.referenceNumber | Issue.labels | IMS reference added as label |

## Troubleshooting

- **Jira issue not created:** Check that the IMS integration user has permission to create issues in the target Jira project. Verify the project key is correct in IMS Admin → Integrations → Jira.
- **Status changes not syncing back to IMS:** Verify the Jira Automation Rule is active and firing. Check the Jira Automation audit log for rule execution errors. Confirm the IMS webhook URL is reachable from Jira.
- **Assignee not matched:** IMS matches Jira assignees by email. If the IMS user's email differs from their Jira email (e.g. due to Jira using personal email), the assignee field will be blank in Jira. Use the IMS field mapping editor to set a default assignee fallback.

## Support

Contact IMS Support with the IMS record reference, expected Jira project, and IMS Integration Event Log entries.
`,
  },
  {
    id: 'KB-IG2-008',
    title: 'Integrating IMS with Power BI',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'power-bi', 'reporting', 'analytics'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Integrating IMS with Power BI

## Overview

This guide covers connecting Microsoft Power BI to IMS data to build custom dashboards and reports beyond the standard IMS Analytics module. Power BI can query IMS data via the IMS OData feed or REST API, enabling rich visualisations, cross-system reporting (combining IMS data with ERP or HR data), and executive dashboards published to the Power BI Service.

## Prerequisites

- Power BI Desktop (latest version) or Power BI Service
- IMS API key with read access to required modules (generated in Admin → Integrations → API Keys)
- Network connectivity from Power BI (cloud or on-premises gateway) to IMS

## Integration Architecture

Power BI connects to IMS using the **Web connector** in Power BI Desktop, pointing to the IMS OData or REST API endpoints. Authentication uses the IMS API key passed as a header parameter. Data is loaded into Power BI as a dataset, with refresh scheduled in Power BI Service (daily or more frequent for live data).

## Configuration Steps

1. In IMS, navigate to **Admin → Integrations → API Keys → New API Key**.
2. Name the key "Power BI" and select "Read-only" with the required module scopes.
3. Copy the generated API key.
4. Open **Power BI Desktop**.
5. Click **Get Data → Web**.
6. In the URL field, enter the IMS OData endpoint: 'https://your-org.ims.app/api/v1/odata'.
7. Click **Advanced** and add an HTTP header: Name = 'X-API-Key', Value = your API key.
8. Click OK. Power BI loads the available IMS entities as tables.
9. Select the tables (modules) you want to include and click **Load** or **Transform Data**.
10. Build your Power BI report using the loaded IMS tables.
11. Publish the report to Power BI Service.
12. In Power BI Service, configure a scheduled refresh (requires an on-premises data gateway if Power BI cannot reach IMS directly).

## Data Mapping

| IMS Module | OData Table | Key Fields Available |
|---|---|---|
| Incidents | Incidents | id, title, severity, status, dateOccurred, assignee, site |
| CAPA | CAPAs | id, title, status, dueDate, owner, priority |
| Risk | Risks | id, title, riskRating, likelihood, consequence, owner |
| Training | TrainingRecords | id, employeeId, courseId, completedAt, expiryDate |
| Assets | Assets | id, name, category, location, status, nextMaintenanceDate |
| Suppliers | Suppliers | id, name, riskRating, country, category |
| ESG | ESGMetrics | id, metricCode, period, value, unit |
| Audits | AuditFindings | id, title, severity, auditType, status, auditee |

## Troubleshooting

- **Authentication error (401):** Verify the API key is entered correctly as the 'X-API-Key' header value. API keys are case-sensitive. Regenerate if needed.
- **Data not refreshing in Power BI Service:** If IMS is not publicly accessible, an on-premises data gateway is required. Install and configure the Power BI On-premises Data Gateway on a machine with access to IMS.
- **OData query performance slow:** Filter data at the OData query level using OData query parameters ('$filter', '$select', '$top') rather than loading all records and filtering in Power BI. IMS OData supports standard OData v4 query options.
- **Row-level security not applied:** IMS API key access returns all records within the granted module scope. To apply row-level security in Power BI matching IMS user permissions, use the Power BI RLS feature based on the user's email address and a site/department filter.

## Support

Contact IMS Support with the API endpoint URL, request headers (redact the API key value), and the error message received.
`,
  },
  {
    id: 'KB-IG2-009',
    title: 'Integrating IMS with IoT Sensors',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'iot', 'sensors', 'monitoring'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Integrating IMS with IoT Sensors

## Overview

IMS supports integration with IoT sensors, environmental monitoring devices, energy meters, and equipment condition monitors via the IMS IoT Gateway. This enables:

- **Automated environmental monitoring:** Air quality, temperature, humidity, noise, and water quality readings logged directly into the IMS Environmental Monitoring module without manual data entry.
- **Energy metering:** Sub-meter energy readings automatically populate the IMS Energy Monitoring module for real-time energy consumption tracking.
- **Equipment condition monitoring:** Vibration, temperature, and pressure sensors on assets feed the IMS CMMS for condition-based maintenance triggering.
- **Calibration record linking:** Sensors registered as assets in IMS Asset Management are linked to their calibration records in the Equipment Calibration module.

## Prerequisites

- IoT devices supporting MQTT (preferred) or HTTP/REST
- Network connectivity from IoT devices (or IoT gateway hardware) to IMS
- IMS Enterprise subscription with IoT Gateway module enabled
- IMS API key with write access to Environmental Monitoring and/or Energy Monitoring

## Integration Architecture

**MQTT integration (recommended for high-frequency sensors):** Sensors publish readings to an MQTT broker topic. The IMS IoT Gateway subscribes to the broker and ingests readings into the appropriate IMS module. IMS supports connection to your existing MQTT broker (Mosquitto, HiveMQ, AWS IoT Core, Azure IoT Hub) or provides a managed MQTT broker endpoint.

**REST API integration (for lower-frequency or batch readings):** Sensors or sensor hubs POST readings directly to the IMS REST API endpoint. Suitable for sensors that report at intervals of 1 minute or more.

## Configuration Steps

**MQTT configuration:**

1. In IMS, navigate to **Admin → IoT Gateway → MQTT Configuration**.
2. Enter your MQTT broker details: hostname, port, username, password, and TLS certificate (if applicable).
3. Configure topic subscriptions: enter the MQTT topic pattern that your sensors publish to (e.g. 'sensors/+/readings' where '+' is a wildcard).
4. Configure the topic-to-module mapping: for each topic pattern, specify the target IMS module (Environmental Monitoring, Energy Monitoring, or Asset/CMMS).
5. Configure the payload format: specify whether payloads are JSON or CSV and map payload fields to IMS measurement fields.
6. Save and test the connection — IMS will confirm successful MQTT broker connection.

**REST API integration:**

1. Generate an IoT-specific API key in **Admin → Integrations → API Keys** with write scope on the target module.
2. Configure your sensor/hub to POST to the IMS REST endpoint:
   'POST /api/v1/environmental-monitoring/readings' (for environmental readings)
   'POST /api/v1/energy-monitoring/readings' (for energy readings)
3. Include the API key in the 'X-API-Key' header.
4. Payload format: JSON object with fields: 'sensorId', 'timestamp' (ISO 8601), 'value', 'unit'.

## Data Mapping

| Sensor Output | IMS Module Field | Notes |
|---|---|---|
| sensorId | monitoringPoint.externalRef | Used to identify the IMS monitoring point |
| timestamp | reading.recordedAt | ISO 8601 datetime with timezone |
| value | reading.value | Numeric measurement value |
| unit | reading.unit | e.g. 'ppm', 'kWh', 'degC' |
| quality | reading.qualityFlag | Optional: GOOD, SUSPECT, BAD |

## Troubleshooting

- **Readings not appearing in IMS:** Verify the MQTT topic or REST endpoint is correct and the API key has write access. Check IMS Admin → IoT Gateway → Event Log for ingestion errors.
- **Sensor ID not matched to monitoring point:** IMS maps incoming readings to monitoring points by 'sensorId'. Ensure the 'externalRef' field on each IMS monitoring point record matches the sensor ID published by the device.
- **Alert thresholds not triggering:** Confirm that threshold alerts are configured on the IMS monitoring point record (Environmental Monitoring → Monitoring Points → [Point] → Thresholds). Thresholds are evaluated per reading upon ingestion.
- **High-frequency readings overloading IMS:** IMS IoT Gateway applies rate limiting per sensor (default 1 reading per minute). For higher-frequency monitoring, use the MQTT integration with server-side aggregation.

## Support

Contact IMS Support with your IoT protocol (MQTT/REST), sensor hardware model, and IMS IoT Gateway Event Log entries.
`,
  },
  {
    id: 'KB-IG2-010',
    title: 'Integrating IMS with DocuSign',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'docusign', 'electronic-signature'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Integrating IMS with DocuSign

## Overview

IMS integrates with DocuSign to provide enhanced electronic signature workflows for documents that require a formal, legally binding e-signature process — typically contracts, supplier quality agreements, regulatory submissions, and regulated-industry documents requiring 21 CFR Part 11 or EU GMP Annex 11 compliance.

The integration enables:

- **DocuSign envelope creation triggered from IMS document approval workflow:** When a document reaches the signature stage in IMS, a DocuSign envelope is automatically created with the document file and configured signatories.
- **Signatory selection from IMS users or external contacts:** Signatories can be IMS users or external parties (suppliers, customers, auditors) by email address.
- **Status tracking in IMS:** DocuSign envelope status (sent, viewed, signed, declined, voided) is reflected in the IMS document record in real time.
- **Signed document archived back to IMS:** Once all parties have signed, the completed PDF (with DocuSign certificate) is automatically attached to the IMS document record.

## Prerequisites

- DocuSign account (Business Pro plan or higher for API access)
- DocuSign Integration Key and RSA private key (for JWT authentication)
- IMS System Administrator access
- IMS Professional or Enterprise subscription

## Integration Architecture

IMS uses the DocuSign eSignature REST API v2.1 with JWT (JSON Web Token) authentication for server-to-server API calls. When an IMS workflow triggers a signature request:

1. IMS calls the DocuSign API to create an envelope with the document and signer details.
2. DocuSign sends signing invitations to each signer by email.
3. DocuSign sends webhook callbacks to IMS as signers act on the envelope.
4. On completion, IMS downloads the signed document from DocuSign and attaches it to the record.

## Configuration Steps

1. In DocuSign Developer Center (or your production account), create an **Integration Key** (App).
2. Add a **RSA Keypair** to the integration key. Download the private key file.
3. Grant the integration key **JWT consent** for your DocuSign account.
4. In IMS, navigate to **Admin → Integrations → DocuSign**.
5. Enter: Integration Key (Client ID), Account ID, API base URL (production or sandbox), and upload the RSA private key.
6. Click **Test Connection** — IMS will confirm authentication is working.
7. Configure the IMS document types that can use DocuSign signing.
8. In your IMS document approval workflow, add a "DocuSign Signature" step. Configure the signer roles (e.g. Author, Reviewer, Approver, External Party).
9. Test with a non-production document by triggering the signature step and confirming the envelope appears in your DocuSign account.

## Data Mapping

| IMS Field | DocuSign Field | Notes |
|---|---|---|
| Document.title | Envelope.emailSubject | Subject of the signing invitation email |
| Document.content (PDF export) | Envelope.document | The file to be signed |
| Signatory.email | Signer.email | Signer identifier |
| Signatory.name | Signer.name | Displayed on signature block |
| Signatory.signingOrder | Signer.routingOrder | Sequential signing order |
| Signing.completedAt | Envelope.completedDateTime | Timestamp of final signature |

## Troubleshooting

- **JWT authentication error:** Verify the Integration Key, Account ID, and RSA private key are correct. Ensure JWT consent has been granted for the account — without consent, JWT authentication returns a 'consent_required' error.
- **Envelope stuck in "Sent" status:** If a signer has not received the email, check their spam folder. In DocuSign, resend the signing email from the Manage Envelopes view.
- **Signed document not appearing in IMS:** IMS receives the signed document via DocuSign webhook. If the webhook is not configured or is blocked by a firewall, the callback will not reach IMS. Verify the webhook URL in DocuSign Connect settings (Admin → Connect → Configurations) points to your IMS instance.
- **21 CFR Part 11 mode:** For regulated industries, enable "Enhanced Authentication" on the DocuSign envelope template (requires signers to re-authenticate via SMS or access code). Configure this in Admin → Integrations → DocuSign → Compliance Settings.

## Support

Contact IMS Support with the IMS document reference, DocuSign envelope ID, and the error message or unexpected behaviour observed.
`,
  },
  {
    id: 'KB-IG2-011',
    title: 'Integrating IMS with Workday HR',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'workday', 'hr', 'hris'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Integrating IMS with Workday HR

## Overview

This guide covers the integration between Workday and IMS HR module to synchronise employee data and learning records:

- **Employee sync (Workday → IMS):** New hires, terminations, job title changes, department changes, and manager changes in Workday are automatically reflected in IMS HR, keeping IMS employee records current without manual administration.
- **Training completion sync (IMS → Workday Learning):** Course completions tracked in IMS Training Management are pushed to Workday Learning as completion records, providing a unified view of employee learning in both systems.
- **Org hierarchy sync:** Workday supervisory organisation structure is reflected in IMS for manager approval chains and org reporting.

## Prerequisites

- Workday tenant with Integration System User (ISU) configured
- Workday Connector API credentials (ISU username, password, tenant name)
- IMS System Administrator access
- IMS Professional or Enterprise subscription with HR module

## Integration Architecture

**Workday → IMS:** Workday publishes employee changes via Workday Connector integrations (PECI — Payroll Effective Change Interface or the simpler Worker integration). IMS Integration Hub subscribes to a Workday REST API endpoint or processes scheduled Workday report exports via SFTP.

**IMS → Workday:** IMS calls the Workday REST API (WAPI) to push training completion events as Learning Completion records in Workday.

## Configuration Steps

1. In Workday, work with your Workday administrator to create an **Integration System User (ISU)** with appropriate security domain permissions:
   - Worker Data domain (for reading employee records)
   - Learning domain (for writing completion records)
2. Configure the Workday Worker integration or custom report to output employee change data.
3. In IMS, navigate to **Admin → Integrations → Workday**.
4. Enter: Workday tenant URL, ISU username, ISU password, and tenant name.
5. Click **Test Connection**.
6. Configure the sync scope: which Workday organisation(s) to sync to IMS.
7. Map Workday fields to IMS fields using the field mapping editor.
8. Set the sync schedule: Workday → IMS runs daily (or event-driven if Workday PECI is configured).
9. Configure IMS → Workday sync: enable training completion push and map IMS course records to Workday Learning course IDs.
10. Run an initial sync and verify employee records in IMS match Workday.

## Data Mapping

| IMS Field | Workday Field | Notes |
|---|---|---|
| Employee.employeeId | Worker.EmployeeID | Unique identifier (cross-reference key) |
| Employee.firstName | Worker.Legal_Name.First_Name | |
| Employee.lastName | Worker.Legal_Name.Last_Name | |
| Employee.email | Worker.Primary_Work_Email | Work email |
| Employee.department | Worker.Organization.Name | Supervisory org name |
| Employee.jobTitle | Worker.Position.Job_Profile.Name | |
| Employee.manager | Worker.Manager.Employee_ID | Used for approval chains |
| Employee.status | Worker.Active | Active/Terminated maps to IMS status |
| Training.courseId | LearningEnrollment.Course_ID | Must match Workday course IDs |
| Training.completedAt | LearningEnrollment.Completion_Date | |

## Troubleshooting

- **ISU authentication failure:** Verify the ISU account is not locked and the password has not expired. Workday ISU passwords have configurable expiry — set a non-expiring password for integration accounts.
- **Employee not created in IMS:** Check the sync scope — the employee must be in a Workday organisation included in the sync scope. Review the IMS Integration Event Log for the specific worker ID and error.
- **Training completions not appearing in Workday:** Verify that the IMS course ID is mapped to the correct Workday course ID. IMS uses the mapping table in Admin → Integrations → Workday → Course Mapping.

## Support

Contact IMS Support with the Workday tenant URL, worker Employee ID, and IMS Integration Event Log entries for the affected sync event.
`,
  },
  {
    id: 'KB-IG2-012',
    title: 'Integrating IMS with Oracle NetSuite',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'netsuite', 'erp', 'finance'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Integrating IMS with Oracle NetSuite

## Overview

This guide covers integration between Oracle NetSuite and IMS for financial and supply chain data sharing:

- **Purchase order sync (NetSuite → IMS Supplier Portal):** Approved POs from NetSuite are published to the IMS Supplier Portal, enabling suppliers to acknowledge and track orders.
- **Vendor master sync (NetSuite → IMS Suppliers):** NetSuite vendor records are the master data source for IMS supplier records, avoiding duplicate maintenance.
- **Invoice matching (NetSuite ↔ IMS):** Supplier-submitted invoices via IMS Supplier Portal are matched against NetSuite POs for three-way matching before payment approval.
- **Financial data for ESG (NetSuite → IMS ESG):** Revenue, spend by category, and other financial aggregates feed IMS ESG module for GRI financial disclosures and environmental intensity calculations.

## Prerequisites

- NetSuite account with SuiteCloud Platform enabled
- NetSuite Administrator access
- NetSuite TBA (Token-Based Authentication) credentials for API access
- IMS System Administrator access
- IMS Professional or Enterprise subscription

## Integration Architecture

The integration uses the NetSuite SuiteScript 2.x and REST Record API (or SOAP-based SuiteTalk for older NetSuite versions). IMS acts as the API consumer, polling or receiving webhooks from NetSuite.

**NetSuite → IMS:** NetSuite SuiteScript deploys a Scheduled Script that exports changed records (vendors, POs) to an intermediate JSON file or calls the IMS REST API directly via an HTTPS outbound call.

**IMS → NetSuite:** IMS calls the NetSuite REST Record API to read PO data and post supplier responses.

## Configuration Steps

1. In NetSuite, set up **Token-Based Authentication (TBA)**:
   a. Create an Integration Record (Setup → Integration → Manage Integrations → New).
   b. Enable Token-Based Authentication and note the Consumer Key and Consumer Secret.
   c. Create a Role with appropriate permissions (Vendor, Purchase Order, Transactions).
   d. Create an Employee with that Role and generate an Access Token (Consumer Key, Consumer Secret, Token Key, Token Secret).
2. In IMS, navigate to **Admin → Integrations → Oracle NetSuite**.
3. Enter: NetSuite Account ID, Consumer Key, Consumer Secret, Token Key, Token Secret.
4. Test the connection.
5. Configure the sync entities: Vendors, Purchase Orders.
6. Map NetSuite fields to IMS fields.
7. Set sync schedule or enable real-time sync via NetSuite Workflow email alerts triggering IMS webhooks.
8. Run initial historical sync for vendors and open POs.

## Data Mapping

| IMS Field | NetSuite Field | Notes |
|---|---|---|
| Supplier.name | Vendor.companyName | |
| Supplier.externalRef | Vendor.entityId | NetSuite vendor ID |
| Supplier.currency | Vendor.currency | ISO currency code |
| PurchaseOrder.poNumber | PurchaseOrder.tranId | Transaction ID (PO number) |
| PurchaseOrder.vendor | PurchaseOrder.entity | Linked to vendor record |
| PurchaseOrder.amount | PurchaseOrder.total | Total PO value |
| PurchaseOrder.deliveryDate | PurchaseOrder.shipDate | Expected delivery date |
| PurchaseOrder.status | PurchaseOrder.status | NetSuite status mapped to IMS status |

## Troubleshooting

- **TBA signature error:** TBA signatures are time-sensitive. Ensure server clocks on IMS and NetSuite are synchronised. Even a few minutes of clock skew causes authentication failures.
- **POs not syncing:** Verify the NetSuite integration role has Purchase Order View permission. NetSuite permission errors are returned as 403 responses with a 'USER_ERROR' code.
- **Vendor sync duplicating records:** IMS uses the NetSuite vendor entityId as the external reference key. Ensure all NetSuite vendors have unique entityIds before initial sync.

## Support

Contact IMS Support with your NetSuite Account ID (not credentials), the entity type (vendor/PO), and the IMS Integration Event Log entry for the failed sync.
`,
  },
  {
    id: 'KB-IG2-013',
    title: 'Using the IMS REST API',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'api', 'rest', 'developer'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Using the IMS REST API

## Overview

IMS provides a comprehensive REST API enabling external systems, custom integrations, and developer tools to read and write IMS data programmatically. The API covers all IMS modules and supports CRUD operations, filtering, pagination, and webhook event subscriptions.

This guide provides an overview of API authentication, structure, key endpoints, and usage patterns.

## Prerequisites

- IMS Administrator access to generate API keys
- Basic knowledge of REST APIs and HTTP
- API client tool (e.g. Postman, Insomnia, or any HTTP client)

## Integration Architecture

All API requests are made to the IMS API Gateway at your organisation's base URL:

'https://your-org.ims.app/api/v1/'

Two authentication methods are supported:

**API Key (server-to-server, recommended for integrations):**
Generate an API key in Admin → Integrations → API Keys. Include it in all requests as the 'X-API-Key' header.

**OAuth 2.0 Bearer Token (user-context operations):**
Use the OAuth 2.0 authorization code flow to obtain a Bearer token. Include it as 'Authorization: Bearer {token}'.

## Configuration Steps

1. In IMS, navigate to **Admin → Integrations → API Keys → New API Key**.
2. Name the key and select the permission scope (read-only or read-write) and module access.
3. Copy the API key — it is shown only once at creation. Store it securely.
4. Include the key in all API requests as the HTTP header 'X-API-Key'.

**Example request — list open incidents (using API key authentication):**

Method: GET
URL: 'https://your-org.ims.app/api/v1/incidents?status=OPEN&severity=HIGH'
Headers: 'X-API-Key: your-api-key-here'

**Example request — create a CAPA record:**

Method: POST
URL: 'https://your-org.ims.app/api/v1/capa'
Headers: 'X-API-Key: your-api-key-here' and 'Content-Type: application/json'
Body: JSON object with required CAPA fields.

## Data Mapping

| Operation | HTTP Method | Path Pattern | Notes |
|---|---|---|---|
| List records | GET | '/api/v1/{module}' | Supports pagination, filter, sort |
| Get single record | GET | '/api/v1/{module}/{id}' | Returns full record |
| Create record | POST | '/api/v1/{module}' | Body: JSON object |
| Update record | PUT | '/api/v1/{module}/{id}' | Full replacement |
| Partial update | PATCH | '/api/v1/{module}/{id}' | Only specified fields |
| Delete record | DELETE | '/api/v1/{module}/{id}' | Soft delete (archived) |
| Subscribe webhook | POST | '/api/v1/webhooks' | Register event callback URL |

**Common query parameters:**

- 'status=OPEN' — filter by status
- 'page=2&pageSize=50' — pagination
- 'sort=createdAt:desc' — sort order
- 'fields=id,title,status' — field projection (return only specified fields)
- 'search=keyword' — full-text search

**Rate limits:**

- Standard: 1,000 requests per minute per API key
- Burst: up to 2,000 requests per minute for up to 10 seconds
- Rate limit headers: 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'

**Error codes:**

- 400 Bad Request — invalid request body or parameters
- 401 Unauthorised — invalid or missing API key
- 403 Forbidden — API key lacks required scope
- 404 Not Found — record does not exist
- 409 Conflict — optimistic locking conflict (retry the request)
- 429 Too Many Requests — rate limit exceeded (wait before retrying)

## Troubleshooting

- **401 Unauthorised:** Verify the API key is included as the 'X-API-Key' header (not as a query parameter or in the body). Keys are case-sensitive.
- **403 Forbidden:** The API key does not have the required module scope. Edit the key in Admin → Integrations → API Keys to add the missing module.
- **409 Conflict on PUT/PATCH:** IMS uses optimistic locking. Include the 'If-Match' header with the record's current 'etag' value from the GET response. If the record has changed since you read it, fetch the latest version and reapply your changes.
- **Pagination missing records:** Always use the 'cursor' or 'page' parameters consistently. If records are being created/modified while paginating, use cursor-based pagination (the 'next' URL in the response) to avoid missing or duplicating records.

## Support

IMS API documentation is available at 'https://your-org.ims.app/api-docs' (Swagger/OpenAPI UI). For API integration support, contact IMS Support with the full request (URL, headers with API key value redacted, body) and the complete response received.
`,
  },
  {
    id: 'KB-IG2-014',
    title: 'Integrating IMS with SIEM (Splunk / Microsoft Sentinel)',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'siem', 'splunk', 'sentinel', 'infosec'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Integrating IMS with SIEM (Splunk / Microsoft Sentinel)

## Overview

IMS generates a comprehensive audit trail of all system events, including user logins, record changes, permission changes, document access, and administrative actions. This audit trail can be streamed to your Security Information and Event Management (SIEM) platform for correlation, alerting, and long-term security log retention.

This guide covers integration with Splunk (using HTTP Event Collector) and Microsoft Sentinel (using a data connector).

Streaming IMS audit events to your SIEM enables:
- Centralised security monitoring alongside other system logs
- Correlation rules that combine IMS events with network and endpoint events
- Long-term log retention beyond the IMS 3-year audit trail default
- Insider threat detection using IMS access patterns

## Prerequisites

- Splunk Enterprise/Cloud with HTTP Event Collector (HEC) enabled, OR Microsoft Sentinel workspace
- IMS System Administrator access
- IMS Professional or Enterprise subscription with Audit Trail export enabled

## Integration Architecture

**IMS → Splunk (HTTP Event Collector):** IMS streams audit events to Splunk in real time (within 30 seconds of event occurrence) via Splunk's HEC endpoint. Each IMS event is sent as a JSON object. A Splunk source type 'ims:audit' is provided for field extraction.

**IMS → Microsoft Sentinel:** IMS posts audit events to an Azure Log Analytics workspace via the Logs Ingestion API (DCR-based). A Sentinel data connector configuration template is available for download from IMS Admin → Integrations → SIEM.

## Configuration Steps

**Splunk HEC:**

1. In Splunk, navigate to **Settings → Data Inputs → HTTP Event Collector → New Token**.
2. Name the token "IMS Audit Trail", select the target index.
3. Copy the HEC token.
4. In IMS, navigate to **Admin → Integrations → SIEM → Splunk**.
5. Enter: Splunk HEC endpoint URL (e.g. 'https://splunk.yourcompany.com:8088/services/collector/event'), HEC token, and target index name.
6. Select the event types to stream (All, or specific categories: Authentication, Data Change, Document Access, Permission Change, System Admin).
7. Test by clicking **Send Test Event** and verifying receipt in Splunk.
8. Enable streaming.

**Microsoft Sentinel:**

1. In IMS, download the Sentinel data connector template from **Admin → Integrations → SIEM → Sentinel → Download DCR Template**.
2. In Azure, deploy the Data Collection Rule (DCR) using the downloaded ARM template.
3. Copy the DCR Immutable ID and Endpoint URI from the Azure DCR.
4. In IMS Admin → Integrations → SIEM → Sentinel, enter the Endpoint URI and DCR Immutable ID.
5. Authenticate IMS to the DCR using a Service Principal (Client ID and Client Secret).
6. Test and enable.

## Data Mapping

| IMS Event Type | Log Field | Example Value |
|---|---|---|
| User login | eventType | 'USER_LOGIN' |
| Login failure | eventType | 'USER_LOGIN_FAILED' |
| Record created | eventType | 'RECORD_CREATE' |
| Record updated | eventType | 'RECORD_UPDATE' |
| Record deleted | eventType | 'RECORD_DELETE' |
| Permission changed | eventType | 'PERMISSION_CHANGE' |
| Document accessed | eventType | 'DOCUMENT_VIEW' |
| Admin action | eventType | 'ADMIN_ACTION' |
| userId | userId | IMS user UUID |
| targetId | targetId | ID of affected record |
| timestamp | timestamp | ISO 8601 UTC |
| ipAddress | ipAddress | Client IP |
| userAgent | userAgent | Browser/client string |

## Troubleshooting

- **Splunk HEC returning 403:** Verify the HEC token is correct and the HEC input is enabled in Splunk (Settings → Data Inputs → HTTP Event Collector → Enable). Ensure the Splunk port (default 8088) is accessible from IMS.
- **Events not appearing in Sentinel:** Verify the Service Principal has 'Metrics Publisher' role on the DCR. Check Azure Monitor → Data Collection Rules → [DCR] → Monitoring for ingestion errors.
- **High volume overwhelming SIEM:** If your organisation generates millions of IMS events per day, use the event type filter in IMS Admin → Integrations → SIEM to limit streaming to high-value event types only (Authentication, Permission Change, Admin Action).

## Support

Contact IMS Support with your SIEM platform type, the IMS event type failing to stream, and the integration event log entry.
`,
  },
  {
    id: 'KB-IG2-015',
    title: 'Integrating IMS with Learning Management Systems (LMS)',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['integration', 'lms', 'training', 'elearning'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Integrating IMS with Learning Management Systems (LMS)

## Overview

IMS Training Management tracks what training employees need, when they are due, and whether they are compliant. An external LMS (such as Moodle, TalentLMS, Cornerstone, Docebo, or Totara) delivers the actual e-learning courses and manages course content.

This guide covers integrating an external LMS with IMS Training Management to:

- **Sync course completion data:** When an employee completes a course in the LMS, the completion (including score and certificate) is automatically recorded in IMS Training.
- **Trigger LMS enrolment from IMS:** When IMS Training gap analysis identifies that an employee needs a course, the integration automatically enrols them in the LMS course.
- **Certificate import:** Completion certificates generated by the LMS are imported and attached to the IMS training record.
- **Compliance status in IMS:** IMS uses LMS completion data to calculate each employee's training compliance status across all required courses.

## Prerequisites

- LMS supporting SCORM 1.2/2004, xAPI (Tin Can), or REST API for completions
- LMS Administrator access
- IMS System Administrator access
- IMS Professional or Enterprise subscription with Training module

## Integration Architecture

Two integration methods are supported:

**xAPI (Tin Can) — recommended for modern LMSs:**
The LMS is configured to send xAPI statements to the IMS Learning Record Store (LRS) endpoint whenever a learner completes or makes progress on a course. IMS processes incoming xAPI statements and updates training records accordingly.

**REST API — for LMSs with a management API:**
IMS polls the LMS REST API on a schedule to retrieve new completions since the last sync. For enrolment triggers, IMS calls the LMS enrolment API to enrol a learner in a course.

**SCORM (legacy):** SCORM is primarily a content packaging standard rather than a completion-reporting protocol. For SCORM-based LMSs, IMS uses the REST API method with the LMS as the completion data source.

## Configuration Steps

**xAPI integration:**

1. In IMS, navigate to **Admin → Integrations → LMS → xAPI**.
2. Copy the IMS LRS endpoint URL, username, and password.
3. In your LMS, configure the xAPI/Tin Can endpoint with the IMS LRS details.
4. Test by completing a course in the LMS and verifying the xAPI statement appears in IMS Admin → Integrations → LMS → Event Log.
5. Configure course-to-IMS-requirement mapping: link each LMS course ID to the IMS training requirement it satisfies.

**REST API integration:**

1. In IMS, navigate to **Admin → Integrations → LMS → REST API**.
2. Select your LMS from the supported LMS list (Moodle, TalentLMS, Cornerstone, Docebo, Totara) or use the generic REST API option.
3. Enter your LMS API credentials (URL, API key or OAuth credentials).
4. Test the connection.
5. Configure the sync schedule (hourly recommended for compliance visibility).
6. Enable enrolment push if you want IMS to auto-enrol employees in LMS courses.
7. Map IMS training requirements to LMS course IDs.

## Data Mapping

| IMS Field | xAPI / LMS Field | Notes |
|---|---|---|
| TrainingRecord.employeeId | actor.mbox | 'mailto:employee@company.com' format |
| TrainingRecord.courseId | object.id | LMS course URL as IRI |
| TrainingRecord.completedAt | timestamp | ISO 8601 UTC |
| TrainingRecord.score | result.score.scaled | 0.0 to 1.0 (percentage/100) |
| TrainingRecord.passed | result.success | Boolean |
| TrainingRecord.duration | result.duration | ISO 8601 duration (e.g. 'PT45M') |
| TrainingRecord.certificateUrl | result.extensions | Certificate URL in extensions object |

## Troubleshooting

- **xAPI statements not received:** Verify the LMS is configured with the correct IMS LRS endpoint URL, username, and password. Some LMSs require the endpoint to be HTTPS with a valid certificate. Test using a browser-based xAPI testing tool.
- **Course not matched to IMS requirement:** The xAPI object.id must exactly match the course ID configured in the IMS course mapping table. Check for trailing slashes or URL encoding differences.
- **Enrolment not triggering in LMS:** Verify the LMS enrolment API key has permission to enrol users. Some LMSs require enrolment to be from the same authentication domain as the course.
- **Duplicate training records:** If both xAPI and REST API are configured for the same LMS, completions may be recorded twice. Use only one integration method per LMS.

## Support

Contact IMS Support with your LMS platform name and version, the xAPI statement or API response, and the IMS Training Event Log entry for the affected employee and course.
`,
  },
];
