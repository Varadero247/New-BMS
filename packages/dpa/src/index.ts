/**
 * @ims/dpa — Data Processing Agreement (DPA) Engine
 *
 * Manages DPA documents and organisation acceptance records.
 */

import { v4 as uuidv4 } from 'uuid';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DpaDocument {
  id: string;
  version: string;
  title: string;
  content: string;
  effectiveDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface DpaAcceptance {
  id: string;
  orgId: string;
  dpaId: string;
  dpaVersion: string;
  userId: string;
  signerName: string;
  signerTitle: string;
  signature: string | null;
  acceptedAt: string;
  ipAddress: string | null;
}

export interface AcceptDpaParams {
  orgId: string;
  userId: string;
  signerName: string;
  signerTitle: string;
  signature?: string;
  ipAddress?: string;
}

// ─── In-Memory Stores ───────────────────────────────────────────────────────

const dpaDocuments = new Map<string, DpaDocument>();
const dpaAcceptances = new Map<string, DpaAcceptance>(); // keyed by orgId

// ─── Seed DPA v1.0 ─────────────────────────────────────────────────────────

const DPA_V1_ID = uuidv4();

dpaDocuments.set(DPA_V1_ID, {
  id: DPA_V1_ID,
  version: '1.0',
  title: 'Data Processing Agreement',
  content: `DATA PROCESSING AGREEMENT (DPA)
Version 1.0 — Effective Date: 1 January 2026

This Data Processing Agreement ("Agreement") is entered into between the Organisation ("Controller") and IMS Platform Ltd ("Processor").

1. DEFINITIONS
1.1 "Personal Data" means any information relating to an identified or identifiable natural person.
1.2 "Processing" means any operation performed on Personal Data, including collection, recording, organisation, structuring, storage, adaptation, retrieval, consultation, use, disclosure, combination, restriction, erasure or destruction.
1.3 "Data Subject" means the identified or identifiable natural person to whom the Personal Data relates.
1.4 "Sub-processor" means any third party engaged by the Processor to process Personal Data on behalf of the Controller.

2. SCOPE AND PURPOSE
2.1 The Processor shall process Personal Data only on documented instructions from the Controller, including with regard to transfers of Personal Data to a third country, unless required by law.
2.2 The categories of Personal Data processed include: employee records, contact information, health & safety records, training records, audit findings, and incident reports.
2.3 The purpose of processing is to provide integrated management system services as described in the Service Agreement.

3. OBLIGATIONS OF THE PROCESSOR
3.1 The Processor shall implement appropriate technical and organisational measures to ensure a level of security appropriate to the risk.
3.2 The Processor shall ensure that persons authorised to process Personal Data have committed themselves to confidentiality.
3.3 The Processor shall assist the Controller in responding to requests for exercising the Data Subject's rights (access, rectification, erasure, portability).
3.4 The Processor shall make available to the Controller all information necessary to demonstrate compliance with these obligations.
3.5 The Processor shall notify the Controller without undue delay after becoming aware of a Personal Data breach.

4. SUB-PROCESSING
4.1 The Processor shall not engage another processor without prior specific or general written authorisation of the Controller.
4.2 Where the Processor engages a Sub-processor, the same data protection obligations shall be imposed on the Sub-processor.

5. DATA TRANSFERS
5.1 Any transfer of Personal Data to a third country shall only take place subject to appropriate safeguards in accordance with applicable data protection law.

6. DATA RETENTION AND DELETION
6.1 Upon termination of the Service Agreement, the Processor shall, at the choice of the Controller, delete or return all Personal Data and delete existing copies unless retention is required by law.

7. AUDIT RIGHTS
7.1 The Processor shall allow for and contribute to audits, including inspections, conducted by the Controller or an auditor mandated by the Controller.

8. DURATION
8.1 This Agreement shall remain in force for the duration of the Service Agreement between the parties.

9. GOVERNING LAW
9.1 This Agreement shall be governed by the laws of the jurisdiction specified in the Service Agreement.`,
  effectiveDate: '2026-01-01',
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
});

// ─── Public API ─────────────────────────────────────────────────────────────

export function getActiveDpa(): DpaDocument | null {
  for (const doc of dpaDocuments.values()) {
    if (doc.isActive) return doc;
  }
  return null;
}

export function getDpaById(id: string): DpaDocument | undefined {
  return dpaDocuments.get(id);
}

export function acceptDpa(params: AcceptDpaParams): DpaAcceptance | null {
  const activeDpa = getActiveDpa();
  if (!activeDpa) return null;

  const acceptance: DpaAcceptance = {
    id: uuidv4(),
    orgId: params.orgId,
    dpaId: activeDpa.id,
    dpaVersion: activeDpa.version,
    userId: params.userId,
    signerName: params.signerName,
    signerTitle: params.signerTitle,
    signature: params.signature || null,
    acceptedAt: new Date().toISOString(),
    ipAddress: params.ipAddress || null,
  };

  dpaAcceptances.set(params.orgId, acceptance);
  return acceptance;
}

export function hasAcceptedDpa(orgId: string): boolean {
  const acceptance = dpaAcceptances.get(orgId);
  if (!acceptance) return false;

  const activeDpa = getActiveDpa();
  if (!activeDpa) return false;

  // Check if the acceptance is for the current active version
  return acceptance.dpaVersion === activeDpa.version;
}

export function getDpaAcceptance(orgId: string): DpaAcceptance | null {
  return dpaAcceptances.get(orgId) || null;
}
