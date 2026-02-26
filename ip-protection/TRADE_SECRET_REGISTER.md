# Nexara DMCC — Trade Secret Register
**Classification:** CONFIDENTIAL — TRADE SECRET  
**Owner:** Nexara DMCC, Dubai Multi Commodities Centre  
**Date Created:** 2026-02-23  
**Review Date:** 2026-05-23  
**Document Version:** 1.0

---

> **ACCESS RESTRICTION:** This document is accessible only to: Founder/Director, Legal Counsel, DMCC Accountant.
> All recipients must have signed an NDA referencing this register.

---

## Purpose

This register formally identifies and records the trade secrets of Nexara DMCC for the purposes of legal protection under UAE Federal Law No. 37 of 1992 on Commercial Agencies, UAE Federal Law No. 31 of 2006 on Industrial Property, and applicable international trade secret law (TRIPS Agreement Article 39).

---

## Trade Secrets Register

### 1. Cross-Standard Convergence Engine
- **Location:** `packages/standards-convergence/`
- **Description:** A proprietary engine that maps compliance requirements across multiple international management system standards (ISO 9001, ISO 14001, ISO 45001, ISO 27001, ISO 50001, ISO 42001, ISO 37001, and others) to identify shared controls, evidence reuse opportunities, and gap analyses. The engine contains a hand-curated cross-reference matrix of clause-level mappings across 12+ standards.
- **What makes it secret:** The specific clause-mapping methodology, weighting algorithms for cross-standard equivalence, and the curated database of inter-standard relationships represent years of domain expertise not publicly documented in this form.
- **Protection measures:** No public documentation; NDA required for access; source code access control; not described in any public API documentation.
- **Commercial value:** Enables simultaneous multi-standard compliance — a unique differentiator in the GCC market.

### 2. Multi-Tenant RBAC Architecture
- **Location:** `packages/rbac/`
- **Description:** A role-based access control system with 39 predefined roles across 17 functional modules, 7 permission levels (NONE, READ, WRITE, APPROVE, ADMIN, AUDIT, SUPERADMIN), and organisation-scoped permission inheritance. The architecture supports per-tenant role customisation while maintaining a secure global permission boundary.
- **What makes it secret:** The specific 39-role hierarchy, permission matrix design, and the organisation-scoping mechanism represent proprietary UX and security research into enterprise SaaS permission design.
- **Protection measures:** NDA; no public role/permission documentation; internal design documents restricted.
- **Commercial value:** Enables enterprise-grade access control out-of-the-box, reducing customer deployment complexity.

### 3. Database Schema Architecture
- **Location:** `packages/database/prisma/schemas/`
- **Description:** 44 domain-specific Prisma schemas comprising approximately 590 database models and 781 enums, implementing a multi-tenant architecture with row-level security (RLS) across all tables. Each schema is isolated per domain with named environment variables, preventing cross-domain data leakage. The overall schema design encodes a complete compliance management ontology.
- **What makes it secret:** The specific data model design for compliance domains (risk, incident, audit, corrective action, legal obligation, etc.), the RLS implementation patterns, and the multi-schema isolation approach represent proprietary data architecture not available in any open-source compliance solution.
- **Protection measures:** No public schema documentation; database credentials restricted; RLS policies enforce access at the PostgreSQL level.
- **Commercial value:** The compliance data ontology is the foundation of all IMS functionality.

### 4. AI Root Cause Analysis Methodology
- **Location:** `apps/api-ai-analysis/`
- **Description:** A proprietary AI analysis service (port 4004) that applies structured root cause analysis to incidents, non-conformances, and corrective actions. The service constructs domain-aware context from multiple related records, applies multi-stage prompting with confidence scoring, and returns structured analysis with supporting evidence references.
- **What makes it secret:** The specific prompt architecture, context construction algorithm, confidence scoring thresholds, and domain-specific analysis templates represent proprietary AI engineering not disclosed publicly.
- **Protection measures:** API key authentication; no public documentation of prompting strategy; model configuration restricted.
- **Commercial value:** AI-assisted compliance analysis is a premium tier feature differentiator.

### 5. Pricing Algorithm and Tier Structure
- **Location:** Internal documentation only (not in source code)
- **Description:** GCC-optimised SaaS pricing model using seat-based Annual Contract Value (ACV) calculations with module-based tier triggers, multi-currency support (AED, SAR, USD), volume discount thresholds, and implementation fee schedules.
- **What makes it secret:** Competitive pricing intelligence, margin structure, GCC market positioning data, and tier upgrade trigger logic represent sensitive commercial intelligence.
- **Protection measures:** Not stored in source code; restricted to Founder and Finance personnel only.
- **Commercial value:** Directly determines revenue per customer and competitive positioning.

### 6. Performance Optimisation Architecture
- **Location:** `packages/performance/`, `apps/api-gateway/`
- **Description:** The API gateway implements proprietary circuit breaker patterns, request hedging for critical paths, stale-while-revalidate cache strategies, and adaptive rate limiting algorithms. The k6 load test scenarios encode the performance benchmarks that define acceptable system behaviour.
- **What makes it secret:** The specific circuit breaker thresholds, hedging window configurations, cache TTL strategies per endpoint type, and rate limit tier configurations represent operational intelligence built from production experience.
- **Protection measures:** Configuration values not publicly documented; performance test scenarios access-controlled.
- **Commercial value:** Enables guaranteed SLAs which are a key enterprise sales requirement.

### 7. Emission Factor Database and GHG Calculation Methodology
- **Location:** `packages/emission-factors/`
- **Description:** A proprietary database of greenhouse gas emission factors curated and validated for GCC industry sectors, combined with a calculation engine implementing Scope 1/2/3 emissions quantification per GHG Protocol.
- **What makes it secret:** The GCC-specific emission factors, sector-weighting methodologies, and calculation engine configuration represent significant domain research specific to the UAE/GCC regulatory context.
- **Protection measures:** NDA; no public documentation of factor sources; access-controlled package.
- **Commercial value:** Accurate GCC-specific emissions calculation is required for ESG reporting in the region.

### 8. Financial Calculation Engine
- **Location:** `packages/finance-calculations/`, `packages/tax-engine/`
- **Description:** A multi-jurisdiction financial calculation engine supporting AED, SAR, QAR, KWD, BHD, OMR, and USD currencies with VAT calculation (UAE 5%, Saudi 15%), Zakat computation, and regulatory financial reporting templates for GCC jurisdictions.
- **What makes it secret:** The multi-jurisdiction tax logic, VAT/Zakat reconciliation algorithms, and GCC-specific financial reporting formats represent proprietary implementation of complex regulatory requirements.
- **Protection measures:** NDA; access-controlled package; no public documentation of calculation methodology.
- **Commercial value:** Multi-jurisdiction GCC financial compliance is a key feature for regional enterprise customers.

### 9. Natural Language Query Engine
- **Location:** `packages/nlq/`
- **Description:** A proprietary engine that translates natural language queries from non-technical compliance personnel into structured database queries across the 44-schema IMS data model. The engine includes domain-specific intent recognition tuned to compliance and HSE terminology.
- **What makes it secret:** The intent recognition models, query translation methodology, and domain vocabulary represent proprietary NLP engineering.
- **Protection measures:** NDA; package access-controlled; no public documentation.
- **Commercial value:** Enables non-technical users to query compliance data — a significant UX differentiator.

### 10. OEE (Overall Equipment Effectiveness) Engine
- **Location:** `packages/oee-engine/`
- **Description:** A proprietary Overall Equipment Effectiveness calculation engine for maintenance and asset management, implementing Availability x Performance x Quality metrics with industry-sector-specific benchmarks for GCC manufacturing.
- **What makes it secret:** The specific benchmark data, calculation methodology for complex multi-shift environments, and integration with the CMMS domain represent proprietary industrial knowledge.
- **Protection measures:** NDA; access-controlled; not publicly documented.
- **Commercial value:** Real-time OEE calculation is a premium CMMS feature.

---

## Maintenance Schedule

Update this register whenever:
- New architectural patterns are developed
- AI methodology is refined
- Pricing models are changed
- Significant new features are released that embody novel technical approaches
- New jurisdictions or calculation methodologies are added

**Next mandatory review:** 2026-05-23

---

## Legal Basis

This register supports claims under:
1. **UAE Federal Law No. 31 of 2006** on Industrial Property (Trade Secrets, Chapter 6)
2. **TRIPS Agreement Article 39** — Protection of Undisclosed Information
3. **DIFC Law No. 2 of 2019** — Data Protection Law (as supplementary protection)
4. **Common law confidentiality obligations** (applicable in DIFC courts)

---

*© 2026 Nexara DMCC — CONFIDENTIAL — TRADE SECRET*  
*Unauthorised disclosure may constitute a criminal offence under UAE law.*
