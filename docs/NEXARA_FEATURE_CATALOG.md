# NEXARA IMS PLATFORM — FEATURE CATALOG

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---

## Complete Business Capabilities Matrix

**Document Version:** 1.0
**Last Updated:** February 21, 2026
**Total Endpoints:** 2,558 across 42 microservices

---

## TABLE OF CONTENTS

1. [Quality Management (ISO 9001)](#1-quality-management-iso-90012015)
2. [Health & Safety (ISO 45001)](#2-health--safety-iso-450012018)
3. [Environmental Management (ISO 14001)](#3-environmental-management-iso-140012015)
4. [Automotive Quality (IATF 16949)](#4-automotive-quality-iatf-169492016)
5. [Medical Devices (ISO 13485)](#5-medical-devices-iso-134852016--21-cfr-part-820)
6. [Aerospace (AS9100D)](#6-aerospace-quality-as9100d--en91002018)
7. [Food Safety (ISO 22000 / HACCP)](#7-food-safety-iso-220002018--haccp)
8. [Energy Management (ISO 50001)](#8-energy-management-iso-500012018)
9. [ESG Reporting](#9-esg-reporting)
10. [Information Security (ISO 27001)](#10-information-security-iso-270012022)
11. [Risk Management](#11-risk-management-iso-310002018)
12. [Finance & Compliance](#12-finance--compliance)
13. [Human Resources](#13-human-resources)
14. [Payroll](#14-payroll)
15. [CRM](#15-crm-customer-relationship-management)
16. [Inventory](#16-inventory)
17. [Workflows](#17-workflows)
18. [Project Management](#18-project-management)
19. [Field Service](#19-field-service)
20. [CMMS (Maintenance)](#20-cmms-computerized-maintenance-management)
21. [Documents](#21-27-supporting-modules)
22. [Contracts](#contracts-port-4033)
23. [Complaints](#complaints-port-4032)
24. [Suppliers](#suppliers-port-4029)
25. [Assets](#assets-port-4030)
26. [Training](#training-port-4028)
27. [Audits](#audits-port-4037)
28. [Chemicals / COSHH](#28-chemicals--coshh)
29. [Emergency Management](#29-emergency-management)
30. [ISO 42001 (AI Management)](#30-42-additional-modules)
31. [ISO 37001 (Anti-Bribery)](#iso-37001--anti-bribery-port-4024)
32. [Analytics & BI](#analytics--bi-port-4021)
33. [AI Analysis](#ai-analysis-port-4004)
34. [Portal (Customer / Supplier)](#portal--customer--supplier-port-4018)
35. [Partners](#partners-port-4026)
36. [Marketing](#marketing-port-4025)
37. [Regulatory Monitor](#regulatory-monitor-port-4035)
38. [Permit to Work](#permit-to-work-port-4034)
39. [Management Review](#management-review-port-4038)
40. [Incidents (RIDDOR)](#incidents-riddor--port-4036)
41. [API Gateway (Platform Features)](#platform-features-api-gateway--port-4000)
42. [Cross-Cutting Platform Features](#security--governance)

---

## 1. QUALITY MANAGEMENT (ISO 9001:2015)

**Service:** `api-quality` | **Port:** 4003 | **Web:** `web-quality` (port 3003, 39 pages)
**Schema:** `quality.prisma` — 44 models, 95 enums

### Features & Endpoints

#### Non-Conformances (NCR)
- `GET    /api/quality/nonconformances` — List NCRs (paginated, filterable by severity/status/source)
- `POST   /api/quality/nonconformances` — Create NCR
- `GET    /api/quality/nonconformances/:id` — Get NCR with full details
- `PUT    /api/quality/nonconformances/:id` — Update NCR
- `DELETE /api/quality/nonconformances/:id` — Delete NCR (soft)
- `GET    /api/quality/nonconformances/overdue` — Overdue NCRs
- `GET    /api/quality/nonconformances/stats` — NCR statistics

#### CAPA (Corrective & Preventive Actions)
- `GET    /api/quality/capa` — List CAPAs
- `POST   /api/quality/capa` — Create CAPA
- `GET    /api/quality/capa/:id` — Get CAPA with actions
- `PUT    /api/quality/capa/:id` — Update CAPA
- `DELETE /api/quality/capa/:id` — Delete CAPA
- `POST   /api/quality/capa/:id/actions` — Add action to CAPA
- `PUT    /api/quality/capa/:id/actions/:actionId` — Update CAPA action

#### Documents
- `GET    /api/quality/documents` — List controlled documents
- `POST   /api/quality/documents` — Upload/create document
- `GET    /api/quality/documents/:id` — Get document
- `PUT    /api/quality/documents/:id` — Update/revise document
- `DELETE /api/quality/documents/:id` — Delete document
- `GET    /api/quality/documents/:id/download` — Download file

#### Audits
- `GET    /api/quality/audits` — List audits
- `POST   /api/quality/audits` — Create audit
- `GET    /api/quality/audits/:id` — Get audit details with findings
- `PUT    /api/quality/audits/:id` — Update audit
- `DELETE /api/quality/audits/:id` — Delete audit

#### Risk Register
- `GET    /api/quality/risk-register` — Quality risk register
- `POST   /api/quality/risk-register` — Create risk entry
- `GET    /api/quality/risk-register/:id` — Risk details
- `PUT    /api/quality/risk-register/:id` — Update risk
- `GET    /api/quality/risk-register/heatmap` — Risk heat map data

#### Risks (Opportunity/Risk per ISO 9001 Clause 6.1)
- `GET    /api/quality/risks` — Risks and opportunities
- `POST   /api/quality/risks` — Create risk/opportunity
- `GET    /api/quality/risks/:id` — Get risk details
- `PUT    /api/quality/risks/:id` — Update risk
- `DELETE /api/quality/risks/:id` — Delete risk
- `GET    /api/quality/risks/matrix` — Risk matrix view

#### FMEA (Failure Mode & Effects Analysis)
- `GET    /api/quality/fmea` — List FMEAs
- `POST   /api/quality/fmea` — Create FMEA
- `GET    /api/quality/fmea/:id` — FMEA with all rows
- `PUT    /api/quality/fmea/:id` — Update FMEA header
- `DELETE /api/quality/fmea/:id` — Delete FMEA
- `POST   /api/quality/fmea/:id/rows` — Add FMEA row
- `PUT    /api/quality/fmea/:id/rows/:rowId` — Update row
- `DELETE /api/quality/fmea/:id/rows/:rowId` — Delete row

#### Interested Parties (Clause 4.2)
- `GET    /api/quality/parties` — Interested parties register
- `POST   /api/quality/parties` — Add party
- `PUT    /api/quality/parties/:id` — Update party
- `DELETE /api/quality/parties/:id` — Remove party

#### Context Issues (Clause 4.1 — SWOT/PESTLE)
- `GET    /api/quality/issues` — Internal/external issues
- `POST   /api/quality/issues` — Create issue
- `GET    /api/quality/context-factors` — Context analysis

#### Opportunities (Continual Improvement)
- `GET    /api/quality/opportunities` — Improvement opportunities
- `POST   /api/quality/opportunities` — Create opportunity

#### Processes (Clause 4.4)
- `GET    /api/quality/processes` — Process map
- `POST   /api/quality/processes` — Create process
- `GET    /api/quality/processes/:id` — Process details
- `PUT    /api/quality/processes/:id` — Update process

#### Metrics & KPIs (Clause 9.1)
- `GET    /api/quality/metrics` — Quality KPIs
- `POST   /api/quality/metrics` — Create metric
- `GET    /api/quality/metrics/dashboard` — KPI dashboard
- `GET    /api/quality/metrics/summary` — Summary statistics

#### Objectives (Clause 6.2)
- `GET    /api/quality/objectives` — Quality objectives
- `POST   /api/quality/objectives` — Create objective
- `PUT    /api/quality/objectives/:id` — Update objective
- `GET    /api/quality/objectives/:id/milestones` — Milestone tracking

#### Calibration (Clause 7.1.5)
- `GET    /api/quality/calibrations` — Calibration register
- `POST   /api/quality/calibrations` — Create calibration record
- `PUT    /api/quality/calibrations/:id` — Update calibration
- `GET    /api/quality/calibrations/overdue` — Overdue calibrations

#### Competence (Clause 7.2)
- `GET    /api/quality/competences` — Competence register
- `POST   /api/quality/competences` — Create competence record
- `GET    /api/quality/competences/:id` — Get competence details

#### Management Reviews (Clause 9.3)
- `GET    /api/quality/management-reviews` — Review meetings
- `POST   /api/quality/management-reviews` — Create review
- `POST   /api/quality/management-reviews/:id/actions` — Add action
- `PUT    /api/quality/management-reviews/:id/actions/:actionId` — Update action

#### Customer Satisfaction (Clause 9.1.2)
- `GET    /api/quality/customer-satisfaction` — Customer satisfaction data
- `GET    /api/quality/customer-satisfaction/surveys` — Survey list
- `POST   /api/quality/customer-satisfaction/surveys` — Create survey
- `GET    /api/quality/customer-satisfaction/surveys/:id` — Survey details
- `GET    /api/quality/customer-satisfaction/public/:token` — Public survey link
- `POST   /api/quality/customer-satisfaction/public/:token/respond` — Submit survey response

#### Supplier Management (Clause 8.4)
- `GET    /api/quality/suppliers` — Approved supplier list
- `POST   /api/quality/suppliers` — Add supplier
- `PUT    /api/quality/suppliers/:id` — Update supplier
- `GET    /api/quality/suppliers/approved-sources` — Approved sources

#### Design & Development (Clause 8.3)
- `POST   /api/quality/design-development` — Create design project
- `GET    /api/quality/design-development` — List design projects
- `GET    /api/quality/design-development/:id` — Design project details

#### Product Safety
- `GET    /api/quality/product-safety` — Product safety incidents
- `POST   /api/quality/product-safety` — Report safety incident
- `GET    /api/quality/product-safety/recalls` — Product recalls
- `POST   /api/quality/product-safety/recalls` — Initiate recall

#### Counterfeit Parts
- `GET    /api/quality/counterfeit` — Counterfeit reports
- `POST   /api/quality/counterfeit` — Create counterfeit report
- `GET    /api/quality/counterfeit/:id` — Report details

#### Changes (Clause 6.3)
- `GET    /api/quality/changes` — Change register
- `POST   /api/quality/changes` — Create change request
- `PUT    /api/quality/changes/:id` — Update change

#### Root Cause Investigations
- `GET    /api/quality/investigations` — Investigation list
- `POST   /api/quality/investigations` — Create investigation

#### CI Register (Clause 10.3)
- `GET    /api/quality/ci` — Continual improvement register
- `POST   /api/quality/ci` — Create CI entry

#### RACI Matrix
- `GET    /api/quality/raci` — RACI responsibility matrix
- `POST   /api/quality/raci` — Create RACI entry

#### Releases
- `GET    /api/quality/releases` — Release management
- `POST   /api/quality/releases` — Create release record

#### QMS Scope (Clause 4.3)
- `GET    /api/quality/scope` — QMS scope document
- `PUT    /api/quality/scope` — Update scope

#### Quality Policy (Clause 5.2)
- `GET    /api/quality/policy` — Quality policy
- `PUT    /api/quality/policy` — Update policy

#### Training Records (Clause 7.2)
- `GET    /api/quality/training` — Training records
- `POST   /api/quality/training` — Create training record

#### Legal & Regulatory (Clause 6.1.3)
- `GET    /api/quality/legal` — Legal compliance register
- `POST   /api/quality/legal` — Add legal requirement

#### Actions
- `GET    /api/quality/actions` — Cross-quality actions
- `POST   /api/quality/actions` — Create action
- `PUT    /api/quality/actions/:id` — Update action

#### Evidence Pack (Certification Preparation)
- `GET    /api/quality/evidence-pack` — Certification evidence packages
- `POST   /api/quality/evidence-pack/generate` — Generate evidence pack
- `GET    /api/quality/evidence-pack/:id/download` — Download pack

#### ISO Headstart Assessment
- `POST   /api/quality/headstart/assess` — Run ISO readiness assessment
- `GET    /api/quality/headstart/:id` — Get assessment results

#### Template Generator (AI-Powered)
- `POST   /api/quality/template-generator` — AI-generate QMS document
- `GET    /api/quality/template-generator` — List generated templates

---

## 2. HEALTH & SAFETY (ISO 45001:2018)

**Service:** `api-health-safety` | **Port:** 4001 | **Web:** `web-health-safety` (port 3001, 13 pages)
**Schema:** `health-safety.prisma` — 18 models, 31 enums

### Features & Endpoints

#### Incident Reporting (Clause 10.2 + RIDDOR 2013)
- `GET    /api/health-safety/incidents` — List incidents (filterable by type/severity/RIDDOR)
- `POST   /api/health-safety/incidents` — Report incident
- `GET    /api/health-safety/incidents/:id` — Full incident details
- `PUT    /api/health-safety/incidents/:id` — Update incident
- `DELETE /api/health-safety/incidents/:id` — Delete (soft)
- `GET    /api/health-safety/incidents/overdue` — Overdue investigations
- `GET    /api/health-safety/incidents/stats` — Incident statistics
- `GET    /api/health-safety/incidents/summary` — Management summary

**RIDDOR-Reportable Auto-Detection:**
System automatically flags incidents for RIDDOR reporting based on: injury type, days lost (>7), specified injuries, dangerous occurrences.

**Incident Types:** INJURY, NEAR_MISS, DANGEROUS_OCCURRENCE, OCCUPATIONAL_ILLNESS, PROPERTY_DAMAGE, FIRST_AID, MEDICAL_TREATMENT, LOST_TIME, SECURITY_BREACH, DATA_BREACH

**AI-Powered Root Cause:** For each incident, AI generates: immediate cause, underlying cause, root cause, contributing factors, recurrence prevention recommendations.

#### Risk Assessments / HIRA (Clause 6.1.2)
- `GET    /api/health-safety/risks` — Risk assessments
- `POST   /api/health-safety/risks` — Create risk assessment
- `GET    /api/health-safety/risks/:id` — Risk details with controls
- `PUT    /api/health-safety/risks/:id` — Update assessment
- `DELETE /api/health-safety/risks/:id` — Archive risk
- `GET    /api/health-safety/risks/matrix` — Risk matrix view

**Risk Scoring:** Likelihood (1-5) x Severity (1-5) = Risk Score
**AI Controls:** System generates Hierarchy of Controls (Eliminate -> Substitute -> Engineering -> Admin -> PPE)

#### Hazards
- `GET    /api/health-safety/risks/:id/actions` — Hazards linked to risk
- `POST   /api/health-safety/risks/:id/actions` — Add hazard

**Hazard Categories:** PHYSICAL, CHEMICAL, BIOLOGICAL, ERGONOMIC, PSYCHOSOCIAL, ELECTRICAL, FIRE, MECHANICAL, ENVIRONMENTAL

#### CAPA
- `GET    /api/health-safety/capa` — H&S CAPAs
- `POST   /api/health-safety/capa` — Create CAPA
- `GET    /api/health-safety/capa/:id` — CAPA with action plan
- `PUT    /api/health-safety/capa/:id` — Update CAPA
- `DELETE /api/health-safety/capa/:id` — Delete CAPA

#### Actions
- `GET    /api/health-safety/actions` — H&S actions (across all sources)
- `POST   /api/health-safety/actions` — Create action
- `GET    /api/health-safety/actions/:id` — Action details
- `PUT    /api/health-safety/actions/:id` — Update action
- `GET    /api/health-safety/actions/:id/actions` — Sub-actions

#### Safety Metrics / KPIs (Clause 9.1)
- `GET    /api/health-safety/metrics` — Safety KPIs by month
- `POST   /api/health-safety/metrics` — Record monthly metrics
- `GET    /api/health-safety/metrics/stats` — Calculated rates

**Calculated Rates:**
- LTIFR = (LTI x 1,000,000) / Hours Worked
- TRIR = (Recordable Incidents x 200,000) / Hours Worked
- Severity Rate = (Days Lost x 1,000,000) / Hours Worked

#### OHS Objectives (Clause 6.2)
- `GET    /api/health-safety/objectives` — Objectives and KPIs
- `POST   /api/health-safety/objectives` — Create objective
- `GET    /api/health-safety/objectives/:id` — Objective with milestones
- `PUT    /api/health-safety/objectives/:id` — Update objective
- `GET    /api/health-safety/objectives/:id/milestones` — Milestones
- `PUT    /api/health-safety/objectives/:id/milestones/:mid` — Update milestone

#### Legal Requirements (Clause 6.1.3)
- `GET    /api/health-safety/legal` — Legal register
- `POST   /api/health-safety/legal` — Add legal requirement
- `GET    /api/health-safety/legal/:id` — Requirement details
- `PUT    /api/health-safety/legal/:id` — Update compliance status

#### Communications (Clause 7.4)
- `GET    /api/health-safety/communications` — Communications register
- `POST   /api/health-safety/communications` — Create communication record
- `GET    /api/health-safety/communications/participation` — Worker participation stats

#### Training Records (Clause 7.2)
- `GET    /api/health-safety/training` — Training records
- `POST   /api/health-safety/training` — Record training
- `GET    /api/health-safety/training/:id` — Training details
- `PUT    /api/health-safety/training/:id/complete` — Mark complete

#### Management Reviews (Clause 9.3)
- `GET    /api/health-safety/management-reviews` — OHS management reviews
- `POST   /api/health-safety/management-reviews` — Create review
- `POST   /api/health-safety/management-reviews/:id/actions` — Add action
- `PUT    /api/health-safety/management-reviews/:id/actions/:actionId` — Update action

---

## 3. ENVIRONMENTAL MANAGEMENT (ISO 14001:2015)

**Service:** `api-environment` | **Port:** 4002 | **Web:** `web-environment` (port 3002, 15 pages)
**Schema:** `environment.prisma` — 25 models, 52 enums

### Features & Endpoints

#### Aspects & Impacts (Clause 6.1.2)
- `GET    /api/environment/aspects` — Environmental aspects register
- `POST   /api/environment/aspects` — Create aspect entry
- `GET    /api/environment/aspects/:id` — Aspect details with scoring
- `PUT    /api/environment/aspects/:id` — Update aspect
- `DELETE /api/environment/aspects/:id` — Archive aspect

**Significance Scoring (7 factors):**
- Severity (1-5) x 1.5
- Probability (1-5) x 1.5
- Duration (1-3): Temporary / Seasonal / Permanent
- Extent (1-3): Local / Regional / Global
- Reversibility (1-3): Reversible / Partially / Irreversible
- Regulatory Concern (0 or 2)
- Stakeholder Concern (0 or 2)
- **Score >= 15 = Significant Aspect** (requires objective/target)

#### Environmental Events / Incidents
- `GET    /api/environment/events` — Environmental incidents/spills
- `POST   /api/environment/events` — Report event
- `GET    /api/environment/events/:id` — Event details
- `PUT    /api/environment/events/:id` — Update event

#### Legal Compliance (Clause 6.1.3)
- `GET    /api/environment/legal` — Environmental legal register
- `POST   /api/environment/legal` — Add legal obligation
- `GET    /api/environment/legal/:id` — Obligation details
- `PUT    /api/environment/legal/:id` — Update compliance status

#### Objectives & Targets (Clause 6.2)
- `GET    /api/environment/objectives` — Environmental objectives
- `POST   /api/environment/objectives` — Create objective
- `GET    /api/environment/objectives/:id` — Objective + milestones
- `PUT    /api/environment/objectives/:id` — Update objective
- `PATCH  /api/environment/objectives/:id/milestones/:milestoneId` — Update milestone

#### CAPA
- `GET    /api/environment/capa` — Environmental CAPAs
- `POST   /api/environment/capa` — Create CAPA
- `GET    /api/environment/capa/:id` — CAPA details
- `PUT    /api/environment/capa/:id` — Update CAPA
- `POST   /api/environment/capa/:id/actions` — Add action
- `PUT    /api/environment/capa/:id/actions/:actionId` — Update action

#### Actions
- `GET    /api/environment/actions` — Environmental actions
- `POST   /api/environment/actions` — Create action

#### Audits (Clause 9.2)
- `GET    /api/environment/audits` — Environmental audits
- `POST   /api/environment/audits` — Create audit
- `GET    /api/environment/audits/schedule` — Audit programme
- `POST   /api/environment/audits/schedule` — Schedule audit
- `POST   /api/environment/audits/:id/findings` — Add finding
- `PUT    /api/environment/audits/:id/findings/:fid` — Update finding
- `POST   /api/environment/audits/:id/complete` — Complete audit

#### Emergency Preparedness (Clause 8.2)
- `POST   /api/environment/emergency/plans` — Create emergency plan
- `GET    /api/environment/emergency/plans` — Environmental emergency plans
- `POST   /api/environment/emergency/drills` — Record drill
- `GET    /api/environment/emergency/drills` — Drill history

#### ESG Data Integration
- `GET    /api/environment/esg/summary` — ESG summary for environmental data
- `GET    /api/environment/esg/trends` — Environmental trends
- `GET    /api/environment/esg/targets` — Environmental targets
- `POST   /api/environment/esg/metrics` — Submit ESG metric

#### Product Lifecycle Assessment
- `POST   /api/environment/lifecycle/assessments` — Create LCA
- `GET    /api/environment/lifecycle/assessments` — List LCAs

#### Management Reviews (Clause 9.3)
- `GET    /api/environment/management-reviews` — Environmental MRs
- `POST   /api/environment/management-reviews` — Create MR

#### Training (Clause 7.2)
- `GET    /api/environment/training` — Environmental training records
- `POST   /api/environment/training` — Record training
- `GET    /api/environment/training/overdue` — Overdue training

#### Communications (Clause 7.4)
- `GET    /api/environment/communications` — Communications register
- `POST   /api/environment/communications` — Create communication

---

## 4. AUTOMOTIVE QUALITY (IATF 16949:2016)

**Service:** `api-automotive` | **Port:** 4010 | **Web:** `web-automotive` (port 3010, 14 pages)
**Schema:** `automotive.prisma` — 23 models, 26 enums

### Features & Endpoints

#### APQP (Advanced Product Quality Planning)
- `GET    /api/automotive/apqp` — APQP projects
- `POST   /api/automotive/apqp` — Create APQP project
- `GET    /api/automotive/apqp/:id` — APQP with all phases
- `PUT    /api/automotive/apqp/:id` — Update project
- `POST   /api/automotive/apqp/:id/phases/:phaseNum/gate-review` — Submit phase gate review
- `PUT    /api/automotive/apqp/:id/deliverables/:did` — Update deliverable status
- `GET    /api/automotive/apqp/:id/status-report` — APQP status report

**APQP Phases:**
1. Plan & Define
2. Product Design & Development
3. Process Design & Development
4. Product & Process Validation
5. Launch, Feedback & Corrective Action

#### PPAP (Production Part Approval Process)
- `POST   /api/automotive/ppap` — Create PPAP submission
- `GET    /api/automotive/ppap` — List submissions
- `GET    /api/automotive/ppap/:id` — PPAP with all 18 elements
- `PUT    /api/automotive/ppap/:id/elements/:elementNumber` — Update element
- `POST   /api/automotive/ppap/:id/psw` — Submit Part Submission Warrant
- `GET    /api/automotive/ppap/:id/readiness` — Submission readiness check
- `POST   /api/automotive/ppap/:id/submit-level` — Submit by level (1-5)

#### FMEA (Design & Process)
- `GET    /api/automotive/fmea` — DFMEA/PFMEA list
- `POST   /api/automotive/fmea` — Create FMEA
- `GET    /api/automotive/fmea/:id` — FMEA with all rows
- `PUT    /api/automotive/fmea/:id` — Update FMEA header
- `DELETE /api/automotive/fmea/:id` — Delete FMEA
- `POST   /api/automotive/fmea/:id/items` — Add failure mode
- `PUT    /api/automotive/fmea/:id/items/:itemId` — Update item (severity/occurrence/detection/RPN)
- `DELETE /api/automotive/fmea/:id/items/:itemId` — Remove item

**RPN = Severity x Occurrence x Detection** (threshold typically >= 100 requires action)

#### SPC (Statistical Process Control)
- `POST   /api/automotive/spc` — Create SPC chart
- `GET    /api/automotive/spc` — List charts
- `GET    /api/automotive/spc/alerts` — Out-of-control signals
- `GET    /api/automotive/spc/:id` — Chart with data
- `POST   /api/automotive/spc/:id/data` — Add measurement
- `GET    /api/automotive/spc/:id/capability` — Cpk/Ppk analysis

**Chart Types:** X-bar-R, X-bar-S, I-MR, P, np, c, u

#### MSA (Measurement System Analysis)
- `POST   /api/automotive/msa` — Create MSA study
- `GET    /api/automotive/msa` — List studies
- `GET    /api/automotive/msa/:id` — Study with results
- `POST   /api/automotive/msa/:id/data` — Submit gauge data
- `GET    /api/automotive/msa/:id/results` — GR&R results

**MSA Criteria:** %GR&R <10% acceptable, 10-30% conditional, >30% unacceptable

#### Control Plans
- `POST   /api/automotive/control-plans` — Create control plan
- `GET    /api/automotive/control-plans` — List control plans
- `GET    /api/automotive/control-plans/:id` — Control plan details
- `POST   /api/automotive/control-plans/:id/characteristics` — Add characteristic
- `PUT    /api/automotive/control-plans/:id/characteristics/:charId` — Update characteristic
- `POST   /api/automotive/control-plans/:id/approve` — Approve control plan

#### 8D Problem Solving
- `GET    /api/automotive/eight-d` — 8D reports
- `GET    /api/automotive/eight-d/stats` — 8D statistics
- `GET    /api/automotive/eight-d/:id` — 8D with all disciplines
- `POST   /api/automotive/eight-d` — Create 8D report
- `PUT    /api/automotive/eight-d/:id` — Update discipline

**8 Disciplines:**
- D1: Team Formation
- D2: Problem Description
- D3: Interim Containment Actions
- D4: Root Cause Analysis
- D5: Permanent Corrective Actions
- D6: Implement & Validate Actions
- D7: Prevent Recurrence
- D8: Team Recognition

#### LPA (Layered Process Audits)
- `POST   /api/automotive/lpa/schedules` — Create LPA schedule
- `GET    /api/automotive/lpa/schedules` — List schedules
- `POST   /api/automotive/lpa/audits` — Record LPA audit
- `GET    /api/automotive/lpa/audits` — Audit history
- `POST   /api/automotive/lpa/audits/:id/respond` — Submit responses
- `POST   /api/automotive/lpa/audits/:id/complete` — Complete audit
- `GET    /api/automotive/lpa/dashboard` — LPA compliance dashboard

#### Customer-Specific Requirements (CSR)
- `GET    /api/automotive/csr/oems` — OEM requirements list
- `GET    /api/automotive/csr/gaps` — Gap analysis vs CSRs
- `GET    /api/automotive/csr/oems/:oem` — OEM-specific requirements
- `PUT    /api/automotive/csr/:id/status` — Update compliance status

#### Customer Requirements
- `GET    /api/automotive/customer-reqs` — Customer requirements
- `POST   /api/automotive/customer-reqs` — Add requirement
- `GET    /api/automotive/customer-reqs/compliance-summary` — Compliance matrix

#### Supplier Development
- `GET    /api/automotive/supplier-dev` — Supplier development plans
- `POST   /api/automotive/supplier-dev` — Create development plan
- `GET    /api/automotive/supplier-dev/:id` — Plan details
- `PUT    /api/automotive/supplier-dev/:id` — Update plan

#### Templates
- `GET    /api/automotive/templates` — IATF document templates
- `GET    /api/automotive/templates/:id` — Specific template

---

## 5. MEDICAL DEVICES (ISO 13485:2016 + 21 CFR Part 820)

**Service:** `api-medical` | **Port:** 4011 | **Web:** `web-medical` (port 3011, 17 pages)
**Schema:** `medical.prisma` — 31 models, 44 enums

### Features & Endpoints

#### Device Records (DHF/DMR/DHR)
- `GET    /api/medical/device-records` — Device master records
- `POST   /api/medical/device-records` — Create device record
- `GET    /api/medical/device-records/:id` — Device record details
- `PUT    /api/medical/device-records/:id` — Update record

#### Design Controls (Clause 7.3)
Full design lifecycle: Planning -> Inputs -> Outputs -> Reviews -> Verification -> Validation -> Transfer -> Changes

#### DHF (Design History File)
- `GET    /api/medical/dhf` — DHF entries
- `POST   /api/medical/dhf` — Create DHF entry
- `GET    /api/medical/dhf/:id` — DHF details

#### Risk Management (ISO 14971)
- `GET    /api/medical/risk-management` — Risk file
- `POST   /api/medical/risk-management` — Create risk analysis

#### CAPA (Clause 8.5.2/8.5.3)
Full CAPA lifecycle with effectiveness verification

#### Complaints (Clause 8.2.2)
Full complaint handling: receipt -> investigation -> trending -> MDR reporting

#### Post-Market Surveillance (PMS)
Vigilance reporting, PMS data collection, trend analysis

#### UDI (Unique Device Identification)
- `GET    /api/medical/udi` — UDI records
- `POST   /api/medical/udi` — Register UDI
- `PUT    /api/medical/udi/:id` — Update UDI data

#### Software Lifecycle (IEC 62304)
Software classification, development lifecycle, validation records

#### Submissions Tracking
- 510k, CE marking, MDR, PMA submission status tracking
- `GET    /api/medical/submissions` — Regulatory submissions
- `POST   /api/medical/submissions` — Create submission record
- `PUT    /api/medical/submissions/:id` — Update submission status

#### Traceability
- Lot/batch traceability: forward and backward
- Distribution records
- `GET    /api/medical/traceability` — Traceability records

---

## 6. AEROSPACE QUALITY (AS9100D / EN9100:2018)

**Service:** `api-aerospace` | **Port:** 4012 | **Web:** `web-aerospace` (port 3012, 15 pages)
**Schema:** `aerospace.prisma` — 24 models, 54 enums

### Features & Endpoints

#### FAI (First Article Inspection — AS9102B)
- `POST   /api/aerospace/fai` — Create FAI
- `GET    /api/aerospace/fai` — FAI list
- `GET    /api/aerospace/fai/:id` — FAI details (3 sections)
- `PUT    /api/aerospace/fai/:id/part1` — Design documentation section
- `PUT    /api/aerospace/fai/:id/part2` — Product accounting section
- `PUT    /api/aerospace/fai/:id/part3` — Characteristic accountability
- `POST   /api/aerospace/fai/:id/approve` — Approve FAI
- `POST   /api/aerospace/fai/:id/partial` — Partial FAI approval

#### FOD (Foreign Object Damage/Debris)
- `GET    /api/aerospace/fod` — FOD records
- `POST   /api/aerospace/fod` — Create FOD record
- `GET    /api/aerospace/fod/inspections` — FOD inspection log
- `POST   /api/aerospace/fod/inspections` — Record inspection
- `PUT    /api/aerospace/fod/inspections/:id/complete` — Complete inspection

#### Configuration Management
- Baseline establishment, configuration item tracking
- Engineering Change Proposals (ECPs)
- Configuration audits (FCA/PCA)

#### Special Processes (NADCAP)
- `GET    /api/aerospace/special-processes` — Special process qualifications
- `POST   /api/aerospace/special-processes` — Register process
- `GET    /api/aerospace/special-processes/nadcap` — NADCAP accreditations
- `PUT    /api/aerospace/special-processes/nadcap/:id` — Update NADCAP status

#### Human Factors
- `POST   /api/aerospace/human-factors/incidents` — Human factors incidents
- `GET    /api/aerospace/human-factors/incidents` — HF incident list
- `POST   /api/aerospace/human-factors/fatigue` — Fatigue risk assessment
- `GET    /api/aerospace/human-factors/dirty-dozen` — Dirty Dozen checklist

#### OASIS (Online Aerospace Supplier Information System)
- `GET    /api/aerospace/oasis/lookup` — OASIS supplier lookup
- `POST   /api/aerospace/oasis/monitor` — Add to monitoring watchlist
- `GET    /api/aerospace/oasis/alerts` — Certification expiry alerts

#### Counterfeit Parts Prevention (AS6174A)
- `GET    /api/aerospace/counterfeit` — Counterfeit parts register
- `POST   /api/aerospace/counterfeit` — Report counterfeit
- `GET    /api/aerospace/counterfeit/suspect-parts` — Suspect parts list

#### Work Orders
- `POST   /api/aerospace/workorders` — Create work order
- `POST   /api/aerospace/workorders/:id/release` — Release for production
- `POST   /api/aerospace/workorders/:id/inspect` — In-process inspection
- `GET    /api/aerospace/workorders/:id/release-cert` — Release certificate

#### Compliance Tracker (AS9100D Clauses)
- `GET    /api/aerospace/compliance-tracker/clauses` — All AS9100D clauses
- `GET    /api/aerospace/compliance-tracker/dashboard/summary` — Compliance summary

---

## 7. FOOD SAFETY (ISO 22000:2018 + HACCP)

**Service:** `api-food-safety` | **Port:** 4019 | **Web:** `web-food-safety` (port 3020, 17 pages)
**Schema:** `food-safety.prisma` — 14 models, 22 enums

### Features & Endpoints

#### HACCP Plan (7 Principles)
- `GET    /api/food-safety/haccp-flow` — HACCP process flow
- `POST   /api/food-safety/haccp-flow` — Create process step
- `GET    /api/food-safety/hazards` — Hazard register
- `POST   /api/food-safety/hazards` — Identify hazard
- `GET    /api/food-safety/ccps` — Critical Control Points
- `POST   /api/food-safety/ccps` — Define CCP
- `GET    /api/food-safety/monitoring` — CCP monitoring records
- `POST   /api/food-safety/monitoring` — Record monitoring result

**Hazard Types:** BIOLOGICAL, CHEMICAL, PHYSICAL, ALLERGEN, RADIOLOGICAL

#### Products & Allergens
- `GET    /api/food-safety/products` — Product register
- `POST   /api/food-safety/products` — Add product
- `GET    /api/food-safety/allergens` — Allergen matrix
- `POST   /api/food-safety/allergens` — Manage allergen declarations

**14 EU Allergens:** Cereals/gluten, Crustaceans, Eggs, Fish, Peanuts, Soya, Milk, Nuts, Celery, Mustard, Sesame, Sulphites, Lupin, Molluscs

#### Traceability (Clause 8.3)
- `GET    /api/food-safety/traceability` — Traceability records
- Forward traceability (batch -> end customer)
- Backward traceability (product -> raw materials)
- Mock recall testing

#### Product Recalls
- `GET    /api/food-safety/recalls` — Recall records
- `POST   /api/food-safety/recalls` — Initiate recall
- Recall effectiveness rate tracking

#### Environmental Monitoring
- `GET    /api/food-safety/environmental-monitoring` — Swab/test results
- `POST   /api/food-safety/environmental-monitoring` — Record test result

#### Food Defense
- `GET    /api/food-safety/food-defense` — Food defense assessments
- `POST   /api/food-safety/food-defense` — Create assessment

#### Sanitation
- `GET    /api/food-safety/sanitation` — Sanitation records
- `POST   /api/food-safety/sanitation` — Record sanitation verification

#### Suppliers
- `GET    /api/food-safety/suppliers` — Approved food suppliers
- `POST   /api/food-safety/suppliers` — Add supplier

#### Audits & NCRs
- Full audit management for food safety
- Non-conformance tracking specific to food safety
- Training records with competency verification

---

## 8. ENERGY MANAGEMENT (ISO 50001:2018)

**Service:** `api-energy` | **Port:** 4020 | **Web:** `web-energy` (port 3021, 15 pages)
**Schema:** `energy.prisma` — 12 models, 17 enums

### Features & Endpoints

#### Energy Meters & Readings
- `GET    /api/energy/meters/hierarchy` — Meter hierarchy tree
- `GET    /api/energy/meters` — All meters
- `POST   /api/energy/meters` — Register meter
- `GET    /api/energy/meters/:id/readings` — Meter readings
- `GET    /api/energy/readings/summary` — Consumption summary
- `POST   /api/energy/readings` — Submit reading

#### Energy Baselines (EnB)
- `GET    /api/energy/baselines` — Energy baselines
- `POST   /api/energy/baselines` — Create baseline
- `PUT    /api/energy/baselines/:id/approve` — Approve baseline

#### Significant Energy Uses (SEUs — Clause 6.3)
- `GET    /api/energy/seus` — SEU register
- `POST   /api/energy/seus` — Identify SEU

#### Energy Performance Indicators (EnPIs)
- `GET    /api/energy/enpis` — EnPI register
- `POST   /api/energy/enpis` — Create EnPI
- `GET    /api/energy/enpis/:id/trend` — EnPI trend analysis
- `POST   /api/energy/enpis/:id/data-points` — Submit EnPI data

#### Energy Targets
- `GET    /api/energy/targets` — Reduction targets
- `POST   /api/energy/targets` — Set target
- `GET    /api/energy/targets/:id/progress` — Progress vs target

#### Energy Improvement Projects
- `GET    /api/energy/projects` — Improvement projects
- `POST   /api/energy/projects` — Create project
- `GET    /api/energy/projects/roi-summary` — ROI summary

#### Utility Bills
- `GET    /api/energy/bills` — Utility bills
- `POST   /api/energy/bills` — Upload bill
- `GET    /api/energy/bills/summary` — Cost summary
- `PUT    /api/energy/bills/:id/verify` — Verify bill

#### Compliance (ESOS / SECR)
- `GET    /api/energy/compliance/dashboard` — Compliance dashboard
- `GET    /api/energy/reports/esos` — ESOS report (UK Energy Savings Opportunity Scheme)
- `GET    /api/energy/reports/secr` — SECR report (Streamlined Energy & Carbon Reporting)

#### Alerts
- `GET    /api/energy/alerts` — Energy alerts (threshold breaches)
- `POST   /api/energy/alerts` — Create alert rule
- `PUT    /api/energy/alerts/:id/acknowledge` — Acknowledge alert

---

## 9. ESG REPORTING

**Service:** `api-esg` | **Port:** 4016 | **Web:** `web-esg` (port 3016, 17 pages)
**Schema:** `esg.prisma` — 17 models, 18 enums
**Frameworks:** GRI Standards, TCFD, SASB, UN SDGs, CSRD, ISSB

### Features & Endpoints

#### GHG Emissions (Scope 1/2/3)
- `GET    /api/esg/emissions/summary` — Emissions by scope
- `GET    /api/esg/emissions/trend` — Year-on-year trend
- `GET    /api/esg/emissions` — All emission records
- `POST   /api/esg/emissions` — Submit emission data
- `GET    /api/esg/scope-emissions` — Scope breakdown
- `POST   /api/esg/scope-emissions` — Add scope emission

**Scope Classification:**
- **Scope 1:** Direct (combustion, process, fugitive)
- **Scope 2:** Indirect energy (electricity — location-based & market-based)
- **Scope 3:** Value chain (15 categories)

**DEFRA Emission Factors:** Auto-populated from `@ims/emission-factors` database

#### Energy
- `GET    /api/esg/energy` — Energy consumption data
- `POST   /api/esg/energy` — Submit energy data

#### Water
- `GET    /api/esg/water` — Water consumption/discharge
- `POST   /api/esg/water` — Submit water data

#### Waste
- `GET    /api/esg/waste` — Waste arisings by stream
- `POST   /api/esg/waste` — Submit waste data

#### Social Metrics
- `GET    /api/esg/social/workforce` — Workforce diversity data
- `GET    /api/esg/social/safety` — H&S social data
- `GET    /api/esg/social` — All social metrics

#### Governance
- `GET    /api/esg/governance/policies` — Governance policies
- `GET    /api/esg/governance/ethics` — Ethics and anti-corruption data

#### ESG Framework Mapping
- `GET    /api/esg/frameworks` — Supported frameworks (GRI/TCFD/SASB)
- `GET    /api/esg/frameworks/:id/metrics` — Framework metrics
- `POST   /api/esg/frameworks/:id/metrics` — Submit framework metric

#### Materiality Assessment
- `GET    /api/esg/materiality/matrix` — Double materiality matrix
- `POST   /api/esg/materiality` — Create materiality assessment

#### Targets
- `GET    /api/esg/targets` — Science-based/ESG targets
- `POST   /api/esg/targets` — Set target
- `GET    /api/esg/targets/:id/trajectory` — Net zero trajectory

#### Stakeholders
- `GET    /api/esg/stakeholders` — ESG stakeholder register
- `POST   /api/esg/stakeholders` — Add stakeholder

#### ESG Reports
- `GET    /api/esg/reports/dashboard` — ESG dashboard
- `GET    /api/esg/reports/csrd` — CSRD-compliant report
- `GET    /api/esg/reports/tcfd` — TCFD-aligned disclosure
- `POST   /api/esg/esg-reports/generate` — Generate full ESG report

#### Initiatives
- `GET    /api/esg/initiatives` — Sustainability initiatives
- `POST   /api/esg/initiatives` — Create initiative

---

## 10. INFORMATION SECURITY (ISO 27001:2022)

**Service:** `api-infosec` | **Port:** 4015 | **Web:** `web-infosec` (port 3015, 19 pages)
**Schema:** `infosec.prisma` — 14 models, 26 enums

### Features & Endpoints

#### Controls (Annex A — 93 Controls)
- `GET    /api/infosec/controls` — All 93 Annex A controls with status
- `POST   /api/infosec/controls` — Create control record
- `PUT    /api/infosec/controls/:id` — Update control status
- Control themes: Organizational (37), People (8), Physical (14), Technological (34)

#### Information Assets
- `GET    /api/infosec/assets` — Information asset register
- `POST   /api/infosec/assets` — Register asset
- `PUT    /api/infosec/assets/:id` — Update asset classification
- Classification: CONFIDENTIAL, RESTRICTED, INTERNAL, PUBLIC

#### Information Security Risks
- `GET    /api/infosec/risks` — IS risk register
- `POST   /api/infosec/risks` — Create risk entry

#### Security Incidents
- `GET    /api/infosec/incidents` — Security incidents
- `POST   /api/infosec/incidents` — Report incident
- GDPR breach notification workflow (72-hour window)

#### Audits
- `GET    /api/infosec/audits` — ISMS audits
- `POST   /api/infosec/audits` — Schedule audit

#### Privacy (ISO 27701 / GDPR)
- `GET    /api/infosec/privacy` — ROPA (Records of Processing Activities)
- `POST   /api/infosec/privacy` — Create ROPA entry
- DPIA (Data Protection Impact Assessments)

#### ISMS Scope
- `GET    /api/infosec/scope` — ISMS scope definition
- `PUT    /api/infosec/scope` — Update scope

---

## 11. RISK MANAGEMENT (ISO 31000:2018)

**Service:** `api-risk` | **Port:** 4027 | **Web:** `web-risk` (port 3031, 13 pages)
**Schema:** `risk.prisma` — 10 models, 16 enums

### Features & Endpoints

- **Risk Register:** Enterprise risk catalogue with inherent/residual scoring
- **Categories:** Strategic, Operational, Financial, Compliance, Reputational, Environmental, Technological
- **Controls:** Control effectiveness rating (EFFECTIVE / PARTIAL / INADEQUATE / UNTESTED)
- **Treatments:** AVOID, REDUCE, TRANSFER, ACCEPT
- **Bow-Tie Analysis:** Threats -> Top Event -> Consequences with preventive/mitigating barriers
- **Heat Map:** Visual risk matrix with risk appetite overlay
- **KRIs:** Key Risk Indicators with threshold alerts
- **Risk Appetite:** Board-approved tolerance statements per category
- **Reviews:** Quarterly risk review cycle with owner attestation
- **Analytics:** Risk trends, top 10 risks, control effectiveness dashboard

---

## 12. FINANCE & COMPLIANCE

**Service:** `api-finance` | **Port:** 4013 | **Web:** `web-finance` (port 3013, 16 pages)
**Schema:** `finance.prisma` — 27 models, 18 enums

### Features & Endpoints

- **Chart of Accounts:** Double-entry bookkeeping, account hierarchy, normal balance
- **Accounts Receivable:** Sales invoices, credit notes, payment allocation, aging analysis
- **Accounts Payable:** Purchase orders, bills, supplier payments, three-way matching
- **Banking:** Bank accounts, transactions, reconciliation, statement import
- **Journal Entries:** Manual journals, accruals, prepayments, reversals
- **Budgets:** Budget setting, department budgets, variance analysis, forecasting
- **Customers/Suppliers:** CRM-linked customer and supplier ledger
- **Tax:** VAT returns, Making Tax Digital (HMRC API), IR35 assessment, tax calendar
- **SOD Matrix:** Segregation of Duties conflict detection
- **Financial Controls:** SOX-aligned control testing and sign-off
- **Integrations:** Xero, QuickBooks, Sage connector framework
- **Reports:** P&L, Balance Sheet, Cash Flow, Aged Debtors/Creditors, Trial Balance, Management Accounts

---

## 13. HUMAN RESOURCES

**Service:** `api-hr` | **Port:** 4006 | **Web:** `web-hr` (port 3006, 15 pages)
**Schema:** `hr.prisma` — 27 models, 33 enums

### Features & Endpoints

- **Employee Records:** Personal details, employment history, position, department, contract type
- **Departments & Org Chart:** Hierarchical org chart with reporting lines
- **Recruitment:** Job requisitions, applications, interview scheduling, offers
- **Leave Management:** Leave types, entitlements, requests, approvals, balances, calendar
- **Attendance:** Time tracking, timesheets, absence recording
- **Performance Reviews:** Goal setting, 360 degree reviews, rating scales, development plans
- **Goals / OKRs:** Individual/team objectives linked to org strategy
- **Training:** Training needs analysis, course completion, skill records
- **Certifications:** Professional certifications with expiry tracking
- **Documents:** Employment contracts, policies, disciplinary records
- **GDPR:** Employee data subject rights, consent management

---

## 14. PAYROLL

**Service:** `api-payroll` | **Port:** 4007 | **Web:** `web-payroll` (port 3007, 14 pages)
**Schema:** `payroll.prisma` — 15 models, 20 enums

### Features & Endpoints

- **Payroll Runs:** Monthly payroll calculation, payslip generation, RTI submission
- **Salary Management:** Salary records, increments, pay grades
- **Tax Calculations:** PAYE, NI contributions, tax codes, P60/P45 generation
- **Expenses:** Expense claims, approval workflow, reimbursement
- **Benefits:** Benefit-in-kind, salary sacrifice, pension contributions
- **Loans:** Employee loans, repayment schedules, deductions
- **Jurisdictions:** Multi-jurisdiction payroll (UK, EU, US) — Prisma-backed `PayrollJurisdiction`
- **Tax Engine:** `@ims/tax-engine` integration for multi-jurisdiction tax

---

## 15. CRM (Customer Relationship Management)

**Service:** `api-crm` | **Port:** 4014 | **Web:** `web-crm` (port 3014, 15 pages)
**Schema:** `crm.prisma` — 17 models, 16 enums

### Features & Endpoints

- **Accounts:** Company accounts, hierarchy, compliance links, invoice history
- **Contacts:** Contact records, activities, email history
- **Leads:** Lead capture, scoring, assignment, qualification/disqualification
- **Deals:** Deal management, pipeline stages, forecast, board view (Kanban)
- **Campaigns:** Marketing campaigns, targets, performance tracking
- **Quotes:** Quote generation, e-sign, PDF export, acceptance workflow
- **Partners:** Partner tiers, referral tracking, commission management
- **Forecast:** Sales forecast by rep/region/product, quota tracking
- **Reports:** Sales dashboard, pipeline velocity, win-loss analysis, partner performance

---

## 16. INVENTORY

**Service:** `api-inventory` | **Port:** 4005 | **Web:** `web-inventory` (port 3005, 11 pages)
**Schema:** `inventory.prisma` — 12 models, 12 enums

### Features & Endpoints

- **Products:** Product catalogue, SKUs, BOMs, pricing
- **Categories:** Category hierarchy
- **Warehouses:** Multi-warehouse management, bin locations
- **Stock Levels:** Real-time stock quantities, reorder points, min/max levels
- **Adjustments:** Stock adjustments with reason codes and approval
- **Transactions:** GRN, sales orders, transfers, stock takes
- **Suppliers:** Preferred supplier per product, lead times, costs
- **Reports:** Stock valuation, aging analysis, slow-moving items, ABC analysis

---

## 17. WORKFLOWS

**Service:** `api-workflows` | **Port:** 4008 | **Web:** `web-workflows` (port 3008, 13 pages)
**Schema:** `workflows.prisma` — 17 models, 29 enums

### Features & Endpoints

- **Definitions:** Visual workflow designer (steps, conditions, branches)
- **Instances:** Active workflow executions with state tracking
- **Tasks:** Human task assignment, deadlines, escalation
- **Approvals:** Multi-level approval routing with delegation
- **Templates:** Pre-built workflow templates (NCR approval, CAPA review, etc.)
- **Automation:** Trigger-based automation (time, event, data condition)
- **Admin:** Workflow admin panel, analytics, SLA monitoring
- **Webhooks:** Outbound webhook triggers on workflow state changes

---

## 18. PROJECT MANAGEMENT

**Service:** `api-project-management` | **Port:** 4009 | **Web:** `web-project-management` (port 3009, 16 pages)
**Schema:** `project-management.prisma` — 16 models, 35 enums

### Features & Endpoints

- **Projects:** Project register, status tracking, Gantt view
- **Tasks:** Task management, dependencies, assignments
- **Milestones:** Key milestones with gate reviews
- **Issues:** Issue log, priority, resolution tracking
- **Risks:** Project-level risk register
- **Changes:** Change control log with impact assessment
- **Resources:** Resource planning, allocation, utilization
- **Timesheets:** Time recording against project tasks
- **Documents:** Project document management
- **Stakeholders:** Stakeholder register, communication plan
- **Benefits:** Benefits realization tracking
- **Sprints:** Agile sprint planning and velocity tracking
- **Reports:** RAG status report, resource utilization, EVM (Earned Value Management)

---

## 19. FIELD SERVICE

**Service:** `api-field-service` | **Port:** 4022 | **Web:** `web-field-service` (port 3023, 16 pages)
**Schema:** `field-service.prisma` — 14 models, 12 enums

### Features & Endpoints

- **Jobs:** Field service job management, assignment, status tracking
- **Technicians:** Technician skills, availability, GPS location
- **Schedules:** Job scheduling, calendar view, route optimization
- **Customers:** Customer sites and contacts
- **Sites:** Site details, access requirements, equipment lists
- **Contracts:** SLA contracts, maintenance agreements
- **Invoices:** Job-based invoicing, time and materials
- **Parts Used:** Parts consumption per job, inventory integration
- **Time Entries:** Time tracking, travel time, billable/non-billable
- **Checklists:** Job completion checklists
- **Job Notes:** Field notes, photos, signatures
- **Routes:** Optimized technician routes
- **KPIs:** First-time fix rate, SLA compliance, technician utilization

---

## 20. CMMS (Computerized Maintenance Management)

**Service:** `api-cmms` | **Port:** 4017 | **Web:** `web-cmms` (port 3017, 16 pages)
**Schema:** `cmms.prisma` — 16 models, 16 enums

### Features & Endpoints

- **Assets:** Asset register with hierarchy, QR codes, history
- **Work Orders:** Corrective and preventive work orders, labor/parts tracking
- **Preventive Plans:** PM schedules (calendar/meter-based), compliance tracking
- **Maintenance Requests:** Self-service request portal
- **Inspections:** Condition-based inspection rounds
- **Checklists:** Digital maintenance checklists with pass/fail recording
- **Parts/Spares:** Spare parts inventory, low-stock alerts, reorder management
- **Vendors:** Vendor management, contracts, performance rating
- **Meters:** Asset meter readings (hours, cycles, mileage)
- **Locations:** Location hierarchy, equipment-to-location mapping
- **Downtime:** Downtime tracking, Pareto analysis by failure code
- **Scheduler:** PM scheduler with upcoming and overdue work
- **KPIs:** OEE, MTBF, MTTR, PM compliance, cost per unit

---

## 21-27. SUPPORTING MODULES

### Documents (port 4031)
Document register, version control, approval workflow, read receipts, full-text search, access permissions

### Contracts (port 4033)
Contract lifecycle: draft -> negotiation -> approval -> execution -> renewal/expiry
Clause library, obligation tracking, notice periods, AI contract extraction

### Complaints (port 4032)
Complaint receipt (public submission portal), investigation, resolution, regulatory reporting, SLA tracking

### Suppliers (port 4029)
Supplier qualification, scorecard, performance monitoring, spend analysis, document repository

### Assets (port 4030)
Asset register, depreciation calculation, disposal tracking, work orders, calibration records

### Training (port 4028)
Training needs analysis (TNA), course management, training records, competency matrix, inductions, online learning

### Audits (port 4037)
Audit programme, scheduling, checklists, findings, CAPA linking, programme management

---

## 28. CHEMICALS / COSHH

**Service:** `api-chemicals` | **Port:** 4040 | **Web:** `web-chemicals` (port 3044, 12 pages)
**Schema:** `chemicals.prisma` — 9 models, 17 enums

### Features & Endpoints

- **Chemical Inventory:** Full register with quantities, storage locations, hazard classifications (GHS)
- **SDS Management:** Safety Data Sheet storage, version control, expiry alerts
- **COSHH Assessments:** Risk assessments per substance/activity, control measures, WEL comparison
- **Disposal Records:** Hazardous waste disposal with waste carrier documentation
- **Exposure Monitoring:** Personal monitoring results, biological monitoring
- **Incidents:** Chemical spill/exposure incident recording
- **Analytics:** Chemical usage trends, cost analysis, SDS compliance dashboard
- **Alerts:** Expiry alerts (SDS, assessments), incompatible storage warnings, low stock

---

## 29. EMERGENCY MANAGEMENT

**Service:** `api-emergency` | **Port:** 4041 | **Web:** `web-emergency` (port 3045, 14 pages)
**Schema:** `emergency.prisma` — 16 models, 10 enums

### Features & Endpoints

- **BCP (Business Continuity Plans):** Plan authoring, activation, exercise records
- **DRP (Disaster Recovery Plans):** IT recovery procedures, RTO/RPO objectives
- **Drills:** Emergency drill scheduling, execution, effectiveness review
- **Equipment:** Fire extinguishers, AEDs, first aid kits — inspection schedules
- **Fire Wardens:** Warden register, training records, building allocation
- **Premises:** Building/site register with floor plans, evacuation routes
- **PEEP:** Personal Emergency Evacuation Plans for vulnerable persons
- **Fire Risk Assessments:** Structured FRA with action plans
- **Incidents:** Emergency incident management (GOLD/SILVER/BRONZE command)
- **Analytics:** Drill compliance, equipment inspection rates, BCP currency

---

## 30-42. ADDITIONAL MODULES

### ISO 42001 — AI Management System (port 4023)
AI system register, algorithmic impact assessments, AI risk management, human review workflows, policy governance, incident reporting for AI failures

### ISO 37001 — Anti-Bribery (port 4024)
Policy management, third-party due diligence, gifts & hospitality register, investigation tracking, compliance monitoring, training records

### Analytics & BI (port 4021)
Custom dashboards, KPI tracking, NLQ (natural language queries), anomaly detection, predictions, executive dashboards, board packs, scheduled reports

### AI Analysis (port 4004)
Text analysis (OpenAI/Anthropic), compliance gap analysis, predictive risk, document classification, conversational assistant, NLQ

### Portal — Customer & Supplier (port 4018)
Customer/supplier self-service: raise NCRs, view documents, submit surveys, track orders, manage qualifications

### Partners (port 4026)
Partner portal: referral tracking, commission calculation, partner resources, support tickets

### Marketing (port 4025)
Lead tracking, growth analytics, ROI calculation, health scores, onboarding journeys, renewal management, LinkedIn tracker, Stripe billing integration

### Regulatory Monitor (port 4035)
Regulatory change feed (`@ims/regulatory-feed`), obligation mapping, compliance assessment, automated alerts

### Permit to Work (port 4034)
PTW lifecycle: request -> safety officer approval -> active work -> completion -> close-out. Method statements, toolbox talk records.

### Management Review (port 4038)
Cross-module management review meeting minutes, agenda generation, action tracking (links to quality, H&S, environment MR routes)

### Incidents (RIDDOR — port 4036)
RIDDOR-specific reporting, investigation workflow, timeline recording, dashboard with regulatory submission tracking

---

## PLATFORM FEATURES (API Gateway — port 4000)

### Authentication & Identity
- JWT Bearer tokens (15min access, 7-day refresh)
- Multi-Factor Authentication (TOTP)
- Magic link passwordless login
- SAML 2.0 SSO (Prisma-backed, per-org)
- SCIM 2.0 user provisioning (Prisma-backed)
- Account lockout (5 attempts / 15min)
- Adaptive risk scoring (IP + geo + device + time)
- API key management (Prisma-backed, scoped)

### User & Organization Management
- User CRUD with role assignment
- Custom roles (39 built-in + unlimited custom)
- 17 permission modules x 7 levels
- Organization branding (logo, colors, name)
- Multi-tenancy (orgId on all records)
- MSP (Multi-Service Provider) tenant links

### Compliance & Reporting
- Compliance calendar (regulatory deadlines)
- Compliance scores (per module, auto-calculated)
- Cross-module compliance summary
- 192 built-in document templates (34 modules)
- Scheduled report automation
- CSV bulk import

### Platform Integrations
- Webhooks (outbound, retry logic)
- Marketplace integrations
- GDPR consent management (cookie banner)
- DSAR workflow (Data Subject Access Requests)
- DPA management (Data Processing Agreements)
- Electronic signatures (21 CFR Part 11)
- NPS surveys

### Developer Features
- OpenAPI specification (`GET /api/openapi`)
- SDK v2.0 (`@ims/sdk`)
- REST API versioning (`/api/v1/` prefix)
- API key authentication

### Security & Governance
- IP allowlist (per-org)
- Unified audit plan (cross-service)
- Enhanced audit trail (tamper-evident)
- E-signature workflow
- Security controls dashboard
- Session management (view/revoke active sessions)

### Collaboration
- Threaded comments (any entity)
- Cross-module task management
- Real-time presence (WebSocket)
- Activity feed
- In-app + email + push notifications (WebSocket-backed)

### Platform Operations
- Feature flags (per-org toggle)
- Automation rules (no-code)
- Platform status page
- Changelog
- Setup wizard (onboarding)

---

*Document generated: February 21, 2026*
*Coverage: 42 services, 2,558 endpoints, 606 database models*
