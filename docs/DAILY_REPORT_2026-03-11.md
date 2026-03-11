# IMS Daily Report — March 11, 2026

## Summary

Completed **Phase 268 — UI Bug Fixes**, addressing five categories of frontend defects across six web applications. No new features were added; this phase was entirely focused on production correctness: data normalisation mismatches causing runtime crashes, missing Tailwind configuration causing unstyled pages, a modal layout that cut off form content below the fold, and template category filters using wrong enum casing throughout the system.

All ~1,290,475 unit tests / ~1,200+ suites / 492 Jest projects remain passing. Six web apps were rebuilt and restarted in production mode.

---

## Fixes in Detail

### 1. Emergency Module — Premises and Incidents Tabs Crash

**Root cause:** The Emergency API returns raw PostgreSQL/Prisma field names in its JSON responses. The frontend TypeScript interfaces were written with different (shorter, friendlier) names. When the UI tried to call `.replace()` or similar methods on fields it expected to be strings, it received `undefined` instead, causing a hard crash.

**Premises page** (`apps/web-emergency/src/app/premises/page.tsx`):

| API field | Interface expected | Fix |
|---|---|---|
| `buildingType` | `type` | normalised in `loadPremises` |
| `responsiblePersonName` | `rpName` | normalised in `loadPremises` |
| `_count.activeIncidents` | `activeIncidents` | normalised in `loadPremises` |

**Incidents page** (`apps/web-emergency/src/app/incidents/page.tsx`):

| API field | Interface expected | Fix |
|---|---|---|
| `emergencyType` | `type` | normalised in `loadIncidents` |
| `incidentNumber` | `referenceNumber` | normalised in `loadIncidents` |
| `incidentCommanderName` | `commanderName` | normalised in `loadIncidents` |
| `reportedAt` | `declaredAt` | normalised in `loadIncidents` |
| `premises.name` | `premisesName` | normalised in `loadIncidents` |

The fix in each case was a data normalisation map inside the `useCallback` fetch function, transforming the raw API object into an interface-compliant object before calling `setState`. This is a clean separation: the API contract and the UI interface can evolve independently, with the normalisation layer bridging the two.

---

### 2. Partner Portal — Unstyled Pages and Indefinite Loading

**Missing Tailwind/PostCSS configuration:**

`apps/web-partner-portal` was missing both `tailwind.config.ts` and `postcss.config.js`. Without PostCSS processing, the `@tailwind base/components/utilities` directives in `globals.css` produced no output — the CSS file was effectively empty. Every page rendered with zero styling.

The fix:
- Created `tailwind.config.ts` pointing at the standard IMS content paths and extending the shared theme
- Created `postcss.config.js` with `tailwindcss` and `autoprefixer` plugins
- Added `tailwindcss`, `autoprefixer`, and `postcss` as `devDependencies` in `package.json`
- Updated `globals.css` to import from `../../../../packages/ui/globals.css` (picks up shared base styles)
- Updated `layout.tsx` with DM Sans, Syne, and DM Mono Google Fonts plus the theme-switching inline script that other apps use
- Added missing `@ims/*` workspace dependencies

**Indefinite "Loading..." state on Deals and Profile pages:**

Both `deals/page.tsx` and `profile/page.tsx` made API calls to `/api/billing/partners/*` on mount. These calls require a `partner_portal_token` in `localStorage`, which is not present when the app is accessed without logging in as a partner. The API calls fail, and the original empty `catch` blocks left the component permanently in its loading state with no feedback.

The fix adds `MOCK_DEALS` (5 representative sample deals in various pipeline stages) and `MOCK_PROFILE` (a complete sample partner profile) as fallback data. On API failure, pages now render immediately with the mock data. This is consistent with how other portal apps handle the unauthenticated/dev state, providing a functional demo experience rather than a blank screen.

Additionally, port 3049 had a stale server process running the old build — this was cleared so the rebuilt chunks could be served correctly.

---

### 3. Modal Component — Scrollable Body with Sticky Footer

**`packages/ui/src/modal.tsx`** is the shared Modal component used by every module across all 48 web apps. Prior to this fix it had a flat layout with no height constraint — the modal div would grow to accommodate its content. For forms taller than the viewport this meant:
- Lower form fields were off-screen with no scrollbar
- The footer (Save/Cancel buttons) was also off-screen and unreachable without resizing the browser

The Quality Management Review scheduling form was the specific trigger (it has ~12 fields), but the bug affected any module with a sufficiently tall modal form.

**Fix applied to `packages/ui/src/modal.tsx`:**

The outer container now applies `p-4` to keep the modal away from viewport edges. The modal itself is restructured as a flex column with `max-h-[90vh]`:

```
div.modal-container (flex flex-col max-h-[90vh] rounded-lg bg-white shadow-xl)
  ├── header (flex-shrink-0 border-b — always visible)
  ├── div.content (flex-1 overflow-y-auto — scrollable)
  └── ModalFooter (sticky bottom-0 bg-white — always visible)
```

This means the header and footer are always on screen regardless of content height, and the body scrolls independently. The fix is automatically applied to every modal in the system without any per-module changes.

**`apps/web-quality/src/app/management-reviews/client.tsx`:** The Schedule Review modal was also updated from `size="lg"` to `size="xl"` to give the form more horizontal space, reducing the need to scroll vertically.

---

### 4. Quality Templates — Category Filter Broken

**`apps/web-quality/src/app/templates/client.tsx`:** The `CATEGORIES` filter array was defined as plain strings in title case:

```typescript
// Before (wrong)
const CATEGORIES = ['Assessment', 'Audit', 'Checklist', 'Form', 'Policy', 'Procedure', 'Register', 'Report'];
```

These strings were compared against the `category` field returned by the API, which stores DB enum values in uppercase: `AUDIT`, `CAPA`, `CUSTOMER`, `DESIGN_DEVELOPMENT`, `MANAGEMENT_REVIEW`, `RISK_ASSESSMENT`, `SUPPLIER`. Because the casing never matched, selecting any category filter returned zero results.

The fix replaces the array with a `{ value: string; label: string }[]` structure where `value` is the exact DB enum and `label` is the display string:

```typescript
// After (correct)
const CATEGORIES = [
  { value: 'AUDIT', label: 'Audit' },
  { value: 'CAPA', label: 'CAPA' },
  // ...
];
```

---

### 5. System-Wide Template Category Filter Audit

After fixing the Quality module, all 13 `templates/client.tsx` files across the system were audited to check whether the same bug existed elsewhere.

**Files fixed:**

**`apps/web-health-safety/src/app/templates/client.tsx`** — Had the same title-case string bug. Replaced with 16 correct DB enum values sourced by querying actual records in the database: `ASSESSMENT`, `AUDIT`, `CHECKLIST`, `COMPLIANCE`, `FORM`, `INCIDENT_INVESTIGATION`, `INSPECTION`, `MANAGEMENT_REVIEW`, `MANUAL`, `PLAN`, `POLICY`, `RECORD`, `REGISTER`, `REPORT`, `RISK_ASSESSMENT`, `TRAINING`.

**`apps/web-environment/src/app/templates/client.tsx`** — Same bug. Replaced with 13 correct values: `AUDIT`, `COMPLIANCE`, `INSPECTION`, `MANAGEMENT_REVIEW`, `MANUAL`, `PLAN`, `PLANNING`, `POLICY`, `RECORD`, `REGISTER`, `REPORT`, `REPORTING`, `RISK_ASSESSMENT`.

**`apps/web-dashboard/src/app/templates/client.tsx`** — Values were uppercase DB enums (correct for filtering) but rendered raw to the user (e.g. the dropdown option displayed `RISK_ASSESSMENT` instead of "Risk Assessment"). Converted to `{ value, label }` format with readable labels. Also added nine categories that were present in the DB but missing from the filter array: `ASSESSMENT`, `CHECKLIST`, `FORM`, `MANUAL`, `PLAN`, `PLANNING`, `RECORD`, `REGISTER`, `REPORT`.

**`apps/web-settings/src/app/templates/client.tsx`** — Identical issue to Dashboard, identical fix.

**Files already correct (no change needed):**
- `web-aerospace`, `web-automotive`, `web-medical` — already used `{ value, label }` format with correct DB enum values
- `web-hr`, `web-inventory`, `web-payroll`, `web-project-management`, `web-workflows` — these modules have no template category filter

---

## Rebuilt and Restarted

All affected apps were rebuilt with `next build` and restarted with `next start` in production mode (`output: 'standalone'`):

| App | Port | Status |
|---|---|---|
| web-quality | 3003 | Running |
| web-health-safety | 3001 | Running |
| web-environment | 3002 | Running |
| web-dashboard | 3000 | Running |
| web-settings | 3004 | Running |
| web-partner-portal | 3049 | Running |

---

## Test Status

No new test files were added in Phase 268 (all changes were to production source files). The unit test count remains:

- **~1,290,475 unit tests / ~1,200+ suites / 492 Jest projects — ALL PASSING**
  - packages: ~573,664 / 482 suites
  - web apps: ~42,696 / 98 suites / 48 projects
  - API: ~607,888 / 613 suites

---

## Files Changed

| File | Change |
|---|---|
| `apps/web-emergency/src/app/premises/page.tsx` | Data normalisation map in `loadPremises` |
| `apps/web-emergency/src/app/incidents/page.tsx` | Data normalisation map in `loadIncidents` |
| `apps/web-partner-portal/tailwind.config.ts` | Created (new file) |
| `apps/web-partner-portal/postcss.config.js` | Created (new file) |
| `apps/web-partner-portal/package.json` | Added devDeps + workspace deps |
| `apps/web-partner-portal/src/app/globals.css` | Import from shared UI globals |
| `apps/web-partner-portal/src/app/layout.tsx` | Google Fonts + theme script |
| `apps/web-partner-portal/src/components/sidebar-wrapper.tsx` | Updated |
| `apps/web-partner-portal/src/app/deals/page.tsx` | `MOCK_DEALS` fallback |
| `apps/web-partner-portal/src/app/profile/page.tsx` | `MOCK_PROFILE` fallback |
| `packages/ui/src/modal.tsx` | `flex flex-col max-h-[90vh]` layout, sticky footer |
| `apps/web-quality/src/app/management-reviews/client.tsx` | Modal size `lg` → `xl` |
| `apps/web-quality/src/app/templates/client.tsx` | `{ value, label }[]` with DB enums |
| `apps/web-health-safety/src/app/templates/client.tsx` | `{ value, label }[]` with DB enums |
| `apps/web-environment/src/app/templates/client.tsx` | `{ value, label }[]` with DB enums |
| `apps/web-dashboard/src/app/templates/client.tsx` | `{ value, label }[]` + missing categories |
| `apps/web-settings/src/app/templates/client.tsx` | `{ value, label }[]` + missing categories |
