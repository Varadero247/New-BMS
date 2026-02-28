# Module 4 — Integration Management

**Duration**: 90 minutes
**Position**: Day 1, 14:45–16:15
**CPD Hours**: 1.5

---

## Learning Objectives

1. Generate API keys with appropriate scope, expiry, and IP restrictions
2. Configure an OAuth 2.0 client with correct redirect URIs and scopes
3. Implement SAML 2.0 SSO with metadata exchange and attribute mapping
4. Register and validate a webhook with HMAC-SHA256 verification
5. Audit the integration inventory for security issues

---

## 1. Integration Overview

The IMS supports four types of external integrations:

| Type | Use Case | Auth Method |
|------|----------|-------------|
| **API Keys** | Programmatic access; scripts; third-party apps | Bearer token |
| **OAuth 2.0** | User-delegated apps; dashboards; BI tools | Authorization Code or Client Credentials |
| **SAML 2.0 SSO** | Single sign-on from corporate IdP | SAML assertions |
| **Webhooks** | Real-time event push to external endpoints | HMAC-SHA256 signed payload |

All integrations are managed at:
**Admin Console → Settings → Integrations**

---

## 2. API Key Management

### Generating an API Key

**Path**: Admin Console → Integrations → API Keys → New Key

**Configuration fields:**

| Field | Description | Recommendation |
|-------|-------------|----------------|
| `name` | Human-readable identifier | Include system name + purpose: `powerbi-dashboard-ro` |
| `scope` | Space-separated list of permitted scopes | Minimum required scopes only |
| `expiry` | Date key expires (max 365 days) | Set expiry; never create non-expiring keys |
| `ipAllowList` | CIDR ranges allowed to use this key | Restrict to known IP ranges |
| `rateLimit` | Requests per minute | Default: 100/min; increase if needed |

### Available Scopes

| Scope | Permission |
|-------|-----------|
| `read:all` | Read all module data |
| `write:all` | Create and update all module data |
| `read:health-safety` | Read H&S module only |
| `write:incidents` | Create/update incidents only |
| `read:users` | List users |
| `admin:users` | Create, update, deactivate users |
| `admin:integrations` | Manage integrations |
| `read:audit-log` | Export audit log |

**Best practice**: Never use `write:all` or `read:all` unless specifically required. Grant minimum required scopes.

### API Key Lifecycle

```
Generate → [Active]
              ↓ (at expiry or manual revoke)
           [Revoked]
              ↓ (admin rotates)
         New key generated → [Active]
```

**Rotation procedure:**
1. Generate new key (keep old key active)
2. Update the consuming application with the new key
3. Verify the application is using the new key (check audit log)
4. Revoke the old key

**Revocation path**: Admin Console → Integrations → API Keys → [Key] → Revoke

---

## 3. OAuth 2.0 Integration

### Supported Flows

| Flow | Use Case |
|------|----------|
| **Client Credentials** | Server-to-server; no user interaction; dashboards |
| **Authorization Code + PKCE** | User-delegated apps; browser-based |

### Creating an OAuth 2.0 Client

**Path**: Admin Console → Integrations → OAuth Clients → New Client

**Fields:**

| Field | Example |
|-------|---------|
| `clientName` | `PowerBI Integration` |
| `redirectUris` | `https://app.powerbi.com/callback` |
| `grantTypes` | `authorization_code`, `client_credentials` |
| `scopes` | `read:all openid profile email` |
| `tokenExpiry` | 3600 (1 hour; access token) |
| `refreshTokenExpiry` | 86400 (24 hours) |

### Token Endpoints

| Endpoint | URL |
|----------|-----|
| Authorization | `/api/auth/oauth/authorize` |
| Token | `/api/auth/oauth/token` |
| UserInfo | `/api/auth/oauth/userinfo` |
| Revoke | `/api/auth/oauth/revoke` |

### Client Credentials Example

```bash
curl -X POST https://your-instance.nexara.io/api/auth/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "scope=read:all"
```

Response:
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "read:all"
}
```

---

## 4. SAML 2.0 Single Sign-On

### Architecture

```
User → [IdP] → SAML Assertion → [IMS SP] → Authenticated session
```

- **IdP (Identity Provider)**: Azure AD, Okta, Google, ADFS
- **SP (Service Provider)**: Nexara IMS
- **Binding**: HTTP-POST (both IdP-initiated and SP-initiated)

### Configuration Steps

#### Step 1: Obtain IMS SP Metadata

**Path**: Admin Console → Integrations → SAML SSO → SP Metadata

Download or copy the metadata XML. The key values:
- **Entity ID (Issuer)**: `https://your-instance.nexara.io/saml/metadata`
- **ACS URL**: `https://your-instance.nexara.io/saml/callback`
- **Name ID Format**: `urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress`

#### Step 2: Configure IdP Application

In your IdP, create a new SAML application and provide:
- **Entity ID**: `https://your-instance.nexara.io/saml/metadata`
- **ACS URL**: `https://your-instance.nexara.io/saml/callback`
- **Name ID**: user's email address

#### Step 3: Attribute Mapping

| SAML Attribute | IMS Field |
|----------------|-----------|
| `NameID` (email) | `email` |
| `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname` | `firstName` |
| `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname` | `lastName` |
| `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/groups` | IMS role mapping |
| `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/department` | `department` |

#### Step 4: Upload IdP Metadata

**Path**: Admin Console → Integrations → SAML SSO → Upload IdP Metadata

Paste the IdP metadata XML or provide the metadata URL for auto-refresh.

#### Step 5: Group → Role Mapping

| IdP Group | IMS Role |
|-----------|---------|
| `SG-IMS-Admins` | `ORG_ADMIN` |
| `SG-IMS-HSManagers` | `HS_MANAGER` |
| `SG-IMS-Viewers` | `VIEWER` |

#### Step 6: Test SSO

Click **Test SSO** in the admin console. This opens a new browser tab and initiates an SP-initiated SSO flow. Verify:
- ✓ Redirect to IdP login page
- ✓ Authentication completes
- ✓ Return to IMS with user session established
- ✓ User profile shows correct name, email, role

---

## 5. Webhook Configuration

### What are Webhooks?

Webhooks allow the IMS to push real-time event notifications to external systems (e.g., Slack, Teams, custom applications, ITSM tools).

### Creating a Webhook

**Path**: Admin Console → Integrations → Webhooks → New Webhook

**Fields:**

| Field | Description | Example |
|-------|-------------|---------|
| `name` | Identifier | `slack-incidents-channel` |
| `url` | Target HTTPS endpoint | `https://hooks.slack.com/services/...` |
| `events` | Selected event types | `incident.created`, `incident.severity_changed` |
| `secret` | HMAC-SHA256 signing secret | Auto-generated 32-byte hex |
| `active` | Enable/disable | `true` |
| `retryPolicy` | Retry on failure | `exponential`, 3 attempts |

### Available Webhook Events

| Category | Events |
|----------|--------|
| Users | `user.created`, `user.deactivated`, `user.role_changed` |
| Incidents | `incident.created`, `incident.updated`, `incident.closed` |
| Audits | `audit.scheduled`, `audit.completed`, `audit.finding_added` |
| Risk | `risk.created`, `risk.status_changed`, `risk.overdue` |
| Documents | `document.published`, `document.revision_due` |
| Platform | `module.activated`, `module.deactivated`, `api_key.expiring` |

### Payload Format

```json
{
  "id": "evt_01HXYZ123456",
  "event": "incident.created",
  "timestamp": "2026-02-28T09:00:00Z",
  "data": {
    "incidentId": "INC-2026-001",
    "title": "Chemical spill in Warehouse B",
    "severity": "MAJOR",
    "reportedBy": "alice@example.com"
  }
}
```

### HMAC-SHA256 Verification

Every webhook payload is signed. The `X-Nexara-Signature` header contains:
```
sha256=HMAC_SHA256(secret, raw_body)
```

**Verification (Node.js example):**
```javascript
const crypto = require('crypto');
const signature = req.headers['x-nexara-signature'];
const expectedSignature = 'sha256=' + crypto
  .createHmac('sha256', webhookSecret)
  .update(req.rawBody)
  .digest('hex');

if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
  throw new Error('Invalid signature');
}
```

### Webhook Test Fire

After creating a webhook, use **Test Fire** to send a sample payload and verify the endpoint is reachable and responding with HTTP 200.

### Delivery & Retry

| Scenario | Behaviour |
|----------|-----------|
| HTTP 200 response | Delivery confirmed; logged as `DELIVERED` |
| HTTP 4xx response | No retry; logged as `FAILED` (client error) |
| HTTP 5xx or timeout | Retry after: 1 min, 5 min, 30 min; then `FAILED` |
| All retries failed | Admin Console alert; email notification to org admin |

---

## 6. Integration Inventory Audit

Perform quarterly:

1. Export integration list: Admin Console → Integrations → Export CSV
2. Review for:

| Issue | Action |
|-------|--------|
| API keys expired or expiring in < 30 days | Rotate |
| API keys with `write:all` or `admin:*` scopes | Scope-down or justify |
| API keys with no expiry date | Set expiry date |
| OAuth clients with unused scopes | Remove scopes |
| SAML IdPs with expired metadata | Re-upload |
| Webhooks with > 20% failure rate | Investigate endpoint |
| Inactive webhooks (0 deliveries in 90 days) | Delete |

---

## Module 4 Summary

| Topic | Key Takeaway |
|-------|-------------|
| API Keys | Minimum scope; set expiry; IP restrict; rotate annually |
| OAuth 2.0 | Client Credentials for server-to-server; Auth Code + PKCE for users |
| SAML 2.0 | Metadata exchange → attribute mapping → test → group-role mapping |
| Webhooks | Event push; HMAC-SHA256 signed; verify on receipt |
| Audit | Quarterly: rotate expiring, scope-down overpermissioned, remove inactive |

---

*Proceed to LAB-04 for hands-on API key lifecycle and webhook testing.*
