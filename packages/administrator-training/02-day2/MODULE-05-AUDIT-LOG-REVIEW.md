# Module 5 — Audit Log Review

**Duration**: 90 minutes
**Position**: Day 2, 09:00–10:30
**CPD Hours**: 1.5

---

## Learning Objectives

1. Describe the IMS audit architecture including event ingestion, storage, and tamper-evidence
2. Classify audit events using the IMS event taxonomy (5 categories, 47 event types)
3. Filter audit logs to isolate specific user actions within a time window
4. Investigate a simulated security incident using only audit log data
5. Export audit data in CSV and JSON formats for regulatory reporting

---

## 1. Audit Architecture

The IMS audit subsystem is a tamper-evident, append-only log of all system activity. It is the authoritative record for security investigations, compliance reporting, and change management.

### Design Principles

| Principle | Implementation |
|-----------|---------------|
| **Append-only** | No audit events can be modified or deleted by any user including SUPER_ADMIN |
| **Tamper-evident** | SHA-256 chained hashing (each event hash includes the prior event hash) |
| **Real-time** | Events written synchronously before the operation completes |
| **Retention** | 7 years (ISO 27001 Annex A 8.15; GDPR Article 30) |
| **Immutable storage** | Separate database schema; no FK to mutable tables |

### Event Ingestion Flow

```
User action → [Application layer]
                    ↓
              Audit event generated
                    ↓
              [Audit service]
                    ↓
              Hash computed (SHA-256 chain)
                    ↓
              Written to audit DB (append-only)
                    ↓
              Optional: forwarded to SIEM
```

---

## 2. Audit Event Schema

Every audit event contains:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | UUID | Unique event ID | `evt_01HXYZ` |
| `timestamp` | ISO 8601 | When the event occurred | `2026-02-28T09:00:00Z` |
| `actor` | Object | Who performed the action | `{ "userId": "usr_ABC", "email": "alice@example.com", "ip": "10.0.1.5" }` |
| `action` | String | Event type identifier | `USER_DEACTIVATED` |
| `target` | Object | What was acted on | `{ "type": "User", "id": "usr_DEF", "name": "Bob Jones" }` |
| `outcome` | Enum | `SUCCESS` or `FAILURE` | `SUCCESS` |
| `sessionId` | String | Authentication session | `sess_XYZ` |
| `metadata` | Object | Action-specific details | `{ "reason": "leaver", "previousRole": "ORG_ADMIN" }` |
| `hash` | SHA-256 | Tamper-evident chain hash | `a3f2b...` |

---

## 3. Event Taxonomy

### Category 1: Authentication (`AUTH`)

| Event | Description |
|-------|-------------|
| `AUTH_LOGIN_SUCCESS` | Successful login |
| `AUTH_LOGIN_FAILURE` | Failed login attempt |
| `AUTH_LOGOUT` | User logged out |
| `AUTH_MFA_CHALLENGE` | MFA challenge issued |
| `AUTH_MFA_SUCCESS` | MFA passed |
| `AUTH_MFA_FAILURE` | MFA failed |
| `AUTH_TOKEN_ISSUED` | JWT issued |
| `AUTH_TOKEN_REVOKED` | JWT revoked |
| `AUTH_SAML_SSO_INITIATED` | SAML SSO initiated |
| `AUTH_SAML_SSO_SUCCESS` | SAML SSO completed |
| `AUTH_PASSWORD_RESET` | Password reset requested |

### Category 2: Data (`DATA`)

| Event | Description |
|-------|-------------|
| `DATA_CREATED` | Record created |
| `DATA_UPDATED` | Record modified |
| `DATA_DELETED` | Record soft-deleted |
| `DATA_ARCHIVED` | Record archived |
| `DATA_EXPORTED` | Data exported |
| `DATA_BULK_IMPORT` | Bulk data imported |
| `DATA_BULK_DELETE` | Bulk records deleted |

### Category 3: Administration (`ADMIN`)

| Event | Description |
|-------|-------------|
| `USER_CREATED` | User account created |
| `USER_UPDATED` | User profile updated |
| `USER_DEACTIVATED` | User deactivated |
| `USER_DELETED` | User hard-deleted |
| `ROLE_ASSIGNED` | Role granted to user |
| `ROLE_REMOVED` | Role revoked from user |
| `PERMISSION_OVERRIDE` | Explicit permission override set |
| `MODULE_ACTIVATED` | Module activated |
| `MODULE_DEACTIVATED` | Module deactivated |
| `ORG_SETTINGS_CHANGED` | Organisation settings modified |
| `PASSWORD_POLICY_CHANGED` | Password policy updated |

### Category 4: Integration (`INTEGRATION`)

| Event | Description |
|-------|-------------|
| `API_KEY_CREATED` | API key generated |
| `API_KEY_ROTATED` | API key rotated |
| `API_KEY_REVOKED` | API key revoked |
| `API_KEY_USED` | API key used in request (sampled 1%) |
| `OAUTH_CLIENT_CREATED` | OAuth client created |
| `OAUTH_TOKEN_ISSUED` | OAuth token issued |
| `SAML_CONFIG_UPDATED` | SAML configuration changed |
| `WEBHOOK_CREATED` | Webhook registered |
| `WEBHOOK_FIRED` | Webhook delivery attempted |
| `SCIM_USER_CREATE` | SCIM user provisioned |
| `SCIM_USER_DEACTIVATE` | SCIM user deprovisioned |
| `SCIM_AUTH_FAILED` | SCIM authentication failure |

### Category 5: System (`SYSTEM`)

| Event | Description |
|-------|-------------|
| `BACKUP_COMPLETED` | Backup job completed |
| `BACKUP_FAILED` | Backup job failed |
| `RESTORE_INITIATED` | Restore operation started |
| `RESTORE_COMPLETED` | Restore operation completed |
| `UPDATE_APPLIED` | Platform update deployed |
| `UPDATE_ROLLED_BACK` | Update rolled back |
| `FEATURE_FLAG_CHANGED` | Feature flag toggled |
| `ALERT_TRIGGERED` | System alert fired |

---

## 4. Navigating the Audit Log

**Path**: Admin Console → Audit Log

### Filter Options

| Filter | Values | Use Case |
|--------|--------|----------|
| **Actor** | User email or ID | "What did Alice do?" |
| **Date range** | From–To datetime | "What happened last Tuesday?" |
| **Category** | AUTH, DATA, ADMIN, INTEGRATION, SYSTEM | "Show me all auth events" |
| **Event type** | Specific event identifier | "Show me all role assignments" |
| **Outcome** | SUCCESS, FAILURE | "Show me all failed logins" |
| **Target** | Object type + ID | "Who modified this record?" |
| **IP address** | Exact IP or CIDR | "What did this IP address do?" |

### Saved Filters

Frequently-used filter combinations can be saved as named filters:
- `Login failures - last 24h` (AUTH_LOGIN_FAILURE, last 24 hours)
- `Admin changes this week` (ADMIN category, this week)
- `API key usage` (API_KEY_USED, last 30 days)

---

## 5. Export Formats

### CSV Export
```
timestamp,actor_email,actor_ip,action,target_type,target_id,outcome
2026-02-28T09:00:00Z,alice@example.com,10.0.1.5,USER_DEACTIVATED,User,usr_DEF,SUCCESS
```

Best for: Excel analysis, compliance reports, audit committees.

### JSON Export
```json
{
  "events": [
    {
      "id": "evt_01HXYZ",
      "timestamp": "2026-02-28T09:00:00Z",
      "actor": {"email": "alice@example.com", "ip": "10.0.1.5"},
      "action": "USER_DEACTIVATED",
      "target": {"type": "User", "id": "usr_DEF"},
      "outcome": "SUCCESS"
    }
  ],
  "total": 1,
  "exported_at": "2026-02-28T10:00:00Z"
}
```

Best for: SIEM ingestion, programmatic analysis, API-based reporting.

### SIEM Integration

Events can be forwarded in real-time to:
- **Splunk**: HTTP Event Collector (HEC)
- **Azure Sentinel**: REST API connector
- **IBM QRadar**: Log Source Universal REST API
- **Generic SIEM**: Syslog (RFC 5424) or webhook

**Path**: Admin Console → Integrations → SIEM → Configure

---

## 6. Compliance Reports

The audit subsystem generates pre-built compliance reports:

| Report | Standard | Contents |
|--------|---------|---------|
| Access Review Report | ISO 27001 A.9.2 | User access changes; role assignments; last login |
| Privileged Action Report | ISO 27001 A.9.4 | Admin actions; permission overrides |
| Data Export Report | GDPR Article 30 | All data export events; by user; by date |
| Authentication Report | SOC 2 CC6.1 | Login history; MFA usage; failure rates |
| Change Management Report | ISO 27001 A.12.1 | System changes; updates; config changes |

**Path**: Admin Console → Audit Log → Compliance Reports

---

## 7. Tamper-Evidence Verification

The audit log uses SHA-256 chained hashing to detect tampering:

```
hash(event_N) = SHA256(event_N_data + hash(event_N-1))
```

**To verify integrity:**
Admin Console → Audit Log → Verify Integrity → [Select date range] → Run Verification

A successful verification confirms no events have been modified or deleted. A failed verification triggers an immediate security alert.

---

## Module 5 Summary

| Topic | Key Takeaway |
|-------|-------------|
| Architecture | Append-only, tamper-evident, 7-year retention |
| Event schema | timestamp, actor, action, target, outcome, hash |
| Taxonomy | 5 categories, 47 event types |
| Filtering | Actor, date, category, event type, outcome, IP |
| Export | CSV (compliance) + JSON (SIEM) |
| Compliance reports | Pre-built: ISO 27001, GDPR, SOC 2 |

---

*Proceed to LAB-05 for the mock incident investigation.*
