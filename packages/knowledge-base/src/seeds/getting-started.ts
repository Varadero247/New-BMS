import type { KBArticle } from '../types';

export const gettingStartedArticles: KBArticle[] = [
  {
    id: 'KB-GS-001',
    title: 'Welcome to IMS — First Login & Dashboard Orientation',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['getting-started', 'login', 'dashboard', 'orientation'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Welcome to IMS — First Login & Dashboard Orientation

## Overview

Welcome to the Integrated Management System (IMS). This guide walks you through your very first login and helps you get your bearings on the main dashboard.

---

## Step 1: Access the Login Page

Navigate to your IMS instance in a web browser. The default login URL for the Admin Console is:

  http://localhost:3027  (Admin Console)
  http://localhost:3000  (Main Dashboard)

For production deployments, your administrator will provide the correct URL.

---

## Step 2: Enter Your Credentials

Use the credentials provided by your system administrator. Default test credentials for new installations:

  Email:    admin@ims.local
  Password: admin123

> **Important:** Change the default password immediately after first login. Navigate to Settings → My Profile → Change Password.

---

## Step 3: Understanding the Main Dashboard (port 3000)

After logging in, you will land on the main IMS Dashboard. Key areas:

### Top Navigation Bar
- **Logo / Home** — Returns you to the dashboard from any module
- **Search** — Global search across all modules (Cmd+K shortcut)
- **Notifications bell** — Real-time alerts from all active modules
- **User avatar** — Access your profile, settings, and logout

### Left Sidebar
The sidebar lists all active modules you have permission to access. Modules are grouped by category:
- Health, Safety & Environment (HSE)
- Quality & Compliance
- Operations & Maintenance
- Finance & Administration
- People & HR

### Main Content Area
The dashboard homepage shows:
- **KPI Summary** — Key metrics from your most-used modules
- **Recent Activity** — Last 20 actions across the system
- **Alerts & Action Items** — Items requiring your attention
- **Quick Actions** — Shortcuts to common tasks

---

## Step 4: Admin Console vs Main Dashboard

IMS has two primary interfaces:

| Interface | Port | Purpose |
|-----------|------|---------|
| Main Dashboard | 3000 | Day-to-day operations for all users |
| Admin Console | 3027 | Super-admin management (growth, onboarding, settings) |

Regular staff use the Main Dashboard. The Admin Console is reserved for system administrators and Nexara staff.

---

## Next Steps

- Read **"Understanding the Admin Console Navigation"** (KB-GS-002)
- Complete your **Organisation Profile** (KB-GS-003)
- Invite your first users — see **"Managing Users, Roles & Permissions"** (KB-GS-004)
`,
  },

  {
    id: 'KB-GS-002',
    title: 'Understanding the Admin Console Navigation',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['admin-console', 'navigation', 'sidebar', 'interface'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Understanding the Admin Console Navigation

## Overview

The Admin Console (port 3027) is a dedicated interface for Nexara administrators and super-admins. It provides tools for managing clients, tracking growth, and configuring the platform at a system level.

---

## Sidebar Sections

### Growth & Intelligence
- **Growth Dashboard** — Key business metrics: MRR, ARR, churn rate, NPS
- **Prospect Research** — Research tools for target accounts
- **LinkedIn Tracker** — Monitor LinkedIn engagement and outreach

### Client Management
- **Onboarding** — Track new client onboarding progress and milestones
- **Partner Onboarding** — Manage partner organisation setups
- **Health Scores** — Client health scoring based on usage patterns
- **Renewals** — Upcoming contract renewals and risk alerts
- **Win-back** — Churned account recovery campaigns

### Reporting & Communication
- **Monthly Review** — Monthly business review snapshots
- **Digest** — Weekly/daily digest configuration and delivery
- **Meetings** — Meeting notes and action item tracking

### Sales & Finance
- **Leads** — Lead pipeline and qualification
- **Expansion** — Upsell/cross-sell opportunity tracking
- **Expenses** — Team expense management

### Admin & Legal
- **Contracts** — Client contract repository and status tracking
- **DSARs** — Data Subject Access Request management (GDPR compliance)
- **Feature Requests** — Customer feature request tracking and voting

### Support
- **Knowledge Base** — This article repository (you are here)
- **AI Assistant** — AI-powered assistant for admin queries

---

## Navigation Tips

1. **Active state** — The current page is highlighted in the sidebar with a blue background
2. **Keyboard shortcut** — Press Cmd+K (Mac) or Ctrl+K (Windows) to open the global command palette
3. **Logout** — Always use the Logout button at the bottom of the sidebar to end your session securely

---

## Role Requirements

The Admin Console requires the **SUPER_ADMIN** or **SYSTEM_ADMIN** role. Attempting to access it with a standard user account will redirect to the login page.

---

## Next Steps

- Set up your **Organisation Profile** (KB-GS-003)
- Invite users with appropriate roles (KB-GS-004)
`,
  },

  {
    id: 'KB-GS-003',
    title: 'Setting Up Your Organisation Profile',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['organisation', 'setup', 'profile', 'configuration', 'onboarding'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Setting Up Your Organisation Profile

## Overview

Before enabling any modules, complete your Organisation Profile. This information is used across all modules for headers, reports, regulatory filings, and audit trails.

---

## Before You Begin

Gather the following information:

- Legal company name (as registered)
- Company registration number (if applicable)
- Registered address
- Primary business industry / sector
- Company logo (PNG or SVG, recommended 200×200px or larger)
- Preferred timezone
- Primary contact email
- VAT/tax number (if applicable)
- Applicable regulatory standards (ISO 9001, ISO 14001, ISO 45001, etc.)

---

## Step-by-Step Setup

### 1. Navigate to Organisation Settings

From the Main Dashboard (port 3000):
  Settings → Organisation → General

Or from the Admin Console:
  Settings → Organisation Profile

### 2. Enter Basic Information

Fill in the required fields:

  - **Organisation Name** — Your legal or trading name
  - **Industry** — Select from the dropdown (Manufacturing, Healthcare, Construction, etc.)
  - **Country** — Sets default regulatory context
  - **Timezone** — Used for timestamps, reports, and scheduled tasks
  - **Financial Year Start** — Month your financial year begins (affects finance and ESG modules)

### 3. Upload Your Logo

Click the logo upload area and select your file. The system accepts:
- PNG, JPG, SVG formats
- Maximum 5 MB
- Recommended size: 200×200px (square)

The logo appears on all generated reports, certificates, and the dashboard header.

### 4. Set Regulatory Standards

Under **Compliance Standards**, select all standards your organisation is certified to or working towards:

- ISO 9001 (Quality Management)
- ISO 14001 (Environmental Management)
- ISO 45001 (Occupational Health & Safety)
- ISO 27001 (Information Security)
- ISO 50001 (Energy Management)
- Additional standards as applicable

This determines which compliance checklists and audit frameworks appear by default.

### 5. Configure Notifications

Set the default notification preferences for system-wide alerts:
- **Email notifications** — Enter the primary admin email
- **Digest frequency** — Daily, weekly, or off
- **Critical alert escalation** — Secondary contact for urgent compliance alerts

### 6. Save & Confirm

Click **Save Organisation Profile**. The system will validate all required fields and confirm the save with a success notification.

---

## After Completing Setup

- Your organisation name and logo will appear on the dashboard immediately
- Module-specific settings (e.g., legal register jurisdiction, emission factors) will default to your country selection
- You can update any field at any time — changes take effect immediately

---

## Next Steps

- Invite your users: **"Managing Users, Roles & Permissions"** (KB-GS-004)
- Enable your first module: **"Enabling & Configuring Modules"** (KB-GS-005)
`,
  },

  {
    id: 'KB-GS-004',
    title: 'Managing Users, Roles & Permissions',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['users', 'roles', 'permissions', 'rbac', 'access-control', 'invite'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Managing Users, Roles & Permissions

## Overview

IMS uses a Role-Based Access Control (RBAC) system with 39 predefined roles across 17 modules. Each role carries a specific permission level that determines what a user can view, create, edit, or delete.

---

## Understanding the Role System

### Permission Levels (7 levels, ascending)

| Level | Name | Description |
|-------|------|-------------|
| 0 | NONE | No access to the module |
| 1 | VIEW | Read-only access |
| 2 | COMMENT | View + add comments/notes |
| 3 | EDIT | View + create + edit own records |
| 4 | MANAGE | Edit + manage others' records |
| 5 | APPROVE | Manage + approve/reject workflows |
| 6 | ADMIN | Full control including configuration |

### Key Roles Available

**System Roles**
- SUPER_ADMIN — Full system access, all modules level 6
- SYSTEM_ADMIN — Full access except super-admin functions
- MODULE_ADMIN — Admin access to assigned modules only
- VIEWER — Read-only across all modules

**Module-Specific Roles** (examples)
- HS_MANAGER — Health & Safety management (level 5)
- HS_OFFICER — Health & Safety operations (level 3)
- ENV_MANAGER — Environmental management (level 5)
- QUALITY_MANAGER — Quality management (level 5)
- HR_MANAGER — Human Resources management (level 5)
- FINANCE_MANAGER — Finance management (level 5)
- RISK_MANAGER — Risk management (level 5)
- AUDITOR — Audit management (level 4)
- COMPLIANCE_OFFICER — Compliance across modules (level 4)
- EMPLOYEE — Basic employee self-service (level 2)

---

## Inviting New Users

### 1. Navigate to User Management

  Settings → Users → Invite User

### 2. Enter User Details

Required fields:
- **Email address** — The user will receive an invitation email
- **First name** and **Last name**
- **Role** — Select from the 39 available roles (see above)
- **Department** — Optional, used for reporting and filtering

### 3. Set Module Access (optional override)

If the selected role doesn't perfectly match your needs, you can override individual module permissions after creating the user:

  Users → [Select User] → Module Permissions → Edit

Adjust each module's permission level from 0 (None) to 6 (Admin).

### 4. Send Invitation

Click **Send Invitation**. The user receives an email with a secure link (valid for 72 hours) to set their password and activate their account.

---

## Managing Existing Users

### Viewing All Users

  Settings → Users

The users list shows: name, email, role, last login date, and status (Active/Invited/Suspended).

### Changing a User's Role

1. Click the user's name to open their profile
2. Click **Edit Role**
3. Select the new role from the dropdown
4. Click **Save** — changes take effect on next login

### Suspending a User

To temporarily disable access without deleting the account:
1. Open the user profile
2. Click **Suspend Account**
3. The user will be immediately logged out and unable to log back in

### Deleting a User

Deleted users are soft-deleted (their data and audit trail are preserved):
1. Open the user profile
2. Click **Delete User** → **Confirm**

---

## Password Policies

Default password policy (configurable in Settings → Security):
- Minimum 12 characters
- At least 1 uppercase, 1 lowercase, 1 number, 1 special character
- Passwords expire every 90 days (configurable)
- Last 5 passwords cannot be reused
- Account locks after 5 failed attempts (resets after 15 minutes)

---

## Single Sign-On (SSO)

For enterprise setups, IMS supports SAML 2.0 SSO. Configure in:
  Settings → Security → Single Sign-On

Supported identity providers: Okta, Azure AD, Google Workspace, OneLogin.

---

## Next Steps

- Enable your first module: **"Enabling & Configuring Modules"** (KB-GS-005)
- For module-specific roles, see the module setup guide for that module
`,
  },

  {
    id: 'KB-GS-005',
    title: 'Enabling & Configuring Modules',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['modules', 'enable', 'configure', 'getting-started', 'checklist'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Enabling & Configuring Modules

## Overview

IMS is a modular system. Modules are enabled one at a time, allowing you to roll out the platform incrementally without overwhelming your team. Each module has its own database schema, API service, and web interface.

---

## Available Modules

IMS ships with the following modules (44 total):

**Compliance & Safety**
- Health & Safety (ISO 45001) — port 3001
- Environmental Management (ISO 14001) — port 3002
- Quality Management (ISO 9001) — port 3003
- Food Safety — port 3020
- Information Security (ISO 27001) — port 3015
- ISO 42001 (AI Management) — port 3024
- ISO 37001 (Anti-Bribery) — port 3025

**Risk & Audit**
- Risk Management — port 3031
- Audit Management — port 3042
- Incident Management — port 3041
- Corrective Actions (CAPA) — embedded in modules

**Operations**
- Maintenance (CMMS) — port 3017
- Field Service — port 3023
- Inventory — port 3005
- Asset Management — port 3034
- Permit to Work (PTW) — port 3039

**People & HR**
- HR & Employee Management — port 3006
- Payroll — port 3007
- Training Management — port 3032

**Finance & Legal**
- Finance & Accounting — port 3013
- Document Control — port 3035
- Contract Management — port 3037
- Legal Register — embedded in compliance modules

**Customer & Supply**
- CRM — port 3014
- Customer Portal — port 3018
- Supplier Portal — port 3019
- Supplier Evaluation — port 3033

**ESG & Energy**
- ESG Reporting — port 3016
- Energy Management (ISO 50001) — port 3021
- Environmental Monitoring — port 3002

---

## How to Enable a Module

### Step 1: Navigate to Module Settings

  Settings → Modules → Module Library

You will see all available modules with their current status: **Enabled**, **Disabled**, or **Trial**.

### Step 2: Select the Module to Enable

Click the module card. A setup panel will slide open on the right showing:
- Module description and ISO standard alignment
- Prerequisites (other modules or data required)
- Estimated setup time
- Link to the setup guide (see Module Guides in this Knowledge Base)

### Step 3: Click Enable

Click **Enable Module**. The system will:
1. Activate the module's API service
2. Create or verify the module's database tables
3. Add the module to the sidebar navigation for users with appropriate roles
4. Set default permission levels based on your organisation's role structure

### Step 4: Complete Module Configuration

After enabling, you will be redirected to the module's **Getting Started** wizard (if available) or to the module's main page.

Complete the module-specific configuration steps before inviting users to use it. Each module's setup guide is available in the **Module Guides** section of this Knowledge Base.

---

## Recommended Enablement Order

For new IMS installations, we recommend enabling modules in this order:

1. **Document Control** — Foundation for all other modules (policies, procedures)
2. **Health & Safety** — Typically the first compliance module needed
3. **Risk Management** — Feeds into all other modules
4. **HR & Employee Management** — Required for training and incident modules
5. **Quality Management** — Often required alongside H&S for certification
6. **Environmental Management** — ISO 14001 paired with ISO 45001
7. **Training Management** — Once HR is set up
8. **Incident Management** — Once H&S and HR are set up
9. **Audit Management** — Once the above are established
10. **Finance** — Can be enabled independently at any point

---

## Startup Checklist

Use this checklist to confirm your IMS installation is ready for users:

- [ ] Organisation Profile completed
- [ ] Admin user password changed from default
- [ ] At least one non-admin user invited
- [ ] At least one module enabled and configured
- [ ] Email notifications configured and tested
- [ ] Backup schedule confirmed with your IT team
- [ ] Users briefed on the login URL and credentials policy

---

## Disabling a Module

To disable a module:
  Settings → Modules → [Module Name] → Disable

> **Warning:** Disabling a module hides it from the sidebar and API but does NOT delete its data. Re-enabling the module will restore full access to all historical data.

---

## Need Help?

- Review the specific **Module Setup Guide** in the Module Guides section
- Contact support via the **AI Assistant** (sidebar)
- Email support: support@nexara.io
`,
  },
];
