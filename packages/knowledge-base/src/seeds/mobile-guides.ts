import type { KBArticle } from '../types';

export const mobileGuideArticles: KBArticle[] = [
  {
    id: 'KB-MOB-001',
    title: 'IMS on Mobile — Getting Started Guide',
    content: `## Overview

IMS is a fully responsive web application, accessible from any modern mobile browser without installing a dedicated app. Whether you are using iOS Safari on an iPhone, or Chrome on an Android device, the full IMS interface adapts to your screen size automatically.

## Browser Requirements

- **iOS**: Safari 15 or later (recommended), Chrome for iOS
- **Android**: Chrome 100 or later (recommended), Firefox for Android
- **Minimum screen**: 4-inch display; tablet recommended for complex workflows
- Enable JavaScript and cookies; do not use private/incognito mode if you need offline access or local storage

## Adding IMS to Your Home Screen (PWA)

Installing IMS as a Progressive Web App (PWA) gives you an app-like experience with offline access, push notifications, and fast launch times.

### On iOS (Safari)
1. Open IMS in Safari and sign in.
2. Tap the Share button (the box with an arrow pointing up) at the bottom of the screen.
3. Scroll down and tap **Add to Home Screen**.
4. Enter a name (e.g. 'IMS') and tap **Add**.
5. The IMS icon now appears on your home screen. Tap it to launch in full-screen mode.

### On Android (Chrome)
1. Open IMS in Chrome and sign in.
2. Tap the three-dot menu (top right) and select **Add to Home screen**.
3. Confirm the name and tap **Add**.
4. IMS installs as a standalone app on your home screen and app drawer.

Once installed as a PWA, IMS caches core assets locally, enabling faster load times and basic offline access.

## Touch-Optimised Navigation

- Use the **hamburger menu** (top left) to open the main module navigation.
- Swipe left on list rows to reveal quick-action buttons (edit, delete, archive).
- Long-press a card to enter multi-select mode for bulk actions.
- Pinch-to-zoom is enabled on document viewer pages.
- Form fields use native mobile keyboards (numeric pad for numbers, date picker for dates).

## Landscape vs Portrait Mode

- **Portrait** mode is recommended for navigating lists, reading reports, and completing forms.
- **Landscape** mode is better for viewing dashboards, Gantt charts, and data tables with many columns.
- Dashboards automatically reflow widgets when the orientation changes.
- The main navigation collapses to a bottom tab bar in portrait on small phones and moves to a side panel in landscape on tablets.

## Tips for a Good Mobile Experience

- Bookmark the IMS login page in your browser for quick access before setting up the PWA.
- Increase text size in your browser settings if reading on a small screen.
- If a table is difficult to read, tap the column headers to sort and reduce the visible columns using the column chooser (gear icon).
- Use the IMS search bar (magnifying glass, top right) to find any record without navigating through menus.
`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['mobile', 'getting-started', 'browser', 'responsive'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-MOB-002',
    title: 'Field Service Mobile Workflow Guide',
    content: `## Overview

The IMS Field Service mobile app is available for iOS and Android and is purpose-built for engineers working in the field, including areas with intermittent or no connectivity. It extends the full IMS Field Service module with a lightweight, touch-first interface designed for use while wearing gloves or working in challenging environments.

## Key Features

- **View assigned jobs**: See all jobs assigned to you, filtered by date, priority, and site.
- **Equipment history**: Access full service and fault history for any asset at the job site.
- **Service manuals**: Download and read manufacturer manuals and IMS procedures directly on device.
- **Photo evidence**: Capture and attach photos from the device camera to document work completed or faults found.
- **Customer digital signature**: Capture a client or site representative signature on-screen to confirm job completion.
- **Safety observations**: Log safety concerns, near-misses, or hazard observations without leaving the job workflow.
- **Offline sync**: All data changes queue locally and sync automatically when connectivity is restored.

## Installing the App

1. Search for 'IMS Field Service' in the Apple App Store (iOS) or Google Play Store (Android).
2. Download and install the app.
3. Open the app and enter your IMS organisation URL when prompted.
4. Sign in with your standard IMS credentials.

## Step-by-Step Job Workflow

### Step 1 — Receive Job Notification
When a new job is assigned to you, a push notification appears on your device. Tap it to open the job details. Alternatively, open the app and tap **My Jobs** to see all pending assignments.

### Step 2 — Review Job Details
Read the job description, asset information, location, and any attached safety precautions. Tap **Get Directions** to open the address in your device's maps app.

### Step 3 — Travel and Arrival
Tap **Travelling** to update the job status. On arrival, tap **On Site** — this logs your arrival time automatically.

### Step 4 — Review Equipment History
Tap the **Asset** tab within the job to view the full maintenance history, previous fault codes, and any outstanding calibration alerts.

### Step 5 — Complete the Work
Follow the job checklist. For each task step:
- Mark the step complete with a tick.
- Add notes if the outcome differs from expected.
- Attach a photo using the camera icon.

### Step 6 — Capture Customer Signature
Once work is complete, hand the device to the site representative. They sign on the screen using their finger or a stylus. Their name and the timestamp are recorded automatically.

### Step 7 — Log Any Safety Observations
If you noticed a safety concern during the job, tap **Add Safety Observation** before closing. This creates a linked record in the H&S module without leaving the field app.

### Step 8 — Close the Job
Tap **Complete Job**. Enter any final notes and parts used. The job status updates to Completed and the completion report is sent to the customer and your manager automatically.

### Step 9 — Sync
If you were offline during the job, ensure you have connectivity (Wi-Fi or mobile data) and wait for the sync indicator (top right) to show a green tick. All captured data uploads to the server.
`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['mobile', 'field-service', 'offline', 'field-engineer'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-MOB-003',
    title: 'Using IMS Offline — Sync and Conflict Resolution',
    content: `## Overview

IMS supports offline operation through a local cache that stores essential data on your device before connectivity is lost. Changes you make while offline are queued and automatically uploaded when your connection is restored. This article explains how the offline system works, what is and is not available offline, and how to resolve sync conflicts.

## How Offline Mode Works

### Data Caching
When you open the IMS mobile app or PWA with connectivity, the system pre-caches:
- Your assigned jobs (Field Service)
- Saved inspection checklists and forms
- Documents you have marked as favourites or downloaded
- Equipment records associated with your assigned jobs
- Reference data: user lists, equipment categories, site lists

The cache is refreshed every time you connect to IMS while online, ensuring you start each offline session with up-to-date data.

### Queuing Changes
While offline, every change you make (completing a job step, submitting a form, adding a photo) is saved to a local queue stored on the device. The queue persists even if you close the app.

### Automatic Sync
When the app detects connectivity is restored, it automatically processes the queue in chronological order. A sync progress indicator appears in the header. Do not force-close the app during sync.

## What Is Available Offline

| Feature | Available Offline |
|---|---|
| View assigned jobs | Yes |
| View equipment history (cached assets) | Yes |
| Complete job checklists | Yes |
| Capture photos and attach to jobs | Yes |
| Read downloaded documents and procedures | Yes |
| Submit safety inspection forms (pre-loaded) | Yes |
| Log safety observations | Yes |
| View issued permits (cached) | Yes |

## What Requires Connectivity

| Feature | Requires Connection |
|---|---|
| Creating new records not linked to a cached job | Yes |
| Real-time dashboards and live KPI data | Yes |
| Searching for assets outside your cached job list | Yes |
| Sending notifications or emails | Yes |
| Approving requests | Yes |
| Downloading new documents | Yes |

## Conflict Resolution

A conflict occurs when the same record is updated both online (by a colleague or automated process) and in your local offline queue simultaneously.

### How Conflicts Are Detected
When your queue syncs, IMS compares the timestamp of each queued change against the server's current record. If the server record was updated after you last loaded it, a conflict is flagged.

### Resolving a Conflict
1. After sync completes, a **Conflicts** badge appears on the notification bell.
2. Tap **View Conflicts** to open the conflict resolution screen.
3. Each conflict shows a side-by-side diff: **Your version** (left) vs **Server version** (right).
4. For each conflicting field, tap either **Keep Mine** or **Use Server** to choose which value to save.
5. Once all fields are resolved, tap **Save Resolution**. The record updates immediately.

### Auto-Resolution Rules
Some conflicts are resolved automatically without prompting:
- If only one side changed a given field, that change wins automatically.
- Photo attachments: both versions are kept; no photos are discarded.
- Status progressions (e.g. Travelling → On Site → Complete) always advance forward; an offline status advancement is never rolled back by a server status update at the same or lower stage.

## Best Practices for Offline Work

1. **Sync before going to site**: Open the app on Wi-Fi before entering a low-connectivity area to ensure your cache is fresh.
2. **Download documents in advance**: Pre-download service manuals and procedures while on a good connection.
3. **Keep the app open**: Closing and reopening the app in a no-signal area does not lose your queue, but keeping it open allows sync to start the moment signal returns.
4. **Limit offline sessions to one device**: Avoid editing the same job from two devices simultaneously — this increases conflict likelihood.
5. **Check the sync indicator**: Never leave a site without confirming the sync indicator shows a green tick or queued items count of zero.
`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['mobile', 'offline', 'sync', 'field-service'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-MOB-004',
    title: 'Completing Safety Inspections on Mobile',
    content: `## Overview

IMS supports conducting workplace safety inspections directly from a tablet or phone. Inspectors can navigate through checklists, record outcomes, attach photographic evidence, add corrective actions, and submit the completed report — all without returning to a desktop. This article walks through the end-to-end mobile inspection workflow.

## Navigating to the Inspection Checklist

1. Open IMS and navigate to **Health & Safety** > **Inspections**.
2. Tap **Scheduled Inspections** to see upcoming inspections assigned to you, or tap **Start New Inspection** to initiate an unscheduled inspection.
3. Select the inspection template appropriate for the area (e.g. 'Warehouse Monthly Walkthrough', 'Contractor Induction Check').
4. Enter the inspection location and confirm the date and time (auto-populated with current date/time).

## Completing Checklist Items

Each checklist item presents a question or observation point with three response options:

- **Pass** (green tick) — the condition is satisfactory.
- **Fail** (red cross) — the condition is unsatisfactory; a corrective action is required.
- **N/A** (grey dash) — the item is not applicable to this inspection.

Tap the appropriate button for each item. The checklist advances automatically to the next item after selection.

### Adding Evidence Photos
For any item — particularly Fail items — tap the **Camera** icon to launch your device camera and take a photo. You can attach multiple photos per item. Existing photos from your device gallery can also be selected via the **Gallery** icon. Photos are compressed and uploaded with the report.

### Adding Observations
Tap the **Note** icon on any item to add a free-text observation. This is useful for recording context that does not fit a pass/fail answer, or for flagging items that are borderline acceptable.

## Adding Corrective Actions During the Inspection

When an item is marked Fail, a **+ Add Corrective Action** prompt appears immediately. Tap it to:
1. Enter a description of the required corrective action.
2. Assign an owner (search by name or role).
3. Set a due date.
4. Set a priority (Low, Medium, High, Critical).

Corrective actions created during the inspection are automatically linked to the inspection record and appear in the assignee's task list when the report is submitted.

## Geotagging the Inspection Location

Tap **Tag Location** at the start of the inspection (or from the inspection header at any time). IMS uses your device's GPS to record the latitude and longitude of the inspection. A map pin preview confirms the recorded location. Geotagging helps when reviewing inspections across large or multi-site facilities.

## Submitting the Completed Inspection Report

1. Once all checklist items are answered, tap **Review & Submit**.
2. Review the summary: total items, pass count, fail count, N/A count, overall score percentage.
3. Add a final inspector's note if required.
4. Tap **Submit Inspection**.
5. A confirmation screen shows the inspection reference number (e.g. 'INS-2026-0142').

## Email Confirmation

After submission, IMS sends an email confirmation to the inspector and the H&S Manager containing:
- Inspection reference number, date, location, and inspector name.
- Summary scores.
- A PDF of the full checklist with all responses, photos, and corrective actions.

## Tips for Outdoor and Low-Light Environments

- **Brightness**: Increase your device screen brightness to maximum before going outdoors.
- **Gloves**: The touchscreen works with most thin gloves; switch to a stylus for thick work gloves.
- **Battery**: Conducting a long inspection with the camera active can drain battery. Carry a portable charger or ensure the device is fully charged.
- **Wet conditions**: Use a waterproof case or sleeve; avoid touching the screen with wet fingers as this reduces accuracy.
- **Photo quality**: Ensure adequate lighting before taking evidence photos. Use the device flash if needed. Blurry or dark photos can be retaken immediately before moving to the next item.
`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['mobile', 'health-safety', 'inspection', 'forms'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-MOB-005',
    title: 'Logging Incidents and Near-Misses from the Field',
    content: `## Overview

Capturing an incident or near-miss immediately after it occurs is critical for accurate investigation. IMS provides a mobile-optimised incident reporting form that any worker can access from a phone or tablet, even without a desktop IMS account. This article explains how to use mobile incident reporting and how submitted reports route into the investigation workflow.

## Accessing Mobile Incident Reporting

**Logged-in users**: Navigate to **Health & Safety** > **Incidents** > **Report New Incident**.

**Unauthenticated workers** (if your administrator has enabled anonymous reporting): Scan the site QR code on the IMS safety poster or navigate to the direct report URL provided by your H&S team. No login is required for the simplified report form.

## Key Fields to Complete

Complete as many fields as possible immediately after the incident while details are fresh:

| Field | Guidance |
|---|---|
| **Date and Time** | Defaults to now; adjust if reporting with a delay |
| **Location** | Select from the site location list or tap 'Use GPS' to auto-fill |
| **Description** | What happened, in your own words. Include sequence of events. |
| **Persons Involved** | Names and roles of anyone injured, involved, or at risk |
| **Immediate Severity** | Select: Minor, Moderate, Major, Critical, or Catastrophic |
| **Immediate Actions Taken** | Any first aid, evacuation, or equipment shutdown already performed |

Fields marked with an asterisk (*) are mandatory. All others are optional but strongly recommended.

## Attaching Photos

Tap the **Attach Photo** button to:
- **Take a photo now**: launches the device camera. Useful for capturing the scene, damaged equipment, or hazardous conditions before they are cleared.
- **Choose from gallery**: attach a photo already taken.

Multiple photos can be attached. Each photo can be annotated with an arrow or text label using the built-in markup tool (tap the pencil icon after selecting a photo).

## Adding Witness Names

Tap **+ Add Witness** and enter the witness's name and contact details. Witnesses can be internal employees (search by name in the directory) or external persons (enter name and phone number manually). The H&S team will follow up with witnesses during the investigation.

## Submitting the Report

Tap **Submit Report**. You receive an on-screen confirmation with the incident reference number (e.g. 'INC-2026-0089'). A confirmation email is also sent to your registered address. Retain the reference number for any follow-up queries.

## Near-Miss Quick-Report Form

For rapid capture of near-misses where time is short, use the simplified **3-field quick-report form**:

1. **What happened?** (free text, up to 500 characters)
2. **Where?** (location selector or GPS)
3. **Severity potential** (if nothing had been done to prevent it — Minor, Moderate, Major)

The quick-report form is accessible from the IMS mobile home screen widget or via the shortcut button on the main H&S dashboard. It takes under one minute to complete. Full investigation details can be added later by the H&S team.

## How Mobile Reports Route to the Investigation Workflow

When a mobile incident report is submitted, IMS automatically:
1. Creates an incident record with status **Reported**.
2. Assigns a reference number.
3. Notifies the H&S Manager and the site supervisor by email and in-app notification.
4. Creates an investigation task assigned to the H&S team.
5. Sets a response deadline based on the severity level (Critical = 24 hours, Major = 48 hours, etc.).

The H&S team then reviews the report, upgrades or downgrades the severity if needed, assigns an investigator, and moves the record through the full investigation workflow. The original reporter is notified at each status change if they have an IMS account.
`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['mobile', 'incidents', 'near-miss', 'reporting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-MOB-006',
    title: 'Accessing Documents and Procedures on Mobile',
    content: `## Overview

All controlled documents stored in the IMS Document Control module are accessible from any mobile device. Workers in the field, on the factory floor, or travelling can find and read the current approved version of any procedure, work instruction, or policy without needing a printed copy.

## Finding Documents

Navigate to **Documents** from the IMS main menu. Use the search bar to find a document by:
- **Document number** (e.g. 'SOP-MNT-042')
- **Title or keywords** (e.g. 'lockout tagout', 'fork lift inspection')
- **Tag** (e.g. 'maintenance', 'welding', 'chemical')

Filter results by category (Procedure, Policy, Work Instruction, Form, Manual) and by status (Published only is the default — draft and under-review documents are hidden from standard users).

## Downloading a PDF for Offline Reading

To read a document without connectivity:
1. Open the document in the document viewer.
2. Tap the **Download** icon (downward arrow) at the top right.
3. The PDF saves to your device's local Downloads folder and is accessible via your file manager app.

Downloaded documents are available offline through your native PDF reader. Note: IMS cannot track views of locally-saved copies; online viewing is preferred for accurate read-confirmation records.

## Adding a Home Screen Shortcut to the Document Library

If you regularly access the document library in a browser (not the PWA):
1. Navigate to the Document Library in Safari or Chrome.
2. Use **Add to Home Screen** (iOS) or **Add to Home screen** (Android) to create a shortcut that takes you directly to the document search page.

## Bookmarking Frequently Accessed Documents

Within the IMS document viewer, tap the **Bookmark** icon (star/ribbon icon) on any document to add it to your personal **My Documents** list. Access your bookmarked documents quickly from **Documents** > **My Documents** without searching. Bookmarks are stored on your IMS account and available across all devices.

## Reading QR Codes on Equipment

Many facilities attach QR code labels to machinery and equipment that link directly to the associated procedure or maintenance schedule in IMS. To use:
1. Open IMS and tap the **QR Scanner** icon (found in the top navigation bar or on the Documents home page).
2. Point your device camera at the QR code on the equipment.
3. IMS opens the linked document or equipment record instantly.

This eliminates the need to search manually for the correct procedure version when working on a specific piece of equipment.

## Version Awareness

IMS always displays the **current approved version** of every document. If a document is revised while you have an older version open, a banner appears notifying you that a newer version is available, with a link to reload it. Downloaded PDFs do not auto-update — always verify you have the current version before relying on a downloaded copy for safety-critical work.

If you attempt to access a document that has been superseded or archived, IMS shows the archive notice and, where applicable, links to the replacement document.
`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['mobile', 'document-control', 'procedures', 'field-access'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-MOB-007',
    title: 'Issuing and Closing Permits to Work from Mobile',
    content: `## Overview

Authorised persons can issue, monitor, and close Permits to Work (PTW) directly from a tablet or phone at the work site. This eliminates the need to return to an office terminal and ensures the permit record is updated in real time. This article covers the mobile PTW workflow for authorising personnel.

## Prerequisites

You must hold the **PTW Authoriser** or **PTW Issuer** role in IMS to issue permits. Contact your IMS administrator if you require this role assignment.

## Accessing the PTW Module on Mobile

1. Sign in to IMS and navigate to **Permit to Work** from the main menu.
2. The PTW dashboard shows a summary of permits currently open in your area of responsibility.
3. The dashboard is optimised for tablet use in landscape orientation; on a phone, the summary cards stack vertically.

## Searching for Open Permits

Tap **All Permits** and use the filter bar to narrow results:
- **Area / Location**: filter to permits within a specific plant area, building, or zone.
- **Work Type**: Hot Work, Cold Work, Confined Space, Electrical Isolation, Working at Height, etc.
- **Status**: Applied, Under Review, Issued, Extended, Suspended, Closed.
- **Date**: permits issued today, this week, or a custom range.

Tap any permit in the list to open the full permit details.

## Reviewing Hazards and Controls

Before issuing a permit, review:
- **Work description**: what work is to be carried out and by whom.
- **Hazard identification**: all identified hazards associated with the work.
- **Controls**: the control measures that must be in place before work begins.
- **Isolations**: any energy isolations (electrical, pressure, hydraulic) to be confirmed.
- **Emergency plan**: the emergency response procedure specific to this work.

Scroll through each section using the tab navigation at the top of the permit detail screen. Tap any section to expand it for full details.

## Issuing a Permit

1. After reviewing all sections and confirming controls are in place at the work site, tap **Issue Permit**.
2. A confirmation dialogue lists the key conditions of issue. Read these carefully.
3. Tap **Sign and Issue** — a signature capture field appears. Sign with your finger or stylus.
4. Enter your IMS password as a second verification step.
5. Tap **Confirm**. The permit status updates to **Issued** immediately. The permit holder receives a push notification and email confirming the permit is live.

## Checking Permit Status During the Shift

From the PTW dashboard, tap **Active Permits** to see all currently issued permits. Each permit card shows:
- Permit reference and title
- Work location
- Permit holder name
- Issue time and expiry time
- A coloured status indicator (green = active, amber = expiring within 1 hour, red = expired)

Tap a permit to view full details, make notes, or initiate a suspension or extension.

## Closing a Permit on Work Completion

1. Confirm with the permit holder that all work is complete, all persons are clear of the work area, and all isolations are safe to reinstate.
2. Open the permit and tap **Close Permit**.
3. Complete the closure checklist:
   - All tools and equipment removed from the work area (tick/cross)
   - Area left in a safe condition (tick/cross)
   - All isolations reinstated (tick/cross)
   - Permit holder signature obtained (signature field)
4. Add any closure notes (e.g. work partially completed, follow-up required).
5. Tap **Confirm Closure**. The permit status changes to **Closed** and the closure time is recorded.

## Offline Permit Reference

If you issued a permit while connected and then lose connectivity mid-shift, the issued permit remains accessible locally on your device. You can view the full permit details — including all hazards, controls, and conditions — without connectivity. Permit status changes made while offline (e.g. closure) are queued and upload automatically when connectivity returns. If work must stop urgently while offline, follow your site's manual PTW suspension procedure and record the details in IMS as soon as connectivity is available.
`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['mobile', 'permit-to-work', 'safety', 'field'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-MOB-008',
    title: 'Mobile Dashboard and KPI Monitoring',
    content: `## Overview

IMS dashboards are fully responsive and provide meaningful data views on any screen size. Whether you are reviewing operational performance on a factory floor tablet or checking key metrics on your phone between meetings, IMS adapts the dashboard layout automatically to make the most of the available space.

## Responsive Dashboard Layout

### Portrait Mode (Phone)
In portrait orientation on a phone, dashboard widgets stack vertically in a single column. Widgets are reordered by priority — the most critical KPI summary cards appear at the top, followed by charts, then data tables. Scroll down to see all widgets.

### Landscape Mode (Tablet or Phone)
In landscape orientation, the dashboard uses a two- or three-column grid layout, similar to the desktop experience. Charts display at full width, and data tables show more columns. Tablet landscape is the recommended mode for serious dashboard review sessions in the field.

### Pinch and Zoom on Charts
Most dashboard charts support pinch-to-zoom for exploring detail in a specific time range. Double-tap a chart to reset it to the default view.

## The IMS Executive Mobile View

The **Executive View** is a simplified, single-screen summary designed for senior leaders who need a quick health check of the organisation's key metrics without navigating multiple dashboards.

To access it: tap your profile avatar (top right) > **Switch View** > **Executive View**.

The Executive View displays:
- Overall compliance score (% of compliance obligations met)
- Open critical incidents count (with trend arrow)
- Top 5 overdue actions
- Risk register summary (number of risks by rating: High / Medium / Low)
- Environmental performance indicator (vs. monthly target)
- A last-updated timestamp

Tap any metric to drill into the full module for details.

## Dashboard Email Digest

IMS can send a weekly summary email with a snapshot of your key KPIs delivered to your inbox every Monday morning. This gives you an at-a-glance status review before opening IMS.

To configure the digest:
1. Go to **Settings** > **Notifications** > **Email Digest**.
2. Enable the **Weekly Dashboard Digest** toggle.
3. Select which modules to include in the digest (e.g. H&S, Environment, Quality, Risk).
4. Choose the delivery day and time.
5. Save. The first digest will arrive on the next scheduled delivery.

Each digest email includes:
- KPI summary table with RAG (Red / Amber / Green) status indicators.
- Count of overdue actions across selected modules.
- Links to open the relevant module in IMS for drill-down.

## Configuring the Mobile-Optimised Widget View

Each dashboard supports a **Mobile Widgets** configuration that controls which widgets appear in the mobile-optimised layout. To configure:
1. Open the dashboard on a desktop or tablet.
2. Click the **Edit Dashboard** button (pencil icon, top right).
3. Click the **Mobile Layout** tab.
4. Drag and reorder widgets in the mobile layout list. Widgets at the top of the list appear first on mobile.
5. Toggle off any widgets that are not useful on small screens (e.g. very wide tables, complex heat maps).
6. Click **Save Layout**.

Changes to the mobile layout apply immediately for all users who have access to that dashboard on mobile.
`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['mobile', 'dashboard', 'kpi', 'executive'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-MOB-009',
    title: 'Managing Tasks and Actions on Mobile',
    content: `## Overview

The IMS **My Tasks** view is a central inbox for all actions, approvals, and follow-up items assigned to you across every IMS module. On mobile, My Tasks is the most efficient way to stay on top of your workload without navigating between modules. This article explains how to use My Tasks on a phone or tablet and how to manage approval workflows from mobile.

## Accessing My Tasks

Tap the **Tasks** icon in the bottom navigation bar (phone) or the left sidebar (tablet). My Tasks loads immediately, showing all items assigned to you across all modules.

## Reviewing Overdue Items

At the top of My Tasks, a red banner shows the count of overdue items. Tap the banner to filter the list to overdue items only. Overdue items are also sorted to the top of the default unfiltered view, highlighted in red.

Each task card shows:
- Task title and linked module (e.g. 'Review CAPA CAP-2026-088' — Quality)
- Due date (shown in red if overdue)
- Priority badge (Critical, High, Medium, Low)
- Assigned by (name of the person or system that created the task)

## Completing an Action

1. Tap the task card to open the full action detail.
2. Read the action description and any linked records (incident, risk, audit finding, etc.).
3. Tap **Mark Complete** when the action is done.
4. A completion dialogue asks for:
   - **Completion notes**: describe what was done.
   - **Completion evidence**: tap **Upload Evidence** to attach a photo from your camera or a file from device storage.
5. Tap **Confirm Completion**. The task status changes to Completed and the assigning person is notified.

## Adding Comments

On any open task, tap **Add Comment** to leave a note visible to all stakeholders of the task. Use comments to request clarification, provide a progress update, or flag a blocker. Comments are timestamped and attributed to your user account. The task owner receives an in-app notification for each new comment.

## Uploading Completion Evidence from Device Camera

When completing a task, tap the **Camera** button in the evidence upload dialogue to take a photo directly. The photo is compressed and attached to the task record. For documents or certificates, tap **File** instead to browse device storage and attach a PDF or image from your files app.

## Reassigning a Task

If a task is incorrectly assigned or you are the wrong person to complete it:
1. Open the task and tap **Reassign**.
2. Search for the correct person by name or role.
3. Add a note explaining the reassignment.
4. Tap **Confirm Reassign**. The new assignee is notified immediately.

## Notification Centre on Mobile

IMS sends in-app notifications for:
- New task assignments
- Comments added to your tasks
- Approaching due dates (24-hour and 1-hour reminders)
- Approval requests requiring your decision
- Status changes on items you are watching

Tap the **Bell** icon (top right) to open the notification centre. Swipe a notification left to dismiss it. Tap **Mark All Read** to clear all unread notifications at once.

## Managing Approval Workflows from Mobile

Many IMS workflows require manager or specialist approval before progressing — for example, approving a CAPA plan, signing off a supplier evaluation, or authorising a change request.

When an approval is required from you:
1. A notification appears in the notification centre and (if configured) an email is sent.
2. Tap the notification to open the approval request directly.
3. Review the request details, linked records, and any supporting documents attached.
4. Tap **Approve** or **Reject**.
   - If rejecting, enter a reason — this is mandatory and is sent to the requester.
   - If approving, an optional comment field is available for any conditions of approval.
5. Tap **Confirm**. The workflow advances to the next stage automatically.

Approvals can be completed entirely from mobile in under a minute, preventing workflow bottlenecks when approvers are away from their desks.
`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['mobile', 'tasks', 'actions', 'productivity'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-MOB-010',
    title: 'Mobile Security Best Practices for IMS Users',
    content: `## Overview

IMS contains sensitive operational, safety, and compliance data. Accessing IMS from a mobile device introduces additional security considerations that every user must be aware of. This article provides security guidance for both Bring Your Own Device (BYOD) and company-issued mobile devices.

## Network Security

### Avoid Public Wi-Fi Without a VPN
Public Wi-Fi networks in airports, hotels, cafes, and conference centres are unencrypted and may be monitored by malicious actors. Never access IMS on a public Wi-Fi network without first connecting to a VPN (Virtual Private Network). Use your organisation's approved VPN client — do not use free or personal VPN services.

### Prefer Mobile Data Over Unknown Wi-Fi
If no VPN is available and you need urgent access, use your phone's mobile data (4G/5G) rather than an unknown Wi-Fi network. Mobile data is encrypted at the network level.

### Trust Only Known Wi-Fi Networks
When using Wi-Fi, ensure you are connected to a network you trust — your office Wi-Fi, your home network, or a known site network. If the network does not require a password or uses an unusual name, do not connect.

## Device Security

### Lock Your Device
Set a PIN, passcode, or biometric lock (Face ID, fingerprint) on your device. This prevents unauthorised access if your device is lost or left unattended. Require authentication immediately on screen lock — do not use a 30-second grace period.

### Keep Your OS and Browser Updated
Apply operating system and browser updates promptly. Security patches in updates protect against known vulnerabilities that attackers exploit to access data on mobile devices.

### Do Not Jailbreak or Root Your Device
Jailbroken (iOS) or rooted (Android) devices have weakened security models. IMS may detect and block access from such devices depending on your organisation's mobile device policy.

## Session and Account Security

### Do Not Use 'Remember Me' on Shared Devices
If you access IMS on a shared device — a shared tablet in a warehouse, a device lent by a colleague — never tick 'Remember Me' or allow the browser to save your password. Always sign out manually when you finish.

### Log Out After Use on Borrowed Devices
Any time you access IMS on a device that is not yours, sign out when you are done: tap your profile avatar > **Sign Out**. Clearing the browser history and cookies on the shared device after use is also good practice.

### Use a Unique Password for IMS
Do not reuse a password from another service for your IMS account. Use a password manager to generate and store a strong, unique password. Enable multi-factor authentication (MFA) on your IMS account if your organisation has configured it.

## Lost or Stolen Device

### Report Immediately
If you lose a device — or if it is stolen — that has IMS access (saved credentials, active session, or installed PWA), report it to your IMS administrator immediately. Do not wait to see if the device turns up.

### Session Revocation by Administrators
IMS administrators can remotely revoke all active sessions for any user account. This immediately invalidates all access tokens, logging the user out of IMS on every device. To revoke sessions:
1. An administrator navigates to **Admin** > **Users** > select the affected user.
2. In the user profile, click **Sessions** > **Revoke All Sessions**.
3. Confirm the action. All active tokens are invalidated immediately.

After revocation, the user must sign in again with their credentials on any device where they wish to resume access. If account compromise is suspected, the administrator should also reset the user's password immediately.

## BYOD Policy

If your organisation has a Bring Your Own Device policy, ensure your personal device complies with the minimum requirements set by your IT team. Typical requirements include:
- Minimum OS version (e.g. iOS 16 or Android 12)
- Device lock enabled
- Encryption at rest enabled (enabled by default on modern iOS and Android)
- IMS Mobile Device Management (MDM) profile installed if required by your organisation

Contact your IMS administrator or IT department if you are unsure whether your personal device meets the policy requirements before using it to access IMS.
`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['mobile', 'security', 'best-practices', 'byod'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
];
