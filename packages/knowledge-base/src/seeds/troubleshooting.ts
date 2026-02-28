import type { KBArticle } from '../types';

export const troubleshootingArticles: KBArticle[] = [
  {
    id: 'KB-TS-001',
    title: 'Cannot Log In to IMS',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['auth', 'login', 'access', 'troubleshooting', 'password'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Cannot Log In to IMS

## Symptom

The login page shows an error message such as "Invalid email or password", the page refreshes without logging in, or the account appears to be locked.

## Possible Causes

- Incorrect email address or password entered
- Account locked after 5 consecutive failed login attempts
- Account disabled by an administrator
- SSO (Single Sign-On) is enabled for your organisation and direct login is not permitted
- Browser cache or cookies are causing a stale session conflict
- Caps Lock is on, causing password to be entered incorrectly

## Solutions

1. **Check credentials carefully**: Verify your email address is spelled correctly. Confirm Caps Lock is off before entering your password.
2. **Reset your password**: Click "Forgot Password?" on the login page and follow the email instructions to set a new password.
3. **Clear browser cache and cookies**: In Chrome, press Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac) and clear cached images and cookies, then retry.
4. **Try SSO login**: If your organisation uses SSO (e.g., Microsoft Entra, Okta, Google Workspace), click the "Sign in with SSO" button instead of entering credentials manually. Direct login may be disabled for your account.
5. **Wait for automatic account unlock**: After 5 failed attempts, the account locks for 15 minutes. Wait and retry.
6. **Contact your IMS administrator**: The admin can unlock your account immediately via Admin Console → Users → find your account → Unlock. They can also verify if the account is disabled.
7. **Try a private/incognito browser window**: This rules out browser extension or session conflicts.

## Prevention

- Use a password manager to store and auto-fill IMS credentials accurately, eliminating typing errors.
- Enable Multi-Factor Authentication (MFA) on your account for added security, which also reduces the risk of lockout from credential stuffing attacks.
`,
  },
  {
    id: 'KB-TS-002',
    title: 'SSO Login Not Working',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['auth', 'login', 'access', 'sso', 'saml', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# SSO Login Not Working

## Symptom

Clicking the SSO / "Sign in with your organisation" button redirects back to the IMS login page with an error, or the user sees a "No account found for this identity" or "Authentication failed" message after completing authentication with the identity provider.

## Possible Causes

- The user does not have an IMS account and SSO auto-provisioning is disabled
- The email address claim from the identity provider does not match the email registered in IMS
- The identity provider (IdP) certificate has expired, causing SAML assertion verification to fail
- The SSO configuration has an incorrect Entity ID, ACS URL, or attribute mapping
- The user's IMS account is disabled even though their IdP account is active

## Solutions

1. **Verify the user has an IMS account**: In Admin Console → Users, search for the user's email address. If not found, either create the account manually or enable SSO auto-provisioning in Settings → Security → SSO → Auto-Provision Users.
2. **Test the SSO configuration**: Admin Console → Settings → Security → SSO → click "Test SSO". Review the SAML response in the test output to confirm the email attribute is being passed correctly.
3. **Check email attribute mapping**: The SAML attribute that maps to the IMS email field must match exactly. Common values are 'email', 'mail', or 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'. Update in SSO settings if incorrect.
4. **Check IdP certificate expiry**: In Admin Console → Settings → Security → SSO → view the IdP certificate expiry date. If expired, download the new certificate from your identity provider and update it.
5. **Verify Entity ID and ACS URL**: Confirm the Service Provider Entity ID and Assertion Consumer Service URL in IMS match exactly what is configured in your IdP application.
6. **Check account status**: Even if SSO succeeds, a disabled IMS account will be rejected. Reactivate via Admin Console → Users if needed.

## Prevention

- Set a calendar reminder to renew IdP certificates before expiry.
- Periodically run the "Test SSO" function to catch configuration drift before it affects users.
`,
  },
  {
    id: 'KB-TS-003',
    title: 'Locked Out of Admin Account',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['auth', 'login', 'access', 'admin', 'lockout', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Locked Out of Admin Account

## Symptom

The only system administrator account is locked or disabled, preventing access to the Admin Console. Other users cannot perform administrative tasks, and the admin cannot unlock themselves.

## Possible Causes

- Too many consecutive failed login attempts triggered the account lockout policy (default: 5 attempts in 15 minutes)
- An administrator with higher privileges disabled the account
- A scheduled security policy automatically disabled accounts with no recent activity

## Solutions

1. **Wait for automatic unlock**: Account lockouts due to failed login attempts automatically resolve after 15 minutes. Try logging in again after waiting.
2. **Use a secondary admin account**: If another admin account exists (strongly recommended), log in with that account and navigate to Admin Console → Users → find the locked account → click "Unlock Account".
3. **Contact IMS Support**: If no secondary admin account is available, contact IMS support via the support portal at support.ims.local or via email. You will be required to verify your organisation identity (e.g., organisation ID, billing contact details, or a security challenge established during onboarding).
4. **Emergency unlock procedure**: IMS support can unlock the account via a secure backend process after identity verification. This process typically takes 1 to 4 business hours.
5. **Check for other admin-level users**: Navigate to the login page and attempt to log in with any other account that may have been granted admin rights — a user may have been promoted to admin without your knowledge.

## Prevention

- Always maintain at least two System Administrator accounts in every IMS organisation. This is a critical resilience measure.
- Regularly audit administrator accounts: Admin Console → Users → filter by role "System Administrator".
- Document emergency admin recovery procedures in your organisation's IT continuity plan.
`,
  },
  {
    id: 'KB-TS-004',
    title: 'User Cannot Access a Specific Module',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['auth', 'access', 'permissions', 'roles', 'modules', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# User Cannot Access a Specific Module

## Symptom

A user reports that a module appears greyed out in the navigation, is missing entirely from their sidebar, or they receive an "Access Denied" or "403 Forbidden" error when trying to navigate to a module URL directly.

## Possible Causes

- The module is not enabled for the organisation (licence or configuration)
- The user's assigned role does not include access permissions for that module
- The user is assigned to a site that does not have the module active
- The module requires a specific licence tier that the organisation has not subscribed to
- The user's role has the module enabled but only for read access, and they are trying to perform a write action

## Solutions

1. **Check module is enabled for the organisation**: Admin Console → Modules → verify the module shows a green "Enabled" status. If disabled, click "Enable Module" (requires appropriate licence).
2. **Check the user's role permissions**: Admin Console → Roles → find the user's assigned role → click Edit → navigate to the Permissions tab → confirm the module is toggled on with the correct access level (None, Read, Write, Admin).
3. **Check the user's role assignment**: Admin Console → Users → find the user → Roles tab → confirm the correct role is assigned. Assign a role with the required permissions if needed.
4. **Check site assignment**: If your organisation uses multi-site configuration, verify the user is assigned to the correct site and that the module is active for that site.
5. **Check licence tier**: Admin Console → Organisation → Subscription → confirm the module is included in the current plan. Contact IMS sales if an upgrade is needed.
6. **Test with a fresh browser session**: Ask the user to log out, clear cookies, and log back in to ensure their session reflects the latest role assignment.

## Prevention

- When creating new user accounts, use role templates appropriate to the user's job function to ensure correct module access from day one.
- Review and audit role assignments quarterly via Admin Console → Reports → User Access Review.
`,
  },
  {
    id: 'KB-TS-005',
    title: 'MFA/2FA Not Accepting Verification Code',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['auth', 'login', 'access', 'mfa', '2fa', 'authenticator', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# MFA/2FA Not Accepting Verification Code

## Symptom

After entering the username and password successfully, the MFA verification step rejects the 6-digit code from the authenticator app with an "Invalid code" or "Code expired" error, even when the code was entered immediately after it appeared in the app.

## Possible Causes

- The device clock is not synchronised — TOTP codes are strictly time-based and a clock drift of more than 30 seconds will cause code rejection
- The wrong authenticator entry is being used (another service's code entered instead of IMS)
- The authenticator app entry was deleted and re-created without re-scanning the IMS QR code, resulting in a different secret key
- The authenticator app itself has a bug and is generating codes from an incorrect time source

## Solutions

1. **Synchronise your device clock**: On Android: Settings → Date & Time → enable "Automatic date and time". On iPhone: Settings → General → Date & Time → enable "Set Automatically". On Windows: Settings → Time & Language → Date & Time → "Sync now". Retry the code immediately after syncing.
2. **Confirm the correct authenticator entry**: In your authenticator app, look for an entry labelled "IMS" or your organisation name. Do not use a code from another service accidentally.
3. **Use a backup code**: If you saved backup codes during initial 2FA setup, enter one of those codes on the MFA screen to bypass the authenticator and log in.
4. **Request 2FA reset from admin**: Admin Console → Users → find the user → Security tab → Reset MFA. The user will be prompted to re-enrol MFA on next login.
5. **Try Google Authenticator or Microsoft Authenticator**: If using a third-party authenticator app, try switching to one of the main apps which have better time-sync reliability.

## Prevention

- Always save the backup codes provided during MFA setup and store them securely (e.g., in a password manager).
- Keep device time set to automatic synchronisation at all times.
`,
  },
  {
    id: 'KB-TS-006',
    title: 'API Authentication Failing (Bearer Token)',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['auth', 'api', 'access', 'bearer-token', 'troubleshooting', 'integration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# API Authentication Failing (Bearer Token)

## Symptom

API calls to IMS endpoints return a '401 Unauthorized' response, even when an Authorization header is included. The response body typically contains '{"error":"Unauthorized"}' or '{"message":"Invalid or expired token"}'.

## Possible Causes

- The access token has expired (access tokens expire after 1 hour by default)
- The Authorization header is formatted incorrectly — it must be 'Bearer [space][token]' with exactly one space
- The token was generated in a different environment (e.g., development token used against the production API)
- The user account associated with the token has been disabled or deleted since the token was issued
- An API key (not a user token) is required for this endpoint, and a user JWT was provided instead

## Solutions

1. **Re-authenticate to obtain a fresh token**: POST to '/api/auth/login' with '{"email":"...","password":"..."}'. The response will include a new 'accessToken' in the data field. Access tokens are valid for 1 hour.
2. **Verify header format exactly**: The header must be 'Authorization: Bearer eyJ...' with one space between "Bearer" and the token string. No quotes, no extra characters.
3. **Confirm the correct environment**: Check the base URL your integration is targeting. Tokens from 'dev.ims.example.com' will not authenticate against 'app.ims.example.com'.
4. **Implement token refresh**: Use the refresh token (returned alongside the access token) to obtain a new access token before expiry. POST to '/api/auth/refresh' with the refresh token.
5. **Check the user account status**: Admin Console → Users → verify the account associated with the token is still active and not disabled.
6. **Check if API keys are required**: Some endpoints require an API key rather than a user JWT. Admin Console → Settings → API Keys → create an API key and use it in the 'X-API-Key' header.

## Prevention

- Implement automatic token refresh in your integration to handle expiry gracefully without disruption.
- Rotate API keys every 90 days as a security best practice.
`,
  },
  {
    id: 'KB-TS-007',
    title: 'Cannot Assign Role to User',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['auth', 'access', 'roles', 'permissions', 'admin', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Cannot Assign Role to User

## Symptom

When attempting to assign a role to a user in Admin Console → Users, the role dropdown is empty, the desired role does not appear in the list, or saving the role assignment produces an error such as "You cannot assign a role with permissions higher than your own".

## Possible Causes

- The administrator attempting the assignment does not have sufficient permissions to assign the target role (you cannot assign a role with higher privileges than your own)
- The custom role has not yet been created — it must exist before it can be assigned
- The user already has the maximum number of roles configured for your organisation
- The role is restricted to a specific module or site that the administrator does not manage
- A browser state issue is causing the role list to not load correctly

## Solutions

1. **Check your own permission level**: Only a System Administrator can assign System Administrator or Global Admin roles. If you are an Organisation Admin, you can only assign roles at or below your own level. Ask a higher-level admin to make the assignment.
2. **Create the role first**: Navigate to Admin Console → Roles → New Role. Define the name, permissions, and module access. Save the role, then return to the user and assign it.
3. **Check max roles per user**: Admin Console → Settings → Users & Roles → confirm if a maximum roles-per-user limit is configured. Remove an existing role before adding the new one if at the limit.
4. **Refresh the page**: Navigate away from the user profile and back to reload the role dropdown in case of a stale browser state.
5. **Use the API**: If the UI is not cooperating, use the IMS API to assign the role: PUT '/api/users/{userId}/roles' with the role ID in the request body.

## Prevention

- Plan your role hierarchy before deployment. Document which administrator levels are responsible for assigning which roles.
- Use role templates for common job functions to reduce the frequency of individual role assignments.
`,
  },
  {
    id: 'KB-TS-008',
    title: 'Session Times Out Too Quickly',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['auth', 'login', 'access', 'session', 'timeout', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Session Times Out Too Quickly

## Symptom

Users are being logged out of IMS after a short period of inactivity — sometimes as little as 5 or 10 minutes — even when they are actively working. This disrupts workflows and requires frequent re-authentication.

## Possible Causes

- The organisation session idle timeout is configured to a very short value
- Browser settings are configured to clear cookies on close or after a period, which destroys the session token
- A browser extension (privacy or security extension) is automatically clearing cookies or local storage
- The user is working in a private/incognito browser window, which does not persist sessions
- The session timeout is compliant with a security policy for sensitive environments (e.g., healthcare, finance)

## Solutions

1. **Adjust session timeout for the organisation**: Admin Console → Settings → Security → Session Management → Idle Session Timeout. Increase the value (maximum allowed is 8 hours). Changes apply to all users in the organisation.
2. **Allow user-level adjustment**: If users need different timeouts, enable "Allow users to set their own session timeout" in the same Settings section. Individual users can then adjust under My Profile → Security → Session Timeout (up to the organisation maximum).
3. **Check browser cookie settings**: In Chrome, go to Settings → Privacy and Security → Cookies → confirm cookies are not set to clear on close. Disable any extension that may be clearing local storage periodically.
4. **Avoid private/incognito mode**: Sessions in private mode do not persist local storage between navigation events in some browsers, causing premature session loss.
5. **Review security requirements**: For regulated industries (finance, healthcare, government), short session timeouts may be mandated. Confirm with your compliance team before extending timeouts.

## Prevention

- Set the organisation session timeout to a value that balances security and usability for your industry context.
- Advise users to save work frequently and use the "Remember this device for 30 days" option when available.
`,
  },
  {
    id: 'KB-TS-009',
    title: 'Spreadsheet Import Failing with Validation Errors',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['data', 'import', 'export', 'spreadsheet', 'validation', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Spreadsheet Import Failing with Validation Errors

## Symptom

After uploading a spreadsheet for import, the preview screen displays rows highlighted in red with validation error messages. The import cannot proceed until errors are resolved. Common error messages include "Required field missing", "Invalid date format", "Duplicate value", or "Invalid option value".

## Possible Causes

- The spreadsheet columns are in the wrong order or have been renamed (IMS requires exact column header matches)
- Date values are not in the required format (IMS requires YYYY-MM-DD for all date fields)
- Required fields are left blank for some rows
- A field that must be unique (such as employee email address or asset tag) contains duplicate values within the file or values that already exist in IMS
- Special characters such as commas, quotation marks, or newlines within cell text are breaking CSV parsing

## Solutions

1. **Download the latest import template**: On the import screen, click "Download Template". Templates are updated with each IMS release. Do not reuse old templates from previous imports.
2. **Review each error in the preview**: The preview table shows an error description next to each affected row. Address errors one type at a time — start with required field errors, then format errors, then uniqueness errors.
3. **Fix date formats**: Select all date columns in Excel and format as Text, then enter dates as YYYY-MM-DD (e.g., 2026-03-15). Alternatively, use the IMS Excel template which pre-formats date columns.
4. **Remove duplicate entries**: Sort the file by the unique field and use Excel's "Remove Duplicates" function to identify and remove duplicate values before re-uploading.
5. **Handle special characters**: If cells contain commas or newlines, ensure the file is saved as CSV with proper quoting, or export as XLSX format which handles these characters correctly.

## Prevention

- Always start an import from the template downloaded on the day of import to ensure column compatibility.
- Validate data in Excel before importing: use Excel data validation rules to pre-screen required fields and date formats.
`,
  },
  {
    id: 'KB-TS-010',
    title: 'Export Download Not Starting',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['data', 'import', 'export', 'download', 'browser', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Export Download Not Starting

## Symptom

Clicking the "Export" or "Download" button appears to do nothing — no file download starts, no progress indicator appears, and no error message is shown. Alternatively, a brief spinner appears but no file is downloaded.

## Possible Causes

- The browser's popup blocker is preventing the download from initiating (exports often open in a new tab or trigger a file save dialog that browsers can block)
- The export is running as a background job for large data sets and the file is not yet ready
- A browser extension (such as an ad blocker or download manager) is intercepting the download request
- The browser download folder is full or the user does not have write permissions to the download location
- Network connectivity issue interrupted the download initiation

## Solutions

1. **Allow popups for IMS**: In Chrome, click the popup blocked icon in the address bar and select "Always allow pop-ups from [IMS URL]". In Firefox, look for the blocked popup notification bar and allow it.
2. **Check the Exports queue**: For large exports, IMS processes them in the background. Navigate to the module's Reports section or Settings → Exports → My Exports to find the completed file ready for download.
3. **Disable browser extensions temporarily**: Switch to a new incognito window (which disables most extensions by default) and attempt the export again to rule out extension interference.
4. **Try a different browser**: If the download fails in Chrome, try Firefox or Edge to determine if it is browser-specific.
5. **Check available disk space**: Ensure the download folder on your device has sufficient free space. Also verify the download path in browser settings is accessible.
6. **Apply a narrower filter before exporting**: If exporting a very large data set, apply date range or status filters to reduce the file size and speed up generation.

## Prevention

- For recurring large exports, use scheduled reports (Analytics → Scheduled Reports) which generate and email the file automatically.
`,
  },
  {
    id: 'KB-TS-011',
    title: 'Imported Data Not Appearing After Successful Import',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['data', 'import', 'export', 'filters', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Imported Data Not Appearing After Successful Import

## Symptom

The import process completed with a success message showing the number of records imported (e.g., "500 records imported successfully"), but when navigating to the module, the new records cannot be found in the list.

## Possible Causes

- Active list view filters are hiding the imported records (e.g., a Status filter set to "Active" hiding records imported with "Draft" status)
- The records were imported to a different site than the one currently being viewed
- The browser page has not been refreshed and is showing a cached version of the list
- The imported records have a status that excludes them from the default view
- The import was performed in the wrong module — for example, importing incidents into H&S when the Incidents module is the intended destination

## Solutions

1. **Clear all active filters**: Look for a "Clear Filters" button or X icons next to active filter chips at the top of the list. Remove all filters to see all records regardless of status or assignment.
2. **Check the site filter**: At the top of most modules, there is a site or location filter. Ensure it is set to "All Sites" or the site where the import was directed.
3. **Hard refresh the browser**: Press Ctrl+F5 (Windows) or Cmd+Shift+R (Mac) to force a full reload from the server, bypassing any cached data.
4. **Search by reference number**: If the import confirmation showed sample reference numbers, navigate directly to one using the global search (Cmd+K) to confirm the record exists.
5. **Check the default status filter**: Many modules default to showing only "Active" or "Published" records. The imported records may exist in "Draft" status — change the status filter to "All" or "Draft" to reveal them.
6. **Verify the correct module**: Check the import history in Settings → Import History to confirm the destination module of the import.

## Prevention

- After each import, note the reference numbers of a few imported records and immediately search for them to confirm visibility.
`,
  },
  {
    id: 'KB-TS-012',
    title: 'Report Showing Incorrect or Stale Data',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['data', 'reports', 'export', 'dashboard', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Report Showing Incorrect or Stale Data

## Symptom

A report or dashboard widget is displaying figures that do not match the data visible in the corresponding module. For example, an incident count in a report shows 15, but navigating to the Incidents module shows 22 incidents in the same period.

## Possible Causes

- The report is using cached data that was generated on a schedule and has not been updated since data was added
- The date range filter in the report does not exactly match the date range you are comparing against in the module
- A different site filter is applied in the report compared to the module view
- The report was generated before new records were added — saved reports reflect data at time of generation
- The module view includes records of a status type that the report excludes (e.g., report shows only "Closed" incidents, module shows all)

## Solutions

1. **Refresh or regenerate the report**: Open the report and click "Refresh Data" or "Regenerate Report". This forces the report to query the database again rather than using cached data.
2. **Compare date range filters carefully**: Check both the report's date filter and the module's filter. Ensure both use the same field (e.g., "Date Reported" vs "Date Occurred") and the same date range.
3. **Check site filters**: Confirm both the report and the module view have the same site filter applied. A report scoped to one site will not match a module view showing all sites.
4. **Use live dashboards for real-time data**: Scheduled reports show data as-of the time they were generated. For current figures, use the module's built-in dashboard or live summary widgets.
5. **Check record status inclusion**: Edit the report and review the filter criteria — confirm whether all status types are included or only specific ones.

## Prevention

- For operational dashboards, use live data widgets rather than scheduled report snapshots to ensure figures are always current.
- Document the data source and refresh frequency for each report so stakeholders know when data was last updated.
`,
  },
  {
    id: 'KB-TS-013',
    title: 'CSV Export Contains Garbled Characters',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['data', 'import', 'export', 'csv', 'encoding', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# CSV Export Contains Garbled Characters

## Symptom

After downloading a CSV export from IMS, opening it in Excel shows strange symbols or question marks in place of special characters — for example, accented letters (é, ü, ñ), em dashes, or non-Latin script characters appear as "?" or as a sequence of symbols like "â€"".

## Possible Causes

- IMS exports CSV files in UTF-8 encoding, but Microsoft Excel on Windows defaults to Windows-1252 (Latin-1) encoding when opening CSV files by double-clicking
- The system locale is not set to a Unicode-compatible locale
- A text editor or other application re-saved the CSV in a different encoding before it was opened in Excel

## Solutions

1. **Import via Excel's Data tab (recommended)**: Do not double-click the CSV file. Instead, open Excel with a blank workbook, go to the Data tab → "From Text/CSV" (or "Get External Data" → "From Text") → select the file → set the File Origin / Encoding to "65001: Unicode (UTF-8)" → click Load. This correctly interprets all characters.
2. **Use the XLSX export format**: If the module offers an Excel (.xlsx) export option, use it instead of CSV. XLSX format embeds encoding information and always displays correctly in Excel without manual configuration.
3. **Add BOM to the file**: If you must use CSV, you can add a UTF-8 Byte Order Mark (BOM) to the file. IMS support can enable "Export CSV with BOM" in organisation settings, which causes Excel to auto-detect UTF-8.
4. **Use LibreOffice Calc**: LibreOffice correctly prompts for encoding when opening CSV files, making it a reliable alternative for multi-language data.

## Prevention

- Standardise on XLSX export format for all data containing non-ASCII characters.
- Document the correct import procedure for colleagues who regularly work with IMS CSV exports.
`,
  },
  {
    id: 'KB-TS-014',
    title: 'Scheduled Report Not Being Received',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['data', 'reports', 'export', 'email', 'notifications', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Scheduled Report Not Being Received

## Symptom

A scheduled report has been configured to be sent by email on a recurring basis (e.g., weekly Monday morning) but the recipient(s) have stopped receiving it, or have never received it despite the schedule appearing active.

## Possible Causes

- The report email is being delivered to the spam or junk mail folder
- The recipient's email address changed (job change, domain change) and the schedule was not updated
- The report schedule was accidentally paused or deactivated
- The organisation's SMTP email configuration is broken, preventing all outbound email from IMS
- The recipient's email domain is blocking the IMS sending domain

## Solutions

1. **Check spam/junk folder**: Ask the recipient to check their spam or junk folder. If found there, mark the email as "Not Spam" to train the spam filter. Add the IMS sending address to the safe senders list.
2. **Verify recipient email address**: Admin Console → Analytics → Scheduled Reports → open the report → check the recipient email addresses are current and correctly typed.
3. **Confirm report status is Active**: In Analytics → Scheduled Reports, check the Status column. If the report shows "Paused" or "Error", click the report to review the last run status and reactivate it.
4. **Check last run time**: The "Last Run" column shows when the report was last generated. If it is significantly behind the expected schedule, the scheduled job may have an error — click the report name to see the run history and error details.
5. **Test SMTP configuration**: Admin Console → Settings → Email → click "Send Test Email". If the test email fails, fix the SMTP configuration before troubleshooting scheduled reports further.
6. **Request email domain whitelisting**: Ask your IT or email security team to whitelist the IMS sending domain so emails are not blocked at the gateway.

## Prevention

- After configuring a new scheduled report, verify it works by setting it to run in 10 minutes, confirming receipt, then adjusting to the desired schedule.
`,
  },
  {
    id: 'KB-TS-015',
    title: 'CAPA Not Closing Despite All Actions Complete',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['capa', 'corrective-action', 'workflow', 'quality', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# CAPA Not Closing Despite All Actions Complete

## Symptom

All corrective actions within a CAPA record show a status of "Complete", but the overall CAPA status remains stuck at "In Progress" or "Pending Closure". The system will not allow the CAPA to be moved to "Closed".

## Possible Causes

- An effectiveness review step is required by the CAPA workflow but has not been completed
- One or more actions are marked complete but have missing or unreviewed evidence attachments
- The CAPA requires a formal approver sign-off or verification step that is pending
- The workflow is waiting for a specific user (verifier or approver) to take action and they have not responded
- One action is actually at "Evidence Pending" (amber) status rather than truly "Complete" (green)

## Solutions

1. **Check the CAPA workflow stage**: Open the CAPA record and look at the workflow progress indicator at the top. Identify which stage the CAPA is currently in — it may be at "Pending Verification" or "Effectiveness Review" rather than "Actions Complete".
2. **Inspect all actions carefully**: Navigate to the CAPA → Actions tab. Check whether all action status indicators are solid green (Complete) or amber (Evidence Pending). An amber status means evidence has been submitted but the action owner or verifier must review and confirm it.
3. **Complete the effectiveness review**: If an effectiveness review is required, navigate to CAPA → Effectiveness Review tab, complete the review form, and submit. This step confirms corrective actions have resolved the root cause.
4. **Chase the approver**: If awaiting sign-off, navigate to CAPA → Approvals tab to see who needs to approve. Use the "Send Reminder" button to notify the approver directly from the CAPA record.
5. **Check CAPA workflow configuration**: Quality → Settings → CAPA Workflows → review the workflow stages to understand all required steps before closure.

## Prevention

- When assigning CAPA actions, always include a named verifier and set realistic target dates to prevent delays at the verification stage.
`,
  },
  {
    id: 'KB-TS-016',
    title: 'Incident Not Appearing in Management Reports',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['incidents', 'health-safety', 'reports', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Incident Not Appearing in Management Reports

## Symptom

An incident has been logged in IMS but it does not appear in the incident management report, safety statistics dashboard, or regulatory reporting exports. The incident can be found by navigating directly to it, but it is absent from summary counts and lists.

## Possible Causes

- The incident is saved as "Draft" status and has not been formally submitted — draft incidents are typically excluded from reports
- The report has a status filter that excludes the incident's current status (e.g., filtering for "Closed" only)
- The incident is assigned to a site that is not included in the report's site filter
- The report date range does not include the incident's date (check whether the report filters on date reported, date occurred, or date closed)
- The incident was logged in the Health & Safety module rather than the dedicated Incidents module, or vice versa

## Solutions

1. **Check incident status**: Open the incident record and confirm its status. If it shows "Draft", the reporter needs to formally submit the incident by clicking "Submit" or "Report Incident". Draft records are excluded from most reports by design.
2. **Adjust report status filter**: In the report or dashboard, look for a Status filter and change it to "All Statuses" or include "Under Investigation" and "New" statuses.
3. **Check the site filter**: Ensure the report includes the site where the incident occurred. Set the site filter to "All Sites" to confirm the incident appears.
4. **Review the date filter field**: Edit the report filter and check whether it is filtering on "Date Reported", "Date Occurred", or "Date Closed". Match the filter field and range to when the incident occurred.
5. **Check both H&S and Incidents modules**: If your organisation has both the Health & Safety and Incidents modules active, check whether the record is in the expected module.

## Prevention

- Train all staff to submit incidents immediately after logging rather than saving as draft. Include a step in the incident reporting procedure.
`,
  },
  {
    id: 'KB-TS-017',
    title: 'Risk Score Not Updating After Changing Likelihood or Consequence',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['risk', 'risk-register', 'troubleshooting', 'calculation'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Risk Score Not Updating After Changing Likelihood or Consequence

## Symptom

After adjusting the likelihood or consequence rating on a risk record, the calculated risk score (rating number or heat map position) does not change. The risk appears to remain at the same score even after saving.

## Possible Causes

- The page is showing a cached or stale version of the risk score and needs to be refreshed
- The risk matrix lookup table is configured in a way that different likelihood/consequence combinations map to the same score level
- The displayed score is the inherent risk score, but the user changed the residual risk inputs (or vice versa) — IMS maintains separate inherent and residual scores
- The risk has been locked by an approver or reviewer and cannot be edited until unlocked
- A custom risk matrix is being used with a non-linear scoring formula that behaves unexpectedly at certain input ranges

## Solutions

1. **Save and reopen the record**: After changing the likelihood or consequence rating, save the risk record and navigate away, then return to it. The recalculated score will be shown after the server processes the change.
2. **Hard refresh the browser**: Press Ctrl+F5 (Windows) or Cmd+Shift+R (Mac) to reload the page, clearing any cached display state.
3. **Check inherent vs residual scores**: IMS risk records typically have two scoring sections — Inherent Risk (before controls) and Residual Risk (after controls). Confirm you are viewing and editing the correct section.
4. **Review the risk matrix configuration**: Navigate to Settings → Risk → Risk Matrix → open the matrix table and verify the likelihood and consequence combination produces the expected score. A 5x5 matrix may map multiple combinations to the same colour band.
5. **Check record lock status**: If the risk is in a workflow stage that locks editing (e.g., "Under Review"), the fields may appear editable but not save. Check the workflow stage displayed on the record.

## Prevention

- Document your organisation's risk matrix configuration and share it with risk owners so they understand the scoring logic before making adjustments.
`,
  },
  {
    id: 'KB-TS-018',
    title: 'Document Stuck in Review Status — Reviewer Not Responding',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['documents', 'document-control', 'workflow', 'review', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Document Stuck in Review Status — Reviewer Not Responding

## Symptom

A document was submitted for review or approval weeks ago. The reviewer has not acted on it, no feedback has been provided, and the document workflow is blocked. The document author cannot advance the document or publish it without reviewer action.

## Possible Causes

- The reviewer did not receive the notification email (went to spam, or email is misconfigured)
- The reviewer's IMS account is inactive or they have left the organisation
- The reviewer is unaware of what action they need to take in IMS
- The document is caught in a review stage that requires a specific quorum of reviewers, some of whom have not yet responded

## Solutions

1. **Check reviewer account status**: Admin Console → Users → find the reviewer → confirm the account is Active and the email address is current.
2. **Resend the review notification**: Open the document record → Actions (or the three-dot menu) → "Send Reminder to Reviewer". This sends a fresh notification to the reviewer with a direct link to the document review screen.
3. **Contact the reviewer directly**: In addition to the system notification, contact the reviewer by phone or direct message. Direct them to Documents → My Reviews → Pending Reviews where they will see all documents awaiting their action.
4. **Add an additional reviewer or escalate**: If the workflow configuration allows, add a second reviewer to the current stage via Document → Review Settings → Add Reviewer. This provides an alternative approver path.
5. **Admin force-advance the workflow**: A Document Control Administrator can manually advance the document workflow: Document Control → Admin Functions → Force Advance Workflow. This action is recorded in the document audit trail with a reason.

## Prevention

- Configure document review escalation rules: Settings → Document Control → Workflow → Escalation → set automatic escalation if a review is not completed within a defined number of days.
`,
  },
  {
    id: 'KB-TS-019',
    title: 'Payroll Calculation Showing Unexpected Results',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['payroll', 'calculations', 'finance', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Payroll Calculation Showing Unexpected Results

## Symptom

An employee's net pay for the current period is significantly different from what was expected — either much higher or much lower than usual. The difference cannot be easily explained by known changes such as a pay rise or standard deduction.

## Possible Causes

- The employee's tax code is incorrectly configured, resulting in too much or too little tax being withheld
- A new benefit deduction was added or an existing one removed recently, affecting the gross-to-net calculation
- The employee took leave without pay during the period, which reduces gross pay
- Overtime was applied at an incorrect rate (e.g., double time applied instead of time-and-a-half)
- Currency rounding differences when processing in multiple currencies
- A retroactive pay adjustment from a prior period was included without the payroll manager's awareness

## Solutions

1. **Review the gross-to-net calculation**: Payroll → Employees → find the employee → Pay Preview → click "View Calculation Detail". This shows every element from gross pay through each deduction to net pay. Identify which element is the unexpected value.
2. **Check the tax code**: Payroll → Employees → Tax Settings → review the current tax code. Compare against the employee's tax certificate or HR record. Update if incorrect and recalculate.
3. **Review deduction history**: Payroll → Employees → Deductions → check for any recently added or removed deductions that may not have been expected in this pay period.
4. **Review leave records**: HR → Leave → check leave taken in the pay period for leave without pay entries that would reduce gross pay.
5. **Check the pay run history**: Payroll → Pay Runs → view prior period → compare the employee's previous pay summary with the current period to isolate the change.

## Prevention

- Before finalising each pay run, generate the pay run comparison report which highlights employees whose net pay has changed by more than a configurable threshold from the previous period.
`,
  },
  {
    id: 'KB-TS-020',
    title: 'Audit Finding Corrective Action Not Closing',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['audits', 'findings', 'corrective-action', 'capa', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Audit Finding Corrective Action Not Closing

## Symptom

A corrective action has been submitted for an audit finding, but the finding's status remains "Open" rather than moving to "Closed" or "Verified". The auditee cannot understand why the finding will not close despite having completed all required actions.

## Possible Causes

- A CAPA was raised from the finding and must be fully completed and verified before the finding can close
- The finding closure requires verification by the auditor (not just submission by the auditee) — this is standard audit practice
- Evidence has been submitted for the corrective action but the auditor has not yet reviewed and accepted it
- The audit report itself is in a status that prevents findings from being closed (e.g., the audit is still "In Progress" and findings can only close after report finalisation)

## Solutions

1. **Check the linked CAPA**: Navigate to Audits → Findings → click the finding → Linked CAPAs tab. If a CAPA was raised, it must reach "Closed and Verified" status before the finding can close. Check the CAPA status and act accordingly.
2. **Confirm auditor verification is needed**: In Audits → Findings, check if there is a "Pending Auditor Verification" status indicator. If so, the auditor (not the auditee) must navigate to the finding and click "Mark as Verified" after reviewing the evidence.
3. **Contact the lead auditor**: Notify the lead auditor that evidence has been submitted and is awaiting their review. Provide the finding reference number so they can locate it quickly in their Audit → My Actions → Findings to Verify queue.
4. **Check the audit status**: Navigate to the parent audit record. If the audit status is "In Progress", some findings may be locked pending report completion. Check with the audit manager.
5. **Review closing criteria in audit settings**: Audits → Settings → Finding Closure Requirements to see exactly what conditions must be met.

## Prevention

- During audit briefings, clearly communicate the finding closure process to auditees, including the auditor verification step, to avoid confusion and delays.
`,
  },
  {
    id: 'KB-TS-021',
    title: 'Inventory Stock Level Not Reflecting Recent Movements',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['inventory', 'stock', 'transactions', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Inventory Stock Level Not Reflecting Recent Movements

## Symptom

Goods have been physically received into the warehouse and a goods receipt transaction was created in IMS, but the on-hand stock level shown in the Inventory module has not increased. The stock level appears unchanged from before the receipt.

## Possible Causes

- The goods receipt transaction was created but not submitted — it may still be in "Draft" status
- The goods receipt was posted to a different warehouse location or bin than the one being viewed
- A unit of measure mismatch exists between the purchase order (cases) and the inventory record (units), causing the quantity calculation to be unexpected
- An ERP or warehouse management system integration is pending sync and the update has not yet arrived in IMS
- The stock level is displaying a different date snapshot (e.g., a month-end snapshot rather than real-time)

## Solutions

1. **Check the transaction status**: Inventory → Transactions → filter by today's date and the relevant item or purchase order number. Look for the goods receipt record. If its status is "Draft", open it and click "Submit" or "Post" to finalise the stock movement.
2. **Verify the location**: In the goods receipt transaction, confirm the warehouse and bin location it was posted to. Then navigate to Inventory → Stock → select that specific location to check the balance there.
3. **Check unit of measure**: Open the item record and check the base unit of measure. In the goods receipt, confirm the quantity and unit of measure match. If goods were received in cases but the item is measured in units, a conversion factor must be applied.
4. **Check integration sync status**: If using an ERP integration, navigate to Settings → Integrations → [ERP name] → Sync Status. Check for pending or failed sync events and trigger a manual sync if needed.
5. **Confirm real-time vs snapshot**: Check if the stock level view has a "Data as of" indicator showing a historical snapshot date.

## Prevention

- Establish a standard operating procedure requiring goods receipt transactions to be submitted within 2 hours of physical receipt to maintain accurate real-time stock levels.
`,
  },
  {
    id: 'KB-TS-022',
    title: 'Training Completion Not Being Recorded',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['training', 'completions', 'compliance', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Training Completion Not Being Recorded

## Symptom

An employee has completed a training course — either an online course within IMS or an external face-to-face session — but the completion is not reflected in their training record. The course still shows as "Incomplete" or "Overdue" on their profile.

## Possible Causes

- For online courses: the browser was closed before the completion confirmation screen was fully submitted, so completion was not registered by the server
- For online courses: the employee did not achieve the minimum passing score on the assessment and the completion criterion was not met
- For face-to-face training: the manager or training coordinator has not yet uploaded attendance evidence and marked the session complete
- The training assignment is linked to a course version that was updated, and the completion is recorded against an older version

## Solutions

1. **Resume the online course**: Employee navigates to Training → My Training → find the course. If "Resume" is shown rather than "Complete", the course was not fully finished. Complete the final assessment or acknowledgement screen. The final screen must fully load before closing the browser.
2. **Check the passing score**: Navigate to the training record and check if there is an assessment score shown. If the score is below the required passing threshold, the employee must retake the assessment.
3. **Upload face-to-face attendance evidence**: For classroom or in-person training, the manager or training coordinator navigates to Training → Sessions → find the session → Attendance tab → mark each attendee as "Attended" and upload the signed attendance sheet as evidence.
4. **Check training version**: If the course was updated recently, navigate to Training → Courses → find the course → Version History. Completions recorded against an older version may show separately from the current version requirement.
5. **Manually record an external completion**: Training → Employees → find the employee → Training History → Add External Completion. Enter the course name, completion date, and attach a certificate.

## Prevention

- For online courses, ensure employees complete the course in a stable network environment and reach the "Course Complete" confirmation screen before closing the browser.
`,
  },
  {
    id: 'KB-TS-023',
    title: 'Notification Emails Not Being Received',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['notifications', 'email', 'troubleshooting', 'settings'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Notification Emails Not Being Received

## Symptom

Users are not receiving email notifications from IMS for events they are subscribed to — such as task assignments, document approvals, incident alerts, or scheduled reminders. In-app notifications (the bell icon) may still work, but email notifications are not arriving.

## Possible Causes

- Notification emails are being delivered to the spam or junk mail folder
- The user's email address in their IMS profile is incorrect or outdated
- The notification rule for the event type is inactive or has been deactivated
- The user has opted out of email notifications for that notification category in their personal preferences
- The organisation's SMTP email service is misconfigured or has stopped working
- The user's email domain is blocking inbound email from the IMS sending domain

## Solutions

1. **Check spam/junk folder**: Ask the affected user to check spam and junk mail. If found, mark as "Not Spam" and add the IMS sender address to the safe senders list.
2. **Verify email address in profile**: Admin Console → Users → find the user → confirm the email address field is correct and current. Edit if needed.
3. **Check notification rule status**: Settings → Notifications → Notification Rules → find the relevant rule → confirm it shows "Active". Reactivate if paused.
4. **Check user notification preferences**: Ask the user to navigate to My Profile → Notification Preferences → confirm "Email" is enabled for the relevant notification type. Users can opt out per category.
5. **Test SMTP configuration**: Admin Console → Settings → Email → click "Send Test Email" to a known-good address. If this fails, fix SMTP settings (host, port, credentials, TLS) before investigating individual notification rules.
6. **Request email domain whitelisting**: Engage your IT or email security team to whitelist the IMS sending IP addresses and domain, ensuring IMS emails are not blocked at the corporate email gateway.

## Prevention

- After SMTP configuration changes, always send a test email and ask several users across different departments to confirm receipt.
`,
  },
  {
    id: 'KB-TS-024',
    title: 'Chemical SDS Not Showing on Mobile',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['chemicals', 'sds', 'mobile', 'troubleshooting', 'health-safety'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Chemical SDS Not Showing on Mobile

## Symptom

A worker scans the QR code label on a chemical container using their mobile device, but the Safety Data Sheet (SDS) does not load. Instead, they see a blank page, an error message, or a browser prompt that does not display the PDF document.

## Possible Causes

- The mobile device has no or limited data connectivity, preventing the SDS from downloading
- The SDS PDF file is very large (some SDS documents exceed 10 MB) and times out on slow mobile connections
- The mobile browser does not have built-in PDF rendering capability and no PDF reader app is installed
- The QR code label was printed before the chemical record was updated, and the link is no longer valid
- The chemical register is only accessible within the corporate network (intranet only) and the worker is using mobile data

## Solutions

1. **Check mobile data connectivity**: Confirm the device has a reliable internet connection. Move to an area with better signal or connect to the site Wi-Fi.
2. **Open on desktop**: To verify the SDS itself is accessible, open the same QR code link on a desktop computer. If it loads on desktop but not mobile, the issue is mobile-specific (likely PDF rendering or file size).
3. **Install a PDF reader app**: Download Adobe Acrobat Reader or another PDF viewer from the app store. Mobile browsers often cannot display PDFs natively but can open them with a dedicated app.
4. **Use the IMS Mobile App**: The IMS mobile app includes built-in PDF rendering and is optimised for SDS viewing. Download from the iOS App Store or Google Play Store and log in with IMS credentials.
5. **Re-generate the QR code**: If the chemical record was recently updated (new SDS revision), the old QR code label may point to the previous version. In Chemical Register → find the chemical → Labels → Regenerate QR Code → reprint and replace the label.
6. **Check network access rules**: If your IMS is hosted internally, ensure mobile devices can access it. Consider enabling external access for the SDS viewer endpoint specifically.

## Prevention

- Test QR code SDS access from a mobile device whenever new chemicals are added or SDS documents are revised.
`,
  },
  {
    id: 'KB-TS-025',
    title: 'Permit to Work Not Appearing for Area Authority Approval',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['permit-to-work', 'ptw', 'approval', 'workflow', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Permit to Work Not Appearing for Area Authority Approval

## Symptom

A permit to work has been submitted for approval, but the designated area authority reports that the permit does not appear in their approval queue in IMS. They cannot find the permit to review and authorise it.

## Possible Causes

- The area authority user does not have the "PTW Area Authority" role assigned for the relevant work location
- The permit was submitted and routed to a different area authority because the wrong location was selected on the permit
- The area authority's approval notification email went to spam and they are looking in the wrong place
- The permit is still in "Draft" or "Pending Issuer Review" status and has not yet reached the area authority approval stage
- The area authority is filtering the approval queue by location and the permit's location is excluded

## Solutions

1. **Verify the area authority role assignment**: Admin Console → Users → find the area authority user → Roles → confirm they have the "PTW Area Authority" role. If the role is location-scoped, confirm it is assigned for the correct work area or location.
2. **Check the permit routing**: Open the permit record and navigate to the Approval Workflow tab. This shows the full approval chain and which approver the permit is currently assigned to. Confirm it is routed to the correct area authority.
3. **Direct the area authority to search by reference**: Ask the area authority to navigate to PTW → Pending Approvals → use the search box to enter the specific permit reference number (e.g., PTW-2026-0042). Filters may be hiding it.
4. **Clear location filters**: In the PTW approval queue, ensure the location filter is set to "All Locations" or includes the relevant work area.
5. **Resend the approval notification**: From the permit record → Actions → "Resend Approval Notification" to send a fresh email to the area authority with a direct link to the permit.
6. **Check permit status**: Confirm the permit status is "Pending Area Authority Approval" and not still at an earlier stage.

## Prevention

- Perform a PTW workflow dry run when setting up new locations or onboarding new area authorities to confirm routing works correctly before live use.
`,
  },
  {
    id: 'KB-TS-026',
    title: 'ESG Data Import Not Calculating Correctly',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['esg', 'sustainability', 'ghg', 'emissions', 'import', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ESG Data Import Not Calculating Correctly

## Symptom

After uploading energy consumption or emissions activity data into the ESG module, the calculated greenhouse gas (GHG) totals appear incorrect — significantly higher or lower than expected based on known activity levels. Scope 1, 2, or 3 totals do not match manual calculations.

## Possible Causes

- The wrong emission factor library is selected — for example, using UK Grid Electricity factors for US facilities, or using an outdated factor set
- A unit of measure mismatch exists in the imported data — for example, entering kilowatt-hours as megawatt-hours, causing totals that are 1,000 times higher or lower
- Activity data was placed in the wrong column in the import template, causing IMS to multiply against the wrong emission factor
- Scope 2 emissions are being double-counted by including both market-based and location-based methods in the same total
- Negative values for renewable energy credits were not properly entered, inflating the total

## Solutions

1. **Verify the emission factor library**: ESG → Settings → Emission Factors → confirm the correct factor library is selected for each facility's country and region. Factor libraries are updated annually — confirm the correct reporting year version is selected.
2. **Check units of measure**: Review the import template and confirm the unit column matches the unit used in the data. Common mistakes: kWh vs MWh for electricity, litres vs cubic metres for gas, kg vs tonnes for refrigerants.
3. **Validate column mapping**: In the ESG import wizard, review the column mapping step. Confirm each data column is mapped to the correct activity type (e.g., "Natural Gas Consumption" not "Electricity Consumption").
4. **Separate Scope 2 methods**: For Scope 2 electricity emissions, IMS requires you to choose either market-based OR location-based for the primary disclosure. Ensure only one method's data is included in the main total. Keep the other as a supplementary disclosure.
5. **Re-check a single row manually**: Pick one data row, multiply the activity quantity by the emission factor manually, and compare to IMS's calculated value to pinpoint the discrepancy.

## Prevention

- Create a data quality checklist for ESG data entry that includes unit verification and emission factor library confirmation before each reporting period upload.
`,
  },
  {
    id: 'KB-TS-027',
    title: 'Work Order Not Auto-Generating from PM Schedule',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['cmms', 'maintenance', 'work-orders', 'preventive-maintenance', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Work Order Not Auto-Generating from PM Schedule

## Symptom

A preventive maintenance schedule has been configured for an asset with a defined frequency (e.g., every 30 days), but when the due date arrives, no work order is automatically created in the CMMS module. The asset shows a PM task as overdue but no work order exists.

## Possible Causes

- The PM schedule status is set to "Draft" rather than "Active" — only Active schedules generate work orders
- The associated asset status is "Disposed", "Retired", or "Inactive" — IMS does not generate PMs for non-active assets
- Work orders are being generated but have no assigned recipient, so they appear to be missing (they exist but are in an "Unassigned" pool)
- The CMMS system's scheduled job for PM generation has a configuration issue or failed to run
- The PM schedule's lead time setting means the work order will not appear until a few days before the due date, not on the day it is configured

## Solutions

1. **Check PM schedule status**: CMMS → Assets → select the asset → Maintenance Plans → find the PM schedule → confirm the status is "Active" (green). If "Draft", click "Activate".
2. **Check asset status**: CMMS → Assets → find the asset → confirm its status is "Active". If "Disposed" or "Inactive", update the status or create a separate asset record for the active unit.
3. **Search all work order statuses**: CMMS → Work Orders → remove all status filters and search for the asset or PM schedule name. The work order may exist in "Unassigned" or "Open" status with no technician assigned.
4. **Review PM generation settings**: CMMS → Settings → PM Auto-Generation → confirm the scheduled job is enabled and review the last run timestamp. If the job has not run recently, contact your system administrator.
5. **Check lead time configuration**: In the PM schedule settings, review the "Lead Time (days)" field. A 7-day lead time means the work order appears 7 days before the due date, not on the due date.

## Prevention

- After creating a new PM schedule, manually trigger a test work order generation (CMMS → PM Schedules → Generate Now) to confirm the schedule is working before relying on automation.
`,
  },
  {
    id: 'KB-TS-028',
    title: 'Supplier Portal Invitation Not Received by Supplier',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['suppliers', 'supplier-portal', 'email', 'invitation', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Supplier Portal Invitation Not Received by Supplier

## Symptom

A supplier portal invitation has been sent from the Supplier Management module, but the supplier contact reports they have not received the invitation email and cannot access the portal to submit documents or complete assessments.

## Possible Causes

- The invitation email was delivered to the supplier's spam or junk folder
- The supplier email address was entered incorrectly when creating the supplier record
- The supplier's email security gateway is blocking email from the IMS sending domain
- The invitation link has expired — portal invitation links are typically valid for 7 days
- The supplier contact's corporate email has changed since the record was created

## Solutions

1. **Ask the supplier to check spam/junk**: The invitation email may have been filtered by the supplier's email security system. Ask them to check spam and junk folders and add the IMS sending address to their safe senders list.
2. **Verify the supplier email address**: Supplier Management → Suppliers → find the supplier → Contacts tab → confirm the email address is correctly entered. Correct any typos and save.
3. **Resend the invitation**: Supplier Management → Suppliers → find the supplier → Actions → "Resend Portal Invitation". This generates a fresh invitation email with a new link. The previous link is invalidated.
4. **Provide the direct portal URL**: If email delivery continues to fail, share the Supplier Portal URL directly (e.g., suppliers.ims.example.com) and ask the supplier to click "Register" using their company email address. They can self-register if auto-provisioning is enabled.
5. **Check SMTP status**: Admin Console → Settings → Email → send a test email to an external address to confirm IMS email delivery is functioning. Fix any SMTP issues before resending invitations.
6. **Contact the supplier's IT department**: If the supplier's email gateway is blocking IMS emails, the supplier's IT team needs to whitelist the IMS sending IP address and domain.

## Prevention

- Confirm the supplier email address with the contact by phone before sending the invitation to prevent delivery failures.
`,
  },
  {
    id: 'KB-TS-029',
    title: 'IMS Loading Slowly',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['performance', 'browser', 'slow', 'loading', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# IMS Loading Slowly

## Symptom

Pages in IMS take more than 5 seconds to load, navigation between modules is sluggish, lists and reports take an unusually long time to populate, or the interface feels unresponsive when clicking buttons or entering data.

## Possible Causes

- Slow internet connection between the user's device and the IMS servers
- The user's browser has accumulated a large amount of cached data and cookies over time, degrading performance
- Too many browser tabs open, or browser extensions consuming CPU and memory
- The list view is loading an extremely large data set without adequate filtering applied
- A known IMS platform performance event is affecting all users
- The user's device is under heavy CPU or memory load from other applications

## Solutions

1. **Check internet speed**: Run a speed test (e.g., speedtest.net). IMS requires a minimum 5 Mbps connection. If below this, contact your network provider or IT team.
2. **Clear browser cache and cookies**: In Chrome: Settings → Privacy and Security → Clear Browsing Data → check "Cached images and files" and "Cookies" → Clear. Restart the browser and log back into IMS.
3. **Close unnecessary browser tabs and extensions**: Reduce the number of open tabs to fewer than 10. Disable all non-essential browser extensions and test again. Extensions such as VPNs, screen readers, and ad blockers can significantly slow rendering.
4. **Apply data filters**: If a specific module page is slow, apply date range and status filters to reduce the amount of data being retrieved. Avoid loading "All time" data for large modules like incidents or training records.
5. **Check the IMS status page**: Navigate to the IMS status page (URL provided by your administrator) to check for any active platform performance incidents affecting all users.
6. **Restart the browser**: Completely close and reopen the browser to release accumulated memory.

## Prevention

- Clear the browser cache monthly as routine maintenance.
- Use Chrome for best IMS performance. Keep the browser updated to the latest version.
`,
  },
  {
    id: 'KB-TS-030',
    title: 'Dashboard Charts Not Displaying',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['performance', 'browser', 'dashboard', 'charts', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Dashboard Charts Not Displaying

## Symptom

Dashboard widgets or module summary charts display as blank areas, show "No data available", show a loading spinner that never completes, or display an error icon instead of the expected chart or graph.

## Possible Causes

- There is genuinely no data in the selected date range — for example, a new installation with no records yet, or a date filter set to a future period
- The chart's data source or widget configuration is broken, pointing to a deleted or reconfigured metric
- JavaScript is disabled in the browser, preventing chart libraries from rendering
- A browser extension (such as an ad blocker or content security policy extension) is blocking the chart rendering library (commonly Chart.js or D3.js)
- The browser cache contains a stale version of the dashboard that references a deleted widget configuration
- The user does not have permission to view the data that the chart is trying to display

## Solutions

1. **Extend the date range filter**: On the dashboard, change the date range to "Last 12 months" or "All time" to confirm whether data exists. If the chart appears with data, the previous date range was the issue — adjust accordingly.
2. **Hard refresh the browser**: Press Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac) to force a full page reload bypassing the cache.
3. **Test in incognito mode**: Open the same dashboard in an incognito or private browsing window. This disables most extensions. If charts load correctly, a browser extension is the cause — identify and disable it.
4. **Check JavaScript is enabled**: In Chrome, navigate to Settings → Privacy and Security → Site Settings → JavaScript → confirm it is "Allowed". IMS requires JavaScript to render all charts.
5. **Reconfigure the chart widget**: Click the widget's Edit (pencil) icon and review the data source configuration. Re-select the metric and save. If the widget is broken, delete and re-add it.
6. **Verify data access permissions**: Confirm the logged-in user has view access to the module that the chart data comes from.

## Prevention

- After each IMS system update, verify dashboard charts are displaying correctly on the main dashboard and key module dashboards.
`,
  },
  {
    id: 'KB-TS-031',
    title: 'Mobile App Not Syncing Offline Changes',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['performance', 'mobile', 'sync', 'offline', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Mobile App Not Syncing Offline Changes

## Symptom

Work was completed on the IMS mobile app while the device was offline — such as filling in an inspection checklist, logging an incident, or updating a work order. After the device reconnected to the internet, the changes are not appearing in the web application.

## Possible Causes

- The sync process was not triggered after the device reconnected — it requires either a manual trigger or a period of stable connectivity
- A data conflict occurred: the same record was modified online (via the web app) and offline (via the mobile app), causing the sync to pause for conflict resolution
- The mobile app version is outdated and has a known sync bug that was fixed in a later version
- Background app refresh is disabled on the device, preventing the app from syncing in the background

## Solutions

1. **Trigger a manual sync**: Open the IMS mobile app → pull down on the main screen to trigger a refresh. Alternatively, navigate to the app's Settings → Sync → tap "Sync Now". The sync indicator at the top of the screen should show "Syncing..." and then "Synced".
2. **Resolve sync conflicts**: If a conflict is detected, the app will display a conflict resolution prompt. You will be asked to choose whether to keep the mobile version or the server (online) version for each conflicting field. Resolve all conflicts and trigger sync again.
3. **Update the mobile app**: Go to the iOS App Store or Google Play Store and check for an available IMS app update. Install the latest version as it may contain sync fixes.
4. **Enable background app refresh**: On iPhone: Settings → General → Background App Refresh → enable for IMS. On Android: Settings → Apps → IMS → Battery → allow background activity.
5. **Re-enter data manually if sync fails**: If the sync continues to fail and the offline data cannot be recovered, navigate to the web application and manually re-enter the critical information from the offline session as a last resort.

## Prevention

- Where possible, perform IMS data entry on a stable Wi-Fi connection to avoid offline sync dependencies.
`,
  },
  {
    id: 'KB-TS-032',
    title: 'File Upload Failing',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['performance', 'browser', 'upload', 'attachments', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# File Upload Failing

## Symptom

When attempting to attach a document, image, or other file to an IMS record (such as an incident, CAPA, audit finding, or document control record), the upload fails with an error message such as "File too large", "File type not supported", "Upload failed", or the progress bar stalls and the upload never completes.

## Possible Causes

- The file exceeds the maximum allowed file size (default: 25 MB per file, configurable by the administrator)
- The file format is not in the list of supported types for that module
- The internet connection is unstable, causing the upload to time out before completing
- The organisation's total storage quota has been reached
- A browser extension or antivirus software is intercepting and blocking the upload request

## Solutions

1. **Check and reduce file size**: Right-click the file → Properties (Windows) or Get Info (Mac) to check the size. If over 25 MB, reduce it: compress PDF files using a PDF compressor tool; reduce image resolution; compress videos using Handbrake or similar tools.
2. **Verify supported file formats**: Common supported formats include PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, PNG, JPG, JPEG, GIF, MP4, MOV. Check the upload dialog for a "Supported formats" note specific to that module.
3. **Check storage quota**: Admin Console → Organisation → Storage Usage → review used vs allocated storage. If full, contact the IMS administrator to archive old attachments or upgrade the storage allocation.
4. **Disable browser extensions temporarily**: Open an incognito window (where most extensions are disabled) and attempt the upload. If successful, a browser extension is interfering — identify and disable it for the IMS domain.
5. **Check network stability**: Use a wired connection or move closer to the Wi-Fi access point. Large file uploads require a sustained connection.
6. **Try a different browser**: If one browser consistently fails, try Chrome or Firefox as an alternative.

## Prevention

- Establish a file size and naming convention policy for your organisation to keep attachments manageable and within quota limits.
`,
  },
  {
    id: 'KB-TS-033',
    title: 'Print or PDF Export Cutting Off Content',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['performance', 'browser', 'export', 'pdf', 'print', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Print or PDF Export Cutting Off Content

## Symptom

When printing a record or exporting it to PDF, content is missing or truncated. This may appear as: the right side of a table being cut off at the page margin, only the first page of a multi-page record being captured, a list showing fewer records than expected (e.g., only the first 25 rows of a list with 200 records), or certain sections being omitted entirely.

## Possible Causes

- The PDF or print view only captures the currently visible data — for paginated lists, only the current page is included
- The page orientation is set to portrait for a wide table that requires landscape
- The browser print scaling is reducing the content size and cutting off edges
- The record export has a row limit (commonly 1,000 rows for PDF exports) and total data exceeds this limit
- The browser print dialog is using incorrect paper size settings

## Solutions

1. **For list exports, increase rows before exporting**: Before initiating a PDF export from a list view, set the "Rows per page" dropdown to its maximum value (usually 1,000) to ensure all visible records are included. For more than 1,000 records, use the CSV export which is not limited.
2. **Use "Export All" option if available**: Some modules offer an "Export All Records to PDF" option that bypasses pagination. Check the Export menu or Actions menu for this option.
3. **Change page orientation to landscape**: In the browser print dialog (Ctrl+P), change the orientation from Portrait to Landscape for wide tables. This prevents the right columns from being cut off.
4. **Set print scale to 100% or "Fit to page"**: In the browser print dialog, set the Scale option to "Custom" and enter 100%, or choose "Fit to page width" to ensure all content fits within the printable area.
5. **Check paper size settings**: Confirm the paper size in the print dialog matches the paper loaded in the printer (e.g., A4 vs Letter).
6. **Use the dedicated PDF report function**: Rather than printing from the browser, use the module's built-in "Generate PDF Report" function which is designed to handle pagination correctly.

## Prevention

- Test print and PDF exports on representative records after each IMS update to catch any formatting regressions early.
`,
  },
  {
    id: 'KB-TS-034',
    title: 'Browser Compatibility Issues',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['performance', 'browser', 'compatibility', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Browser Compatibility Issues

## Symptom

Certain IMS features do not function correctly in the browser being used. Symptoms may include: UI elements not rendering or appearing broken, interactive components (dropdowns, modals, date pickers) not opening, JavaScript errors visible in the browser console, or a white/blank screen when navigating to specific pages.

## Possible Causes

- An unsupported or outdated browser version is being used — IMS supports Chrome 110+, Firefox 110+, Safari 16+, and Edge 110+
- Internet Explorer (any version) is being used — IE is not supported and has no compatibility mode for IMS
- The browser zoom level is not at 100%, causing layout elements to misalign
- A corporate browser policy is restricting JavaScript execution or blocking certain web APIs that IMS requires
- The browser is in "Compatibility View" mode (common in Edge for sites added to the Compatibility View list)

## Solutions

1. **Update the browser to the latest version**: In Chrome: Settings (three dots) → Help → About Google Chrome → update if available. In Edge: Settings → Help and Feedback → About Microsoft Edge → update.
2. **Switch to Chrome**: Google Chrome provides the best compatibility and performance for IMS. If encountering issues in any other browser, first test in the latest version of Chrome to determine if the issue is browser-specific.
3. **Set browser zoom to 100%**: Press Ctrl+0 (zero) on Windows or Cmd+0 on Mac to reset browser zoom to 100%. Some UI components break at non-standard zoom levels.
4. **Disable Compatibility View in Edge**: Edge → Settings → Default browser → Compatibility → remove the IMS URL from the Compatibility View list if it appears there.
5. **Check corporate browser policies**: If working on a corporate device, contact your IT department to confirm JavaScript and required web APIs are not blocked by group policy.
6. **Report browser-specific bugs**: If an issue occurs in a supported browser version, report it to IMS support with: browser name and version (Help → About), IMS version number, and a screenshot or screen recording showing the issue.

## Prevention

- Include IMS browser requirements in your organisation's IT provisioning standards so all new employee devices meet requirements from day one.
`,
  },
  {
    id: 'KB-TS-035',
    title: 'Cross-Module Data Not Syncing',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['integration', 'api', 'modules', 'sync', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Cross-Module Data Not Syncing

## Symptom

Data entered in one IMS module is not appearing in a related module that is supposed to receive it automatically. Examples: approved leave in the HR module is not reflected in Payroll; a health and safety incident is not visible in the Incidents module; a closed CAPA in the Quality module is not updating the associated risk rating in the Risk Register.

## Possible Causes

- The integration bridge between the two modules has been disabled, either deliberately or accidentally during a configuration change
- The integration configuration is incomplete — required field mappings are missing, so data cannot be transferred
- The cross-module sync operates on a scheduled basis (e.g., hourly) rather than in real-time, and the sync has not yet run
- An error occurred in a previous sync cycle that caused the integration to pause awaiting manual intervention

## Solutions

1. **Check the integration is enabled**: Admin Console → Settings → Integrations → Module Integrations → find the specific integration (e.g., "HR → Payroll") → confirm the toggle shows "Enabled". Enable it if disabled.
2. **Review integration configuration**: Click on the integration to open its settings. Confirm all required field mappings are completed. A yellow warning icon next to an integration indicates a configuration issue — click it for details.
3. **Trigger a manual sync**: Most module integrations have a "Sync Now" button in the integration settings. Click it to force an immediate sync rather than waiting for the next scheduled run.
4. **Check the integration log for errors**: Integration Settings → Logs tab → review recent sync events. Any red "Error" entries will include a description of what failed. Common errors include field type mismatches or missing required data in the source record.
5. **Verify the source record meets sync criteria**: Some integrations only sync records in specific statuses. For example, HR leave may only sync to payroll after it is "Approved" (not "Pending").

## Prevention

- Test cross-module integration paths after any module configuration change to confirm data flow is unaffected.
`,
  },
  {
    id: 'KB-TS-036',
    title: 'Webhook Not Receiving Data',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['integration', 'api', 'webhook', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Webhook Not Receiving Data

## Symptom

A webhook has been configured in IMS to send event notifications to an external system (such as a third-party platform, automation tool, or custom application), but the external endpoint is not receiving any data when IMS events occur. No HTTP requests are arriving at the receiving URL.

## Possible Causes

- The webhook endpoint URL is not publicly accessible — for example, it points to a localhost address or an internal private IP that IMS servers cannot reach
- The receiving endpoint has an invalid or self-signed SSL/TLS certificate that IMS's webhook sender rejects
- The webhook was automatically deactivated by IMS after 10 consecutive failed delivery attempts
- The webhook events filter is configured incorrectly and the triggered events are not matching the filter
- The payload format expected by the receiving system does not match what IMS is sending, causing the receiver to reject it with a non-2xx response

## Solutions

1. **Verify the endpoint is publicly reachable**: Use a tool like webhook.site or requestbin.com to temporarily capture webhook requests and confirm IMS can reach an external URL. If IMS can reach webhook.site but not your URL, the issue is your endpoint's network accessibility.
2. **Check the SSL certificate**: Ensure your endpoint's SSL certificate is from a trusted Certificate Authority (CA) and is not expired. Self-signed certificates are rejected by IMS. Use Let's Encrypt or a commercial CA certificate.
3. **Check webhook status in IMS**: Admin Console → Settings → Integrations → Webhooks → find your webhook → check if the status shows "Deactivated (delivery failures)". If so, fix the endpoint issues and click "Reactivate".
4. **Review the delivery log**: Click on the webhook → Delivery Log tab → review recent delivery attempts. Each attempt shows the HTTP response code and body returned by your endpoint. A 4xx or 5xx response indicates the endpoint is receiving the request but rejecting it.
5. **Check event filter configuration**: In the webhook settings, review the Events filter. Ensure the event type you expect (e.g., "incident.created") is included in the subscription list.

## Prevention

- Always test webhooks against a webhook capture service before connecting to production endpoints. Set up monitoring on webhook delivery failure alerts.
`,
  },
  {
    id: 'KB-TS-037',
    title: 'API Rate Limit Exceeded',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['integration', 'api', 'rate-limiting', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# API Rate Limit Exceeded

## Symptom

API requests from an external integration or custom application are returning HTTP 429 "Too Many Requests" responses. The response body typically includes a message such as '{"error":"Rate limit exceeded","retryAfter":60}'. The integration stops functioning correctly until the rate limit window resets.

## Possible Causes

- A bulk data migration or import operation is sending too many API requests in a short time window
- An integration is polling the IMS API too frequently for changes (e.g., checking every second instead of using webhooks)
- Multiple separate systems are using the same API key, and their combined request volume exceeds the per-key limit
- A bug in an integration is causing it to enter a retry loop without backoff, rapidly consuming the rate limit

## Solutions

1. **Implement exponential backoff on 429 responses**: When a 429 is received, pause requests and retry after 60 seconds. If still hitting the limit, wait 120 seconds, then 300 seconds. Do not retry immediately.
2. **Switch from polling to webhooks**: If the integration is repeatedly calling GET endpoints to check for changes, replace polling with IMS webhook subscriptions. Webhooks push changes to your system in real-time without consuming API quota.
3. **Use bulk API endpoints**: IMS provides bulk operation endpoints that process multiple records in a single API call. For example, use 'POST /api/incidents/bulk' instead of sending individual 'POST /api/incidents' calls for each record.
4. **Separate API keys per system**: If multiple integrations share one API key, create separate API keys for each system. Admin Console → Settings → API Keys → Create New Key. Each key has its own rate limit bucket.
5. **Stagger scheduled batch operations**: If running nightly data sync jobs, spread requests over a longer time window rather than sending all requests at once.
6. **Contact IMS support for limit increase**: If legitimate operational usage genuinely requires higher limits, contact IMS support to discuss an increased rate limit allocation.

## Prevention

- Design integrations with rate limit awareness from the start. Build in retry logic with exponential backoff as a standard pattern in all IMS integrations.
`,
  },
  {
    id: 'KB-TS-038',
    title: 'Third-Party System Integration Errors',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['integration', 'api', 'erp', 'third-party', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Third-Party System Integration Errors

## Symptom

Data from an external system (such as an ERP, HRMS, IoT sensor platform, or financial system) is no longer flowing into IMS as expected. Previously working integrations have stopped, or new integrations cannot establish a connection.

## Possible Causes

- A network firewall rule is blocking outbound connections from the third-party system to the IMS API endpoint
- IMS API credentials (API key or OAuth client secret) have expired or been rotated and the integration has not been updated
- A recent IMS update changed the API field names or response format, breaking the integration's data mapping
- The third-party system is using TLS 1.0 or TLS 1.1 for the connection, which IMS no longer supports (requires TLS 1.2 or TLS 1.3)
- The IMS API endpoint URL changed due to a domain migration or infrastructure change

## Solutions

1. **Test network connectivity**: From the third-party system's server, attempt to reach the IMS API endpoint using a simple tool such as 'curl' or 'wget'. If the connection times out, a firewall rule is blocking the outbound request.
2. **Check and rotate API credentials**: Admin Console → Settings → API Keys → check if the API key used by the integration is still active. If it was deleted or expired, create a new key and update the integration configuration.
3. **Review the IMS API changelog**: Each IMS release includes a changelog documenting any breaking API changes. Check if any field names or endpoint paths were changed in recent updates and update the integration's data mapping accordingly.
4. **Verify TLS version**: Confirm the third-party system is configured to use TLS 1.2 or TLS 1.3 for outbound HTTPS connections. Update the system's SSL/TLS configuration if it defaults to older protocol versions.
5. **Confirm the API endpoint URL**: Verify the integration is targeting the current IMS API URL. Admin Console → Settings → API → copy the current base URL.
6. **Review integration error logs**: Check the third-party system's integration error log for the specific error message to guide targeted troubleshooting.

## Prevention

- Subscribe to IMS release notes and API changelog notifications to receive advance warning of breaking API changes before updates are applied.
`,
  },
  {
    id: 'KB-TS-039',
    title: 'LDAP / Active Directory Sync Not Working',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['integration', 'api', 'ldap', 'active-directory', 'sync', 'troubleshooting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# LDAP / Active Directory Sync Not Working

## Symptom

New employees added to Active Directory or LDAP are not appearing as users in IMS after the expected sync period. Alternatively, employees who have left the organisation and had their AD accounts disabled still have active IMS accounts, creating a security risk.

## Possible Causes

- The Directory Sync service connection to the LDAP or AD server has been interrupted
- The sync is configured to run infrequently (e.g., daily) and the change has not yet been picked up
- The OU (Organisational Unit) filter in the sync configuration is not including the OU where the users are located
- The AD service account used by IMS to query AD has had its password changed, breaking authentication
- The sync is running but the user does not match the sync filter criteria (e.g., the new user is missing a required attribute like 'mail')

## Solutions

1. **Check the connection status**: Admin Console → Settings → Directory Sync → Connection Status. If it shows "Disconnected" or "Error", the sync service cannot reach the AD/LDAP server. Check network connectivity and firewall rules between IMS servers and the AD server.
2. **Run a manual sync**: Admin Console → Settings → Directory Sync → click "Sync Now". This forces an immediate sync rather than waiting for the scheduled cycle. Check the Results tab after the sync completes.
3. **Review the OU filter**: In Directory Sync settings, check the Base DN and OU filter values. Confirm they include the OU where the affected users are located. Consider expanding the filter to 'DC=yourdomain,DC=com' to include all OUs temporarily for testing.
4. **Update service account credentials**: If the AD service account password was changed, update it in Admin Console → Settings → Directory Sync → Connection Settings → Password. Test the connection after updating.
5. **Check sync filter criteria**: Review the sync filter (e.g., 'objectClass=user', '!userAccountControl:1.2.840.113556.1.4.803:=2'). Confirm new users pass this filter. Check if the new user account is enabled in AD.
6. **Review sync logs**: Directory Sync → Logs → check for warning or error entries related to specific users.

## Prevention

- Configure Directory Sync to run hourly for near-real-time user lifecycle management. Set up alerts for sync failures so issues are caught immediately.
`,
  },
  {
    id: 'KB-TS-040',
    title: 'Audit Trail Missing Entries',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['audit-trail', 'compliance', 'troubleshooting', 'data'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Audit Trail Missing Entries

## Symptom

When reviewing the audit trail for a record, an expected entry is missing. For example, a field was clearly changed (the new value is visible) but no audit trail entry shows who changed it or when. Alternatively, a bulk import or system process appears to have made changes with no corresponding audit trail record.

## Possible Causes

- The audit trail being reviewed is for the wrong record — the change may have been made to a linked or parent record
- The audit trail date range filter is excluding the date of the change
- The change was made by a system process (e.g., scheduled job, automated workflow, or API integration) which appears as "System" actor rather than a named user
- A bulk import or bulk edit operation consolidated multiple changes into a single "Bulk Operation" entry rather than individual field-level entries
- The audit trail view is filtered by user or action type and the relevant entry is being excluded

## Solutions

1. **Check the correct record's audit trail**: Open the specific record in question and navigate to its History or Audit Trail tab. Do not rely on a module-level audit log view which may show a subset of activity. Confirm you are on the correct record version.
2. **Widen the date range filter**: In the audit trail, expand the date range to cover a wider period. An entry may exist but be outside the currently selected time window.
3. **Look for system-generated entries**: If the change was made by an automated process, the actor will show as "System" with the process name (e.g., "Scheduled Workflow", "API Integration: ERP Sync"). Filter by actor "System" to see these entries.
4. **Check the bulk import log**: If data was imported via bulk import, the audit trail shows one "Bulk Import by [User]" entry rather than individual field changes. Navigate to Settings → Import History → find the relevant import → view the detail log for field-level information.
5. **Use the Organisation-Wide Audit Log**: Admin Console → Audit Log provides a comprehensive log of all activity across the entire organisation. Filter by module, user, action type, and date to find the specific event.
6. **Verify audit logging is enabled**: Admin Console → Settings → Security → Audit Logging → confirm audit logging is enabled for all record types.

## Prevention

- Regularly review the organisation audit log (Admin Console → Audit Log) as part of routine compliance monitoring to maintain familiarity with its full scope and search capabilities.
`,
  },
];
