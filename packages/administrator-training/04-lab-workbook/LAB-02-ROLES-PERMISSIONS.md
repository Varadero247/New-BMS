# LAB-02 — Role Matrix Design Exercise

**Module**: 2
**Duration**: 25 minutes
**Mode**: Group exercise (3–4 participants per group)

---

## Scenario

**Organisation**: Meridian Manufacturing Ltd.
**Size**: 200 employees
**Industry**: Automotive components manufacturing
**IMS modules active**: Health & Safety, Quality, Environment, Inventory, HR, Workflows, Risk, Documents, Audits

**Context**: Meridian is going live with the IMS next month. The IT Manager has been asked to design the role assignment matrix. You are the consulting administrator.

---

## The People

| Name | Job Title | Department | IMS responsibilities |
|------|-----------|-----------|----------------------|
| Amanda Wright | IT Manager | IT | System owner; full admin |
| David Osei | HSE Manager | Health & Safety | Manages all H&S activities |
| Karen Booth | Quality Manager | Quality | ISO 9001 lead; internal audits |
| Robert Chan | Finance Director | Finance | Read access to dashboards only |
| Lena Müller | HR Manager | HR | HR module; manages training records |
| Carlos Rivera | Maintenance Supervisor | Operations | CMMS only; raises work orders |
| Priya Shah | Internal Auditor | Compliance | All modules read-only; exports |
| Tom Bell | External Auditor | External | Quarterly access; compliance data only |
| 15 × Production Operators | Operator | Production | Report incidents; view their training |

---

## Task 1: Role Assignment (10 min)

For each person above, assign the most appropriate predefined IMS role. Where no predefined role fits perfectly, note that a custom role may be needed and describe what permissions it would require.

| Name | Assigned Role | Reasoning |
|------|--------------|-----------|
| Amanda Wright | | |
| David Osei | | |
| Karen Booth | | |
| Robert Chan | | |
| Lena Müller | | |
| Carlos Rivera | | |
| Priya Shah | | |
| Tom Bell | | |
| Production Operators | | |

---

## Task 2: Least-Privilege Check (10 min)

Review your completed role matrix. For each assignment, answer:

1. **Does this role grant access to modules the person doesn't need?**
   - If yes: can you use a more restricted predefined role, or is a custom role needed?

2. **Does any external party (Tom Bell) have CREATE or higher permissions?**
   - If yes: correct this.

3. **How would you handle Tom Bell's quarterly access?**
   - What IMS feature enables time-limited access?

4. **What is the risk of assigning Amanda Wright as the only SUPER_ADMIN?**
   - How would you mitigate this?

---

## Task 3: Custom Role Specification (5 min)

Carlos Rivera (Maintenance Supervisor) only needs to:
- Create and update work orders in the CMMS module
- View equipment records
- No access to any other modules

No predefined role exactly matches this. Specify the custom role:

| Field | Your specification |
|-------|-------------------|
| Role name | |
| Identifier | |
| Description | |
| `cmms` namespace permission level | |
| All other namespaces | |
| Business justification | |

---

## Group Presentation

Each group presents their **top 3 most important decisions** from this exercise. Include:
- What role you assigned and why
- Any least-privilege concerns you identified
- How you resolved conflicts

**3 minutes per group.**

---

## Debrief Questions (Facilitator-led)

1. Did any group assign SUPER_ADMIN to Amanda Wright? Why might that be a mistake even though she's the IT Manager?
2. How did groups handle Tom Bell's quarterly external access?
3. Did any group create more than 2 custom roles? Is that a red flag?
