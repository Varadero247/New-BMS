# Slide Deck Outline — Module 2: Role & Permission Configuration

**Slides**: ~28
**Duration**: 90 minutes

---

## Slide Structure

| # | Slide Title | Type | Key Content |
|---|-------------|------|-------------|
| 1 | Module 2: Role & Permission Configuration | Title | Module objectives |
| 2 | Opening Hook | Quote | "Hands up if someone in your org has admin rights they shouldn't still have..." |
| 3 | RBAC Architecture | Diagram | User → Role(s) → Permissions → Module Namespace → Permission Level |
| 4 | The 7 Permission Levels | Pyramid | 0=None → 6=Admin; cumulative model; "You can't have EDIT without VIEW" |
| 5 | Permission Level Deep Dive | Animated table | Level / Name / Cumulative capabilities |
| 6 | 17 Module Namespaces | Grid | All 17 namespaces listed in 3 columns |
| 7 | Platform Roles (4) | Role cards | SUPER_ADMIN / ORG_ADMIN / MODULE_ADMIN / AUDITOR with badge colours |
| 8 | Governance & Compliance Roles (6) | Role cards | HS_MANAGER / QUALITY_MANAGER / RISK_MANAGER etc. |
| 9 | Operational Roles (10) | Role table | Full table of 10 operational roles |
| 10 | Specialist Roles (10) | Role table | Full table of 10 specialist roles |
| 11 | Viewer & External Roles (9) | Role table | VIEWER / COMMENTER / EMPLOYEE / CONTRACTOR / external roles |
| 12 | Example: HS_MANAGER Permissions | Permission matrix | Namespace / Level for HS_MANAGER (ADMIN on health_safety, EDIT on risk, etc.) |
| 13 | Example: AUDITOR Permissions | Permission matrix | VIEW on all 17 namespaces; export enabled |
| 14 | Multi-Role Users | Scenario | Alice: VIEWER + HS_MANAGER → effective permissions diagram |
| 15 | Role Inheritance Explained | Venn diagram | Most permissive wins per namespace |
| 16 | Custom Role Creation | Screenshot | Admin console new role form with fields |
| 17 | When to Create Custom Roles | Decision tree | "Does a predefined role fit?" → Yes: use it. No: document justification + create |
| 18 | Temporary Access Grants | Timeline graphic | Grant → Access period → Auto-revocation → Audit log |
| 19 | DENY Override | Warning slide | Use sparingly; document every DENY; creates invisible complexity |
| 20 | DENY Override: Example | Before/after | Role grants EDIT → DENY override → effective: NONE |
| 21 | Least-Privilege Audit: Process | Flowchart | Export → filter elevated → verify → downgrade/remove → document |
| 22 | Least-Privilege Audit: Red Flags | Red-flagged list | SUPER_ADMIN >2 users; ADMIN on platform for non-IT; external roles with CREATE+ |
| 23 | Module 2: Key Takeaways | Summary | 6 takeaways |
| 24 | LAB-02: Role Matrix Design Exercise | Lab slide | Meridian Manufacturing scenario brief; 25 minutes; group exercise |
| 25–28 | [Appendix] Full 39-Role Reference | Reference | Complete role table; default permission matrices |
