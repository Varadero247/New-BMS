// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
import { IsControlImplementationStatus } from '@ims/database/infosec';
import { z } from 'zod';

const logger = createLogger('api-infosec');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

const RESERVED_PATHS = new Set(['soa']);

// ---------------------------------------------------------------------------
// Minimal PDF-1.4 builder (no external dependencies)
// ---------------------------------------------------------------------------

function pdfEsc(s: string): string {
  return String(s || '')
    .replace(/[^\x20-\x7e]/g, '?') // strip non-printable ASCII
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

interface PdfPage {
  ops: string[];
}

interface SoaControl { controlId?: string; title?: string; domain?: string; applicability?: string; implementationStatus?: string }
function buildSoaPdf(controls: SoaControl[], generatedAt: string): Buffer {
  const W = 595,
    H = 842,
    ML = 40,
    MB = 45,
    LH = 13;
  const pages: PdfPage[] = [];
  let ops: string[] = [];
  let y = H - 50;

  const newPage = () => {
    pages.push({ ops: [...ops] });
    ops = [];
    y = H - 50;
  };
  const checkY = () => {
    if (y < MB + LH) newPage();
  };

  const txt = (s: string, x: number, size = 9, bold = false) => {
    ops.push(`BT /${bold ? 'F2' : 'F1'} ${size} Tf ${x} ${y} Td (${pdfEsc(s)}) Tj ET`);
  };
  const hline = () => {
    ops.push(`0.5 w 0.5 G ${ML} ${y + 4} m ${W - 40} ${y + 4} l S 0 G`);
  };
  const nl = (n = 1) => {
    y -= LH * n;
    checkY();
  };

  // Title header
  txt('Statement of Applicability - ISO 27001:2022', ML, 14, true);
  nl(1.5);
  txt(`Generated: ${generatedAt.substring(0, 19).replace('T', ' ')} UTC`, ML, 9);
  nl();
  txt(`Total controls: ${controls.length}`, ML, 9);
  nl(1.5);

  // Summary bar
  const ap = controls.filter((c) => c.applicability === 'APPLICABLE').length;
  const na = controls.filter((c) => c.applicability === 'NOT_APPLICABLE').length;
  const fi = controls.filter((c) => c.implementationStatus === 'FULLY_IMPLEMENTED').length;
  const pi = controls.filter((c) => c.implementationStatus === 'PARTIALLY_IMPLEMENTED').length;
  const ni = controls.filter((c) => c.implementationStatus === 'NOT_IMPLEMENTED').length;
  txt('Summary', ML, 10, true);
  nl();
  txt(`Applicable: ${ap}`, ML, 9);
  txt(`Not Applicable: ${na}`, ML + 110, 9);
  txt(`Fully Implemented: ${fi}`, ML + 220, 9);
  txt(`Partially Implemented: ${pi}`, ML + 360, 9);
  txt(`Not Implemented: ${ni}`, ML + 470, 9);
  nl(2);

  // Table header
  hline();
  nl();
  txt('Control ID', ML, 8, true);
  txt('Title', ML + 65, 8, true);
  txt('Domain', ML + 255, 8, true);
  txt('Applicable', ML + 355, 8, true);
  txt('Status', ML + 440, 8, true);
  hline();
  nl();

  for (const ctrl of controls) {
    checkY();
    const id = (ctrl.controlId || '').substring(0, 10);
    const title = (ctrl.title || '').substring(0, 28);
    const domain = (ctrl.domain || '').substring(0, 14);
    const applic = ctrl.applicability === 'APPLICABLE' ? 'Yes' : 'No';
    const status = (ctrl.implementationStatus || 'N/A').replace(/_/g, ' ').substring(0, 14);
    txt(id, ML, 8);
    txt(title, ML + 65, 8);
    txt(domain, ML + 255, 8);
    txt(applic, ML + 355, 8);
    txt(status, ML + 440, 8);
    nl();
  }

  if (ops.length > 0) pages.push({ ops: [...ops] });

  // --- Assemble PDF binary ---
  // Objects: 1=Catalog, 2=Pages, 3=Font(Reg), 4=Font(Bold), 5..4+N=ContentStreams, 5+N..4+2N=PageObjs
  const N = pages.length;
  const contentBase = 5;
  const pageBase = 5 + N;

  const objDefs: string[] = [
    `<< /Type /Catalog /Pages 2 0 R >>`,
    `<< /Type /Pages /Kids [${Array.from({ length: N }, (_, i) => `${pageBase + i} 0 R`).join(' ')}] /Count ${N} >>`,
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`,
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`,
    ...pages.map((p) => {
      const s = p.ops.join('\n');
      return `<< /Length ${Buffer.byteLength(s, 'latin1')} >>\nstream\n${s}\nendstream`;
    }),
    ...pages.map(
      (_, i) =>
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${contentBase + i} 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> >>`
    ),
  ];

  const hdr = Buffer.from('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n', 'binary');
  const parts: Buffer[] = [hdr];
  const offsets: number[] = [];
  let pos = hdr.length;

  for (let i = 0; i < objDefs.length; i++) {
    offsets.push(pos);
    const chunk = Buffer.from(`${i + 1} 0 obj\n${objDefs[i]}\nendobj\n`, 'latin1');
    parts.push(chunk);
    pos += chunk.length;
  }

  const xrefPos = pos;
  const xrefEntries = offsets.map((o) => o.toString().padStart(10, '0') + ' 00000 n \n').join('');
  const tail = Buffer.from(
    `xref\n0 ${objDefs.length + 1}\n0000000000 65535 f \n${xrefEntries}` +
      `trailer\n<< /Size ${objDefs.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`,
    'latin1'
  );
  parts.push(tail);

  return Buffer.concat(parts);
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const statusUpdateSchema = z.object({
  applicability: z.enum(['APPLICABLE', 'NOT_APPLICABLE']),
  justification: z.string().trim().min(1).max(2000),
});

const implementationUpdateSchema = z.object({
  implementationStatus: z.enum([
    'NOT_IMPLEMENTED',
    'PARTIALLY_IMPLEMENTED',
    'FULLY_IMPLEMENTED',
    'NOT_APPLICABLE',
  ]),
  implementationNotes: z.string().trim().max(5000).optional(),
  evidence: z.string().trim().max(5000).optional(),
  owner: z.string().trim().max(200).optional(),
  reviewDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
});

// ---------------------------------------------------------------------------
// GET / — List all controls with status
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { domain, implementationStatus, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (domain && typeof domain === 'string') {
      where.domain = domain;
    }
    if (implementationStatus && typeof implementationStatus === 'string') {
      where.implementationStatus = implementationStatus;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { controlId: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [controls, total] = await Promise.all([
      prisma.isControl.findMany({
        where,
        skip,
        take: limit,
        orderBy: { controlId: 'asc' },
      }),
      prisma.isControl.count({ where }),
    ]);

    res.json({
      success: true,
      data: controls,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list controls', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list controls' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /soa — Statement of Applicability
// ---------------------------------------------------------------------------
router.get('/soa', async (_req: Request, res: Response) => {
  try {
    const controls = await prisma.isControl.findMany({
      orderBy: { controlId: 'asc' },
      take: 200,
      select: {
        id: true,
        controlId: true,
        domain: true,
        title: true,
        description: true,
        applicability: true,
        justification: true,
        implementationStatus: true,
        owner: true,
      },
    });

    const summary = {
      total: controls.length,
      applicable: controls.filter((c) => c.applicability === 'APPLICABLE').length,
      notApplicable: controls.filter((c) => c.applicability === 'NOT_APPLICABLE').length,
      fullyImplemented: controls.filter(
        (c) => c.implementationStatus === 'IMPLEMENTED'
      ).length,
      partiallyImplemented: controls.filter(
        (c) => c.implementationStatus === 'PARTIAL'
      ).length,
      notImplemented: controls.filter((c) => c.implementationStatus === 'NOT_STARTED')
        .length,
    };

    res.json({ success: true, data: { controls, summary } });
  } catch (error: unknown) {
    logger.error('Failed to get Statement of Applicability', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get Statement of Applicability' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /soa/pdf — Mock PDF export
// ---------------------------------------------------------------------------
router.get('/soa/pdf', async (_req: Request, res: Response) => {
  try {
    const controls = await prisma.isControl.findMany({
      orderBy: { controlId: 'asc' },
      take: 200,
      select: {
        controlId: true,
        domain: true,
        title: true,
        applicability: true,
        justification: true,
        implementationStatus: true,
        owner: true,
      },
    });

    const generatedAt = new Date().toISOString();
    const pdfBuffer = buildSoaPdf(controls, generatedAt);
    const filename = `soa-iso27001-${generatedAt.substring(0, 10)}.pdf`;

    res
      .status(200)
      .set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdfBuffer.length),
        'Cache-Control': 'no-store',
      })
      .end(pdfBuffer);
  } catch (error: unknown) {
    logger.error('Failed to generate SoA PDF', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate SoA PDF' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Control detail
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;

    const control = await prisma.isControl.findUnique({
      where: { id },
    });

    if (!control) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Control not found' } });
    }

    res.json({ success: true, data: control });
  } catch (error: unknown) {
    logger.error('Failed to get control', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get control' },
    });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id/status — Update applicability
// ---------------------------------------------------------------------------
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = statusUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Validation failed' },
        details: parsed.error.flatten(),
      });
    }

    const existing = await prisma.isControl.findUnique({ where: { id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Control not found' } });
    }

    const authReq = req as AuthRequest;
    const control = await prisma.isControl.update({
      where: { id },
      data: {
        applicability: parsed.data.applicability,
        justification: parsed.data.justification,
        updatedAt: new Date(),
      },
    });

    logger.info('Control applicability updated', {
      controlId: id,
      applicability: parsed.data.applicability,
    });
    res.json({ success: true, data: control });
  } catch (error: unknown) {
    logger.error('Failed to update control status', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update control status' },
    });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id/implementation — Update implementation details
// ---------------------------------------------------------------------------
router.put('/:id/implementation', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = implementationUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Validation failed' },
        details: parsed.error.flatten(),
      });
    }

    const existing = await prisma.isControl.findUnique({ where: { id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Control not found' } });
    }

    const authReq = req as AuthRequest;
    const control = await prisma.isControl.update({
      where: { id },
      data: {
        implementationStatus: parsed.data.implementationStatus as IsControlImplementationStatus,
        implementationNotes: parsed.data.implementationNotes || null,
        evidence: parsed.data.evidence || null,
        owner: parsed.data.owner || null,
        reviewDate: parsed.data.reviewDate ? new Date(parsed.data.reviewDate) : null,
        updatedBy: authReq.user?.id,
        updatedAt: new Date(),
      },
    });

    logger.info('Control implementation updated', {
      controlId: id,
      status: parsed.data.implementationStatus,
    });
    res.json({ success: true, data: control });
  } catch (error: unknown) {
    logger.error('Failed to update control implementation', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update control implementation' },
    });
  }
});

export default router;
