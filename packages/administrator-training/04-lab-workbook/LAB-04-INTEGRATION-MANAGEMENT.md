# LAB-04 — API Key Lifecycle & Webhook Test

**Module**: 4
**Duration**: 25 minutes
**Mode**: Live (hosted sandbox)

---

## Scenario

Your organisation is integrating the IMS with two external systems:
1. A Power BI dashboard that needs read-only access to incident and risk data
2. A Slack channel that should receive real-time notifications when critical incidents are created

---

## Part A: API Key Lifecycle (12 min)

### Step 1: Create a Scoped API Key

1. Navigate to **Admin Console → Integrations → API Keys → New Key**
2. Configure:
   - Name: `powerbi-incidents-ro`
   - Scopes: `read:incidents read:risk` (minimum required)
   - Expiry: 365 days from today
   - IP Allow List: `10.0.0.0/8` (simulated Power BI server range)
   - Rate Limit: 60 req/min
3. Copy the key (shown only once)

### Step 2: Test the API Key

```bash
# Test read access to incidents
curl -H "Authorization: Bearer {YOUR_API_KEY}" \
  https://training-{cohortId}.nexara.io/api/incidents

# Expected: 200 OK with incident list

# Test that write is blocked
curl -X POST \
  -H "Authorization: Bearer {YOUR_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}' \
  https://training-{cohortId}.nexara.io/api/incidents

# Expected: 403 Forbidden (scope not granted)
```

**Record results:**

| Test | Expected | Actual | Pass/Fail |
|------|---------|--------|-----------|
| GET incidents | 200 OK | | |
| POST incidents | 403 Forbidden | | |

### Step 3: Rotate the Key

Simulate a key rotation (as if the key was suspected of being compromised):

1. Generate a new key: `powerbi-incidents-ro-v2` (same config)
2. [Simulate] Update the consuming application with the new key
3. Verify the new key works (Step 2 test with new key)
4. Revoke the original key: **API Keys → [original key] → Revoke**
5. Verify the original key is rejected: test with original key → expect 401

---

## Part B: Webhook Registration & Test (13 min)

### Step 1: Register a Webhook

1. Navigate to **Admin Console → Integrations → Webhooks → New Webhook**
2. Configure:
   - Name: `slack-critical-incidents`
   - URL: `https://training-{cohortId}.nexara.io/lab/webhook-receiver`
   - Events: `incident.created`, `incident.severity_changed`
   - Secret: (auto-generated — copy for verification)
3. Save webhook

### Step 2: Test Fire

1. Click **Test Fire** on the webhook
2. Navigate to the webhook receiver log: `https://training-{cohortId}.nexara.io/lab/webhook-receiver/logs`
3. Confirm:
   - Payload received
   - `X-Nexara-Signature` header present
   - `event` field = `test`

### Step 3: Trigger a Real Event

1. Navigate to **Health & Safety → Incidents → New Incident**
2. Create an incident with Severity: CRITICAL
3. Return to webhook receiver logs
4. Confirm `incident.created` event was delivered
5. Verify the HMAC-SHA256 signature:

```javascript
const crypto = require('crypto');
const received_sig = 'sha256=...'; // from X-Nexara-Signature header
const payload = '...'; // raw body from logs
const expected = 'sha256=' + crypto
  .createHmac('sha256', 'YOUR_WEBHOOK_SECRET')
  .update(payload)
  .digest('hex');
console.log('Valid:', received_sig === expected);
```

### Step 4: Integration Audit

Navigate to **Admin Console → Integrations → Export CSV**

Review the export and identify any red flags:
- Any keys without expiry? (Should be zero after your cleanup)
- Any webhooks with failure rates > 20%?
- Any inactive webhooks?

**Record findings:**
_______________________________________________
_______________________________________________
