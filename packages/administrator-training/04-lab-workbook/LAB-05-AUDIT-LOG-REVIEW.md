# LAB-05 — Mock Incident Investigation

**Module**: 5
**Duration**: 30 minutes
**Mode**: Live (hosted sandbox) + provided mock log data

---

## Scenario Brief

**URGENT — Security Incident Notice**

You have received an alert from your SIEM at 10:47 AM today. The alert reads:

> "Anomaly detected: User account `david.osei@nexara-training.io` (HS Manager) executed a data export of the entire HR records database at 10:31 AM from IP 185.220.101.44. This IP is associated with a Tor exit node."

You are the investigating administrator. Using only the IMS audit log, determine:

1. How did David's account gain access to the HR module? (He is HS_MANAGER — no HR access)
2. What data was exported?
3. Was this David acting maliciously, or was his account compromised?
4. What is the full attack timeline?

---

## Mock Audit Log Data

*In the hosted sandbox, navigate to Audit Log and filter as instructed. In scenario-based mode, use the data below.*

### Extract 1: David Osei's activity — last 24 hours

```
[09:45:22] AUTH_LOGIN_SUCCESS | actor: david.osei@ | IP: 192.168.1.45 | session: sess_A1B2
[09:46:03] DATA_CREATED       | actor: david.osei@ | target: Incident INC-2026-033 | session: sess_A1B2
[09:52:17] AUTH_LOGOUT        | actor: david.osei@ | IP: 192.168.1.45 | session: sess_A1B2

[10:28:54] AUTH_LOGIN_SUCCESS | actor: david.osei@ | IP: 185.220.101.44 | session: sess_C3D4
[10:29:11] ROLE_ASSIGNED      | actor: david.osei@ | target: david.osei@ | role: HR_MANAGER | session: sess_C3D4
[10:30:02] DATA_EXPORTED      | actor: david.osei@ | target: Module: HR | records: 200 | session: sess_C3D4
[10:30:45] PERMISSION_OVERRIDE | actor: david.osei@ | target: david.osei@ | namespace: hr | level: ADMIN | session: sess_C3D4
[10:31:12] DATA_EXPORTED      | actor: david.osei@ | target: Module: HR | records: 200 | format: CSV | session: sess_C3D4
[10:32:01] AUTH_LOGOUT        | actor: david.osei@ | IP: 185.220.101.44 | session: sess_C3D4
```

### Extract 2: Authentication events — filtered for failures before incident

```
[10:15:33] AUTH_LOGIN_FAILURE | actor: david.osei@ | IP: 185.220.101.44 | reason: WRONG_PASSWORD
[10:16:01] AUTH_LOGIN_FAILURE | actor: david.osei@ | IP: 185.220.101.44 | reason: WRONG_PASSWORD
[10:16:29] AUTH_LOGIN_FAILURE | actor: david.osei@ | IP: 185.220.101.44 | reason: WRONG_PASSWORD
[10:16:58] AUTH_MFA_CHALLENGE | actor: david.osei@ | IP: 185.220.101.44
[10:17:12] AUTH_MFA_FAILURE   | actor: david.osei@ | IP: 185.220.101.44
[10:17:41] AUTH_MFA_SUCCESS   | actor: david.osei@ | IP: 185.220.101.44
[10:28:54] AUTH_LOGIN_SUCCESS | actor: david.osei@ | IP: 185.220.101.44 | session: sess_C3D4
```

---

## Investigation Tasks

### Task 1: Build the Attack Timeline (10 min)

Using the log data, construct a timeline of events:

| Time | Event | Significance |
|------|-------|-------------|
| | | |
| | | |
| | | |
| | | |
| | | |

### Task 2: Answer the Investigation Questions (10 min)

**Q1: How did the attacker gain access to the HR module?**

*Hint: Look at the ROLE_ASSIGNED and PERMISSION_OVERRIDE events.*

Your answer: _______________________________________________
_______________________________________________

**Q2: What data was taken?**

Your answer: _______________________________________________

**Q3: Was this David or an attacker?**

*Evidence for account compromise:*
_______________________________________________

*Evidence that rules out David:*
_______________________________________________

**Q4: The MFA was bypassed. How?**

*Hint: Look at the MFA failure then success pattern.*

Your answer: _______________________________________________

### Task 3: Containment Actions (10 min)

What are the immediate steps you would take RIGHT NOW?

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________
4. _______________________________________________

In the sandbox, take at least 2 of these actions and record what you did.

---

## Debrief

The facilitator will reveal:
- The full attack chain (credential stuffing + MFA bypass by SIM-swap)
- The data that was at risk
- The correct containment sequence
- Regulatory notification requirements (GDPR: 72-hour notification if HR data = personal data)
