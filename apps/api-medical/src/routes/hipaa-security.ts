// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { z } from 'zod';
import { HipaaSecurityCategory } from '@ims/database/medical';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@ims/monitoring';
import { validateIdParam, parsePagination } from '@ims/shared';

const logger = createLogger('api-medical');
const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

const HIPAA_SECURITY_SPECS = [
  { cfr45Section: '164.308(a)(1)(ii)(A)', category: 'ADMINISTRATIVE', specification: 'Required', title: 'Risk Analysis', description: 'Conduct accurate and thorough assessment of potential risks and vulnerabilities to the confidentiality, integrity, and availability of ePHI.' },
  { cfr45Section: '164.308(a)(1)(ii)(B)', category: 'ADMINISTRATIVE', specification: 'Required', title: 'Risk Management', description: 'Implement security measures sufficient to reduce risks and vulnerabilities to a reasonable and appropriate level.' },
  { cfr45Section: '164.308(a)(1)(ii)(C)', category: 'ADMINISTRATIVE', specification: 'Required', title: 'Sanction Policy', description: 'Apply appropriate sanctions against workforce members who fail to comply with security policies and procedures.' },
  { cfr45Section: '164.308(a)(1)(ii)(D)', category: 'ADMINISTRATIVE', specification: 'Required', title: 'Information System Activity Review', description: 'Implement procedures to regularly review records of information system activity.' },
  { cfr45Section: '164.308(a)(2)', category: 'ADMINISTRATIVE', specification: 'Required', title: 'Assigned Security Responsibility', description: 'Identify the security official responsible for developing and implementing security policies and procedures.' },
  { cfr45Section: '164.308(a)(3)(ii)(A)', category: 'ADMINISTRATIVE', specification: 'Addressable', title: 'Authorization and/or Supervision', description: 'Implement procedures for the authorization and/or supervision of workforce members who work with ePHI.' },
  { cfr45Section: '164.308(a)(3)(ii)(B)', category: 'ADMINISTRATIVE', specification: 'Addressable', title: 'Workforce Clearance Procedure', description: 'Implement procedures to determine whether workforce member access to ePHI is appropriate.' },
  { cfr45Section: '164.308(a)(3)(ii)(C)', category: 'ADMINISTRATIVE', specification: 'Addressable', title: 'Termination Procedures', description: 'Implement procedures for terminating access to ePHI when employment ends.' },
  { cfr45Section: '164.308(a)(4)(ii)(B)', category: 'ADMINISTRATIVE', specification: 'Addressable', title: 'Access Authorization', description: 'Implement policies and procedures for granting access to ePHI.' },
  { cfr45Section: '164.308(a)(4)(ii)(C)', category: 'ADMINISTRATIVE', specification: 'Addressable', title: 'Access Establishment and Modification', description: 'Implement policies and procedures that establish and modify access based on workforce member roles.' },
  { cfr45Section: '164.308(a)(5)(ii)(A)', category: 'ADMINISTRATIVE', specification: 'Addressable', title: 'Security Reminders', description: 'Periodic security updates for workforce members.' },
  { cfr45Section: '164.308(a)(5)(ii)(B)', category: 'ADMINISTRATIVE', specification: 'Addressable', title: 'Protection from Malicious Software', description: 'Procedures for guarding against, detecting, and reporting malicious software.' },
  { cfr45Section: '164.308(a)(5)(ii)(C)', category: 'ADMINISTRATIVE', specification: 'Addressable', title: 'Log-in Monitoring', description: 'Procedures for monitoring log-in attempts and reporting discrepancies.' },
  { cfr45Section: '164.308(a)(5)(ii)(D)', category: 'ADMINISTRATIVE', specification: 'Addressable', title: 'Password Management', description: 'Procedures for creating, changing, and safeguarding passwords.' },
  { cfr45Section: '164.308(a)(6)(ii)', category: 'ADMINISTRATIVE', specification: 'Required', title: 'Response and Reporting', description: 'Identify and respond to suspected or known security incidents; mitigate harmful effects; document incidents and outcomes.' },
  { cfr45Section: '164.308(a)(7)(ii)(A)', category: 'ADMINISTRATIVE', specification: 'Required', title: 'Data Backup Plan', description: 'Establish and implement procedures to create and maintain retrievable copies of ePHI.' },
  { cfr45Section: '164.308(a)(7)(ii)(B)', category: 'ADMINISTRATIVE', specification: 'Required', title: 'Disaster Recovery Plan', description: 'Establish and implement procedures to restore loss of data.' },
  { cfr45Section: '164.308(a)(7)(ii)(C)', category: 'ADMINISTRATIVE', specification: 'Required', title: 'Emergency Mode Operation Plan', description: 'Enable continuation of critical business processes during emergencies.' },
  { cfr45Section: '164.308(a)(7)(ii)(D)', category: 'ADMINISTRATIVE', specification: 'Addressable', title: 'Testing and Revision Procedures', description: 'Implement procedures for periodic testing and revision of contingency plans.' },
  { cfr45Section: '164.308(a)(7)(ii)(E)', category: 'ADMINISTRATIVE', specification: 'Addressable', title: 'Applications and Data Criticality Analysis', description: 'Assess the relative criticality of specific applications and data.' },
  { cfr45Section: '164.308(a)(8)', category: 'ADMINISTRATIVE', specification: 'Required', title: 'Evaluation', description: 'Perform periodic technical and nontechnical evaluations of security requirements.' },
  { cfr45Section: '164.308(b)(1)', category: 'ADMINISTRATIVE', specification: 'Required', title: 'Business Associate Contracts', description: 'Obtain satisfactory assurances from business associates that they will appropriately safeguard ePHI.' },
  { cfr45Section: '164.310(a)(2)(i)', category: 'PHYSICAL', specification: 'Addressable', title: 'Contingency Operations', description: 'Establish procedures that allow facility access in support of restoration of lost data.' },
  { cfr45Section: '164.310(a)(2)(ii)', category: 'PHYSICAL', specification: 'Required', title: 'Facility Security Plan', description: 'Implement policies and procedures to safeguard the facility from unauthorized physical access.' },
  { cfr45Section: '164.310(a)(2)(iii)', category: 'PHYSICAL', specification: 'Addressable', title: 'Access Control and Validation Procedures', description: 'Implement procedures to control and validate access to facilities based on role or function.' },
  { cfr45Section: '164.310(a)(2)(iv)', category: 'PHYSICAL', specification: 'Addressable', title: 'Maintenance Records', description: 'Document repairs and modifications to physical components of a facility.' },
  { cfr45Section: '164.310(b)', category: 'PHYSICAL', specification: 'Required', title: 'Workstation Use', description: 'Implement policies specifying proper functions to be performed on workstations that access ePHI.' },
  { cfr45Section: '164.310(c)', category: 'PHYSICAL', specification: 'Required', title: 'Workstation Security', description: 'Implement physical safeguards for all workstations that access ePHI.' },
  { cfr45Section: '164.310(d)(2)(i)', category: 'PHYSICAL', specification: 'Required', title: 'Disposal', description: 'Implement policies for final disposition of ePHI and hardware or electronic media.' },
  { cfr45Section: '164.310(d)(2)(ii)', category: 'PHYSICAL', specification: 'Required', title: 'Media Re-Use', description: 'Implement procedures for removal of ePHI from electronic media before re-use.' },
  { cfr45Section: '164.310(d)(2)(iii)', category: 'PHYSICAL', specification: 'Addressable', title: 'Accountability', description: 'Maintain a record of the movements of hardware and electronic media.' },
  { cfr45Section: '164.310(d)(2)(iv)', category: 'PHYSICAL', specification: 'Addressable', title: 'Data Backup and Storage', description: 'Create a retrievable copy of ePHI before movement of equipment.' },
  { cfr45Section: '164.312(a)(2)(i)', category: 'TECHNICAL', specification: 'Required', title: 'Unique User Identification', description: 'Assign a unique name and/or number for identifying and tracking user identity.' },
  { cfr45Section: '164.312(a)(2)(ii)', category: 'TECHNICAL', specification: 'Addressable', title: 'Emergency Access Procedure', description: 'Establish procedures for obtaining necessary ePHI during an emergency.' },
  { cfr45Section: '164.312(a)(2)(iii)', category: 'TECHNICAL', specification: 'Addressable', title: 'Automatic Logoff', description: 'Implement electronic procedures that terminate an electronic session after a predetermined time of inactivity.' },
  { cfr45Section: '164.312(a)(2)(iv)', category: 'TECHNICAL', specification: 'Addressable', title: 'Encryption and Decryption', description: 'Implement a mechanism to encrypt and decrypt ePHI.' },
  { cfr45Section: '164.312(b)', category: 'TECHNICAL', specification: 'Required', title: 'Audit Controls', description: 'Implement hardware, software, and/or procedural mechanisms that record and examine activity in information systems containing ePHI.' },
  { cfr45Section: '164.312(c)(2)', category: 'TECHNICAL', specification: 'Addressable', title: 'Mechanism to Authenticate ePHI', description: 'Implement electronic mechanisms to corroborate that ePHI has not been altered or destroyed in an unauthorized manner.' },
  { cfr45Section: '164.312(d)', category: 'TECHNICAL', specification: 'Required', title: 'Person or Entity Authentication', description: 'Implement procedures to verify that a person or entity seeking access to ePHI is the one claimed.' },
  { cfr45Section: '164.312(e)(2)(i)', category: 'TECHNICAL', specification: 'Addressable', title: 'Integrity Controls', description: 'Implement security measures to ensure that electronically transmitted ePHI is not improperly modified.' },
  { cfr45Section: '164.312(e)(2)(ii)', category: 'TECHNICAL', specification: 'Addressable', title: 'Encryption', description: 'Implement a mechanism to encrypt ePHI whenever deemed appropriate.' },
];

// GET / - list security controls
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, implementationStatus } = req.query;
    const { skip, limit, page } = parsePagination(req.query);
    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (implementationStatus) where.implementationStatus = implementationStatus;
    const [controls, total] = await Promise.all([
      prisma.hipaaSecurityControl.findMany({ where, skip, take: limit, orderBy: { cfr45Section: 'asc' } }),
      prisma.hipaaSecurityControl.count({ where }),
    ]);
    res.json({ success: true, data: controls, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list HIPAA security controls', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list security controls' } });
  }
});

// GET /dashboard - summary by category
router.get('/dashboard', async (_req: Request, res: Response) => {
  try {
    const controls = await prisma.hipaaSecurityControl.findMany();
    const byCategory = (cat: string) => controls.filter((c) => c.category === cat);
    const pct = (arr: typeof controls) =>
      arr.length === 0 ? 0 : Math.round((arr.filter((c) => c.implementationStatus === 'FULLY_IMPLEMENTED').length / arr.length) * 100);
    res.json({
      success: true,
      data: {
        total: controls.length,
        fullyImplemented: controls.filter((c) => c.implementationStatus === 'FULLY_IMPLEMENTED').length,
        partiallyImplemented: controls.filter((c) => c.implementationStatus === 'PARTIALLY_IMPLEMENTED').length,
        notImplemented: controls.filter((c) => c.implementationStatus === 'NOT_IMPLEMENTED').length,
        administrative: { count: byCategory('ADMINISTRATIVE').length, compliancePercent: pct(byCategory('ADMINISTRATIVE')) },
        physical: { count: byCategory('PHYSICAL').length, compliancePercent: pct(byCategory('PHYSICAL')) },
        technical: { count: byCategory('TECHNICAL').length, compliancePercent: pct(byCategory('TECHNICAL')) },
        overallCompliancePercent: pct(controls),
      },
    });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get dashboard' } });
  }
});

// POST /seed - seed all 41 HIPAA security implementation specifications
router.post('/seed', async (_req: Request, res: Response) => {
  try {
    const existing = await prisma.hipaaSecurityControl.count();
    if (existing > 0) {
      return res.json({ success: true, data: { message: 'Controls already seeded', count: existing } });
    }
    await prisma.hipaaSecurityControl.createMany({
      data: HIPAA_SECURITY_SPECS.map((s) => ({ id: uuidv4(), ...s, category: s.category as HipaaSecurityCategory, implementationStatus: 'NOT_IMPLEMENTED' as const })),
      skipDuplicates: true,
    });
    const count = await prisma.hipaaSecurityControl.count();
    logger.info('HIPAA security controls seeded', { count });
    res.status(201).json({ success: true, data: { message: 'HIPAA security controls seeded', count } });
  } catch (error: unknown) {
    logger.error('Failed to seed HIPAA controls', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to seed controls' } });
  }
});

// GET /:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const control = await prisma.hipaaSecurityControl.findUnique({ where: { id: req.params.id } });
    if (!control) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Control not found' } });
    }
    res.json({ success: true, data: control });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get control' } });
  }
});

// PUT /:id/implementation - update implementation status
router.put('/:id/implementation', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.hipaaSecurityControl.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Control not found' } });
    }
    const schema = z.object({
      implementationStatus: z.enum(['NOT_IMPLEMENTED', 'PARTIALLY_IMPLEMENTED', 'FULLY_IMPLEMENTED', 'NOT_APPLICABLE']),
      implementationNotes: z.string().trim().optional(),
      evidence: z.string().trim().optional(),
      owner: z.string().trim().optional(),
      riskIfNotImplemented: z.string().trim().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const updated = await prisma.hipaaSecurityControl.update({
      where: { id: req.params.id },
      data: { ...parsed.data, lastAssessed: new Date() },
    });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update implementation' } });
  }
});

export default router;
